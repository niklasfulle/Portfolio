import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDatabase } from "@admin/lib/database";
import { isContentSection, parseSectionPayload } from "@admin/lib/content-sections";
import { requestPortfolioContent } from "@admin/lib/portfolio-api";
import { discardDraft, saveSectionDraft } from "@admin/lib/content-workflows";
import { forbiddenOriginResponse, isTrustedMutationOrigin } from "@admin/lib/csrf";
import { isAdminMutationLimited, rateLimitedResponse } from "@admin/lib/admin-mutation-limit";
import { getAdminSession } from "@admin/lib/require-admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  expectedVersion: z.number().int().min(0),
  sourceVersion: z.number().int().min(0),
  content: z.unknown(),
}).strict();
const MAX_BODY_BYTES = 1_000_000;

async function readJson(request: Request) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) throw new RangeError();
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

type RouteContext = { params: Promise<{ section: string }> };

async function resolveSection(context: RouteContext) {
  const { section } = await context.params;
  return isContentSection(section) ? section : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const section = await resolveSection(context);
  if (!section) return NextResponse.json({ message: "Unknown content section." }, { status: 404 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Authentication with MFA is required." }, { status: 401 });

  try {
    const [{ response, result }, draftResult] = await Promise.all([
      requestPortfolioContent("GET", session.user.id),
      getAdminDatabase().query(
        "SELECT payload, version, source_version, published_version, published_draft_version, updated_at FROM content_draft WHERE id = $1",
        [section],
      ),
    ]);
    if (!response.ok || !result || typeof result !== "object" || !("content" in result)) {
      return NextResponse.json({ message: "Portfolio content could not be loaded." }, { status: 502 });
    }
    const published = result as { version: number; content: Record<string, unknown> };
    const draft = draftResult.rows[0];
    return NextResponse.json({
      section,
      content: draft && draft.version > draft.published_draft_version
        ? draft.payload
        : published.content[section],
      draftVersion: draft?.version ?? 0,
      sourceVersion: draft?.source_version ?? published.version,
      publishedVersion: published.version,
      publishedDraftVersion: draft?.published_draft_version ?? 0,
      hasDraft: Boolean(draft && draft.version > draft.published_draft_version),
      updatedAt: draft?.updated_at ?? null,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Portfolio content could not be loaded." }, { status: 502 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  if (!isTrustedMutationOrigin(request)) return forbiddenOriginResponse();
  const section = await resolveSection(context);
  if (!section) return NextResponse.json({ message: "Unknown content section." }, { status: 404 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Authentication with MFA is required." }, { status: 401 });

  try {
    if (await isAdminMutationLimited(session.user.id)) return rateLimitedResponse();
    const update = updateSchema.parse(await readJson(request));
    const content = parseSectionPayload(section, update.content);
    const saved = await saveSectionDraft(
      getAdminDatabase(), session.user.id, section, update.expectedVersion, update.sourceVersion, content,
    );
    if (!saved) {
      return NextResponse.json({ message: "This section changed in another session. Reload it before saving." }, { status: 409 });
    }
    return NextResponse.json({ section, ...saved, hasDraft: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof RangeError) return NextResponse.json({ message: "Section draft is too large." }, { status: 413 });
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        message: "Invalid section draft.",
        issues: error.issues.slice(0, 20).map(({ path, message }) => ({ path, message })),
      }, { status: 400 });
    }
    if (error instanceof SyntaxError) return NextResponse.json({ message: "Invalid section draft." }, { status: 400 });
    console.error("Admin section draft save failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ message: "Section draft could not be saved." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isTrustedMutationOrigin(request)) return forbiddenOriginResponse();
  const section = await resolveSection(context);
  if (!section) return NextResponse.json({ message: "Unknown content section." }, { status: 404 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Authentication with MFA is required." }, { status: 401 });
  if (await isAdminMutationLimited(session.user.id)) return rateLimitedResponse();
  try {
    const discarded = await discardDraft(getAdminDatabase(), session.user.id, section);
    return NextResponse.json({ section, discarded }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Section draft could not be discarded." }, { status: 500 });
  }
}
