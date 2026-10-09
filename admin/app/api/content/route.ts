import { NextResponse } from "next/server";
import type { PoolClient } from "pg";
import { z } from "zod";
import { contentSchema } from "@/lib/admin-content-schema";
import { getAdminDatabase } from "@admin/lib/database";
import { requestPortfolioContent } from "@admin/lib/portfolio-api";
import { getAdminSession } from "@admin/lib/require-admin-session";
import { forbiddenOriginResponse, isTrustedMutationOrigin } from "@admin/lib/csrf";
import { isAdminMutationLimited, rateLimitedResponse } from "@admin/lib/admin-mutation-limit";

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
    const contentResponse = await requestPortfolioContent("GET");
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

  const draftResult = await database.query(
    "SELECT payload, version, source_version, published_version, published_draft_version, updated_at, published_at FROM content_draft WHERE id = $1",
    ["portfolio"],
  );
  const draft = draftResult.rows[0];
  return NextResponse.json({
    content: draft?.payload ?? result.content,
    draftVersion: draft?.version ?? 0,
    sourceVersion: draft?.source_version ?? result.version,
    publishedVersion: draft?.published_version ?? result.version,
    publishedDraftVersion: draft?.published_draft_version ?? 0,
    currentPublishedVersion: result.version,
    updatedAt: draft?.updated_at ?? null,
    publishedAt: draft?.published_at ?? null,
    hasDraft: Boolean(draft),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!isTrustedMutationOrigin(request)) return forbiddenOriginResponse();
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Authentication with MFA is required." }, { status: 401 });
  }
  let client: PoolClient | undefined;
  let transactionOpen = false;
  try {
    if (await isAdminMutationLimited(session.user.id)) return rateLimitedResponse();
    const update = updateSchema.parse(await readJson(request));
    const database = getAdminDatabase();
    client = await database.connect();
    await client.query("BEGIN");
    transactionOpen = true;
    const payload = JSON.stringify(update.content);
    const saved = update.expectedVersion === 0
      ? await client.query(
          `INSERT INTO content_draft (id, payload, version, source_version, published_version, updated_by)
           VALUES ('portfolio', $1::jsonb, 1, $2, $2, $3)
           ON CONFLICT (id) DO NOTHING
           RETURNING version, source_version, published_version, updated_at`,
          [payload, update.sourceVersion, session.user.id],
        )
      : await client.query(
          `UPDATE content_draft
             SET payload = $1::jsonb, version = version + 1, updated_by = $2, updated_at = now()
           WHERE id = 'portfolio' AND version = $3
           RETURNING version, source_version, published_version, updated_at`,
          [payload, session.user.id, update.expectedVersion],
        );

    if (!saved.rowCount) {
      await client.query("ROLLBACK");
      transactionOpen = false;
      return NextResponse.json({ message: "Draft changed in another session. Reload it before saving." }, { status: 409 });
    }
    await client.query(
      "INSERT INTO admin_audit_log (actor, action) VALUES ($1, $2)",
      [session.user.id, "content.draft_saved"],
    );
    await client.query("COMMIT");
    transactionOpen = false;
    return NextResponse.json({ ...saved.rows[0], hasDraft: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (transactionOpen) await client?.query("ROLLBACK").catch(() => undefined);
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
  } finally {
    client?.release();
  }
}
