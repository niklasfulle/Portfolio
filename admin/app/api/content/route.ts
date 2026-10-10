import { NextResponse } from "next/server";
import { z } from "zod";
import { contentSchema } from "@/lib/admin-content-schema";
import { getAdminDatabase } from "@admin/lib/database";
import { requestPortfolioContent } from "@admin/lib/portfolio-api";
import { getAdminSession } from "@admin/lib/require-admin-session";
import { forbiddenOriginResponse, isTrustedMutationOrigin } from "@admin/lib/csrf";
import { isAdminMutationLimited, rateLimitedResponse } from "@admin/lib/admin-mutation-limit";
import { CONTENT_SECTIONS } from "@admin/lib/content-sections";
import { savePortfolioDraft } from "@admin/lib/content-workflows";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  expectedVersion: z.number().int().min(0),
  sourceVersion: z.number().int().min(0),
  content: contentSchema,
}).strict();

const MAX_BODY_BYTES = 1_000_000;

async function readJson(request: Request) {
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) throw new RangeError();
  if (!request.body) throw new SyntaxError();
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let body = "";
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RangeError();
    }
    body += decoder.decode(value, { stream: true });
  }
  body += decoder.decode();
  return JSON.parse(body) as unknown;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Authentication with MFA is required." }, { status: 401 });
  }
  const database = getAdminDatabase();
  let response: Response;
  let result: { content: unknown; version: number };
  try {
    const contentResponse = await requestPortfolioContent("GET", session.user.id);
    response = contentResponse.response;
    result = contentResponse.result as { content: unknown; version: number };
  } catch {
    return NextResponse.json(
      { message: "Portfolio content could not be loaded." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!response.ok) {
    return NextResponse.json(
      { message: "Portfolio content could not be loaded." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  const [draftResult, stateResult] = await Promise.all([
    database.query(
      "SELECT id, payload, version, source_version, published_version, published_draft_version, updated_at, published_at FROM content_draft",
    ),
    database.query("SELECT version, published_version, updated_at FROM content_draft_state WHERE id = 'portfolio'"),
  ]);
  const drafts = new Map(draftResult.rows.map((row) => [row.id, row]));
  const content = { ...(result.content as Record<string, unknown>) };
  for (const section of CONTENT_SECTIONS) {
    const draft = drafts.get(section);
    if (draft && draft.version > draft.published_draft_version) content[section] = draft.payload;
  }
  const state = stateResult.rows[0] ?? { version: 0, published_version: 0, updated_at: null };
  const sectionDrafts = Object.fromEntries(CONTENT_SECTIONS.map((section) => {
    const draft = drafts.get(section);
    return [section, draft ? {
      version: draft.version,
      sourceVersion: draft.source_version,
      publishedVersion: draft.published_version,
      publishedDraftVersion: draft.published_draft_version,
      updatedAt: draft.updated_at,
      publishedAt: draft.published_at,
    } : null];
  }));
  return NextResponse.json({
    content,
    draftVersion: state.version,
    sourceVersion: result.version,
    publishedVersion: result.version,
    publishedDraftVersion: state.published_version,
    currentPublishedVersion: result.version,
    updatedAt: state.updated_at,
    publishedAt: null,
    hasDraft: draftResult.rows.some((row) => row.version > row.published_draft_version),
    sectionDrafts,
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!isTrustedMutationOrigin(request)) return forbiddenOriginResponse();
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Authentication with MFA is required." }, { status: 401 });
  }
  try {
    if (await isAdminMutationLimited(session.user.id)) return rateLimitedResponse();
    const update = updateSchema.parse(await readJson(request));
    const saved = await savePortfolioDraft(
      getAdminDatabase(), session.user.id, update.expectedVersion, update.sourceVersion, update.content,
    );
    if (!saved) {
      return NextResponse.json({ message: "Draft changed in another session. Reload it before saving." }, { status: 409 });
    }
    return NextResponse.json({ ...saved, hasDraft: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof RangeError) return NextResponse.json({ message: "Draft is too large." }, { status: 413 });
    if (error instanceof z.ZodError) {
      const issues = error.issues.slice(0, 20).map((issue) => {
        const field = issue.path.at(-1);
        let message = "Bitte Eingabe prüfen.";
        if (field === "tags") message = "Mindestens sechs Stichpunkte eintragen.";
        else if (field === "url" || field === "image") message = "Nur HTTPS-URLs oder lokale Pfade mit einem einzelnen / sind erlaubt.";
        else if (field === "email" && issue.code === "invalid_format") message = "Bitte eine gültige E-Mail-Adresse eingeben.";
        else if (issue.code === "too_small") message = "Dieses Feld darf nicht leer sein.";
        else if (issue.code === "too_big") message = "Der Wert überschreitet die zulässige Länge.";
        else if (issue.code === "invalid_type") message = "Bitte einen gültigen Wert eingeben.";
        return { field: typeof field === "string" ? field : "content", message };
      });
      return NextResponse.json(
        { message: "Bitte korrigiere die markierten Eingaben.", issues },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "Invalid draft payload." }, { status: 400 });
    }
    console.error("Admin draft save failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ message: "Draft could not be saved." }, { status: 500 });
  }
}
