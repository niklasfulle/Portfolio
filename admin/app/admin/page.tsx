import { requireAdminSession } from "@admin/lib/require-admin-session";

export const dynamic = "force-dynamic";
import { ContentEditor } from "@admin/components/content-editor";

export default async function AdminPage() {
  const session = await requireAdminSession();
  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="admin-title">
        <p className="eyebrow">PORTFOLIO ADMIN</p>
        <h1 id="admin-title">Angemeldet</h1>
        <p className="auth-description">MFA wurde bestätigt. Entwürfe und Veröffentlichungen sind an dein Admin-Konto gebunden.</p>
        <p className="session-email">{session.user.email}</p>
      <ContentEditor />
        <form action={async () => { "use server"; const { headers } = await import("next/headers"); const { getAuth } = await import("@admin/lib/auth"); await getAuth().api.signOut({ headers: await headers() }); }}>
          <button className="secondary-button" type="submit">Abmelden</button>
        </form>
      </section>
    </main>
  );
}
