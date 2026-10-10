import Link from "next/link";
import type { Metadata } from "next";
import PortfolioFrame from "@/components/PortfolioFrame";
import PortfolioSections from "@/components/PortfolioSections";
import { contentSchema } from "@/lib/admin-content-schema";
import type { GithubStatsData } from "@/lib/github-stats";
import { getAdminDatabase } from "@admin/lib/database";
import { requestPortfolioContent } from "@admin/lib/portfolio-api";
import { requireAdminSession } from "@admin/lib/require-admin-session";
import { mergeDraftSections } from "@admin/lib/content-sections";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

type PublishedContentResponse = {
  version: number;
  content: unknown;
  githubStats: GithubStatsData;
};

export default async function AdminPreviewPage() {
  const session = await requireAdminSession();

  const database = getAdminDatabase();
  const [published, draftResult] = await Promise.all([
    requestPortfolioContent("GET", session.user.id).catch(() => null),
    database.query<{ id: string; payload: unknown; version: number; published_draft_version: number }>(
      "SELECT id, payload, version, published_draft_version FROM content_draft",
    ),
  ]);

  if (!published?.response.ok) {
    return (
      <main className="auth-shell">
        <section className="auth-card" aria-labelledby="preview-error-title">
          <h1 id="preview-error-title">Vorschau nicht verfügbar</h1>
          <p className="auth-description">
            Die veröffentlichte Portfolio-API konnte nicht erreicht werden.
          </p>
          <Link className="secondary-button" href="/admin">Zurück zum Admin-Bereich</Link>
        </section>
      </main>
    );
  }

  const publishedData = published.result as PublishedContentResponse;
  const content = (mergeDraftSections(publishedData, draftResult.rows) as PublishedContentResponse).content;
  const parsed = contentSchema.safeParse(content);
  if (!parsed.success) {
    return (
      <main className="auth-shell">
        <section className="auth-card" aria-labelledby="preview-invalid-title">
          <h1 id="preview-invalid-title">Vorschau kann nicht dargestellt werden</h1>
          <p className="auth-description">
            Die gespeicherten Inhalte entsprechen nicht mehr dem aktuellen Inhaltsschema.
            Bitte prüfe den Entwurf im Admin-Bereich.
          </p>
          <Link className="secondary-button" href="/admin">Entwurf prüfen</Link>
        </section>
      </main>
    );
  }

  const previewContent = parsed.data;
  const isDraft = draftResult.rows.some((row) => row.version > row.published_draft_version);

  return (
    <PortfolioFrame publicBaseUrl={process.env.NEXT_PUBLIC_SITE_URL}>
      <div className="fixed right-4 top-24 z-50 flex items-center gap-3 rounded-full border border-cyan-400/40 bg-slate-950/90 px-4 py-2 text-xs font-semibold text-cyan-100 shadow-xl sm:right-8">
        <span>{isDraft ? "Entwurfsvorschau" : "Vorschau · Live-Inhalt"}</span>
        <Link className="underline underline-offset-4" href="/admin">
          Admin öffnen
        </Link>
      </div>
      <PortfolioSections
        aboutMe={previewContent.aboutMe.filter((item) => item.visible)}
        projects={previewContent.projects.filter((item) => item.visible)}
        skills={previewContent.skills
          .filter((item) => item.visible && item.type === "skill")
          .map((item) => item.name)}
        experience={previewContent.experience
          .filter((item) => item.visible)
          .map(({ category, ...item }) => category == null ? item : { ...item, category })}
        contactEmail={previewContent.contactEmail[0]?.email ?? "name@beispiel.de"}
        githubStats={publishedData.githubStats}
        previewMode
      />
    </PortfolioFrame>
  );
}
