import Link from "next/link";
import { ArrowUpRight, Eye, LogOut, ShieldCheck } from "lucide-react";
import { ContentEditor } from "@admin/components/content-editor";
import { requireAdminSession } from "@admin/lib/require-admin-session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireAdminSession();

  async function signOut() {
    "use server";
    const { headers } = await import("next/headers");
    const { redirect } = await import("next/navigation");
    const { getAuth } = await import("@admin/lib/auth");
    await getAuth().api.signOut({ headers: await headers() });
    redirect("/login");
  }

  return (
    <main className="dashboard-shell">
      <header className="admin-topbar">
        <Link className="admin-brand" href="/admin" aria-label="Portfolio Admin – Startseite">
          <span className="admin-brand-mark" aria-hidden="true">N</span>
          <span className="admin-brand-copy">
            <strong>Niklas Fulle</strong>
            <small>Portfolio Studio</small>
          </span>
        </Link>

        <div className="admin-topbar-actions">
          <span className="secure-indicator"><ShieldCheck aria-hidden="true" size={15} /> MFA aktiv</span>
          <Link className="topbar-link" href="/preview" target="_blank" rel="noopener noreferrer">
            <Eye aria-hidden="true" size={15} /> Vorschau <ArrowUpRight aria-hidden="true" size={14} />
          </Link>
          <form action={signOut}>
            <button className="topbar-link" type="submit">
              <LogOut aria-hidden="true" size={15} /> Abmelden
            </button>
          </form>
        </div>
      </header>

      <div className="dashboard-layout">
        <div className="dashboard-main">
          <section className="dashboard-intro" aria-labelledby="admin-title">
            <div>
              <p className="eyebrow">PORTFOLIO WORKSPACE</p>
              <h1 id="admin-title">Inhalte verwalten</h1>
              <p className="dashboard-intro-copy">
                Bearbeite dein Portfolio, prüfe Änderungen in der Vorschau und veröffentliche sie erst, wenn alles passt.
              </p>
            </div>
            <div className="dashboard-account-chip">
              <span className="account-avatar" aria-hidden="true">{session.user.name?.slice(0, 1) || "N"}</span>
              <span><strong>{session.user.name || "Administrator"}</strong><small>{session.user.email}</small></span>
            </div>
          </section>

          <ContentEditor />
        </div>
      </div>
    </main>
  );
}
