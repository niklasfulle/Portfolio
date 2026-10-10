import { NextResponse } from "next/server";
import { getAdminDatabase } from "@admin/lib/database";
import { requestPortfolioContent } from "@admin/lib/portfolio-api";
import { getAdminSession } from "@admin/lib/require-admin-session";
import { forbiddenOriginResponse, isTrustedMutationOrigin } from "@admin/lib/csrf";
import { isAdminMutationLimited, rateLimitedResponse } from "@admin/lib/admin-mutation-limit";
import { publishDraft } from "@admin/lib/content-workflows";

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
    const current = await requestPortfolioContent("GET", session.user.id);
    if (!current.response.ok || !current.result || typeof current.result !== "object"
      || !("version" in current.result) || !("content" in current.result)) {
      return NextResponse.json({ message: "Published content could not be loaded." }, { status: 502 });
    }
    const published = current.result as { version: number; content: unknown };
    const outcome = await publishDraft(
      getAdminDatabase(),
      session.user.id,
      published,
      async (expectedVersion, content, idempotencyKey) => {
        const { response, result } = await requestPortfolioContent("PUT", session.user.id, {
          expectedVersion,
          idempotencyKey,
          content,
        });
        return {
          ok: response.ok,
          status: response.status,
          version: (result as { version?: number } | null)?.version,
        };
      },
    );
    switch (outcome.kind) {
      case "published":
        return NextResponse.json(
          { publishedVersion: outcome.version, publishedAt: outcome.publishedAt },
          { headers: { "Cache-Control": "no-store" } },
        );
      case "no-draft":
        return NextResponse.json({ message: "Save a draft before publishing." }, { status: 409 });
      case "no-unpublished-draft":
        return NextResponse.json({ message: "There are no unpublished changes to publish." }, { status: 409 });
      case "conflict":
        return NextResponse.json({ message: "Published content changed. Reload the latest content before publishing this draft." }, { status: 409 });
      case "upstream-unavailable":
        return NextResponse.json({ message: "Portfolio content API is unavailable." }, { status: 502 });
      case "publish-failed":
        return NextResponse.json({ message: "Publishing failed. The current public content was not changed." }, { status: 502 });
      case "unconfirmed":
        return NextResponse.json({ message: "Publish result could not be confirmed." }, { status: 502 });
    }
  } catch (error) {
    console.error("Admin content publish failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ message: "Publishing could not be confirmed. Check the published content before retrying." }, { status: 502 });
  }
}
