import { NextResponse } from "next/server";
import { getAdminDatabase } from "@admin/lib/database";
import { forbiddenOriginResponse, isTrustedMutationOrigin } from "@admin/lib/csrf";
import { getAdminSession } from "@admin/lib/require-admin-session";
import { isAdminMutationLimited, rateLimitedResponse } from "@admin/lib/admin-mutation-limit";
import { discardDraft } from "@admin/lib/content-workflows";
import { isContentSection } from "@admin/lib/content-sections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isTrustedMutationOrigin(request)) return forbiddenOriginResponse();
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Authentication with MFA is required." }, { status: 401 });
  }
  if (await isAdminMutationLimited(session.user.id)) return rateLimitedResponse();
  try {
    const rawBody = await request.text();
    const body = rawBody ? JSON.parse(rawBody) as { section?: unknown } : undefined;
    if (body?.section !== undefined && (typeof body.section !== "string" || !isContentSection(body.section))) {
      return NextResponse.json({ message: "Unknown content section." }, { status: 400 });
    }
    const discarded = await discardDraft(getAdminDatabase(), session.user.id, body?.section as Parameters<typeof discardDraft>[2]);
    return NextResponse.json(
      { discarded },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "Invalid discard request." }, { status: 400 });
    }
    return NextResponse.json({ message: "Draft could not be discarded." }, { status: 500 });
  }
}
