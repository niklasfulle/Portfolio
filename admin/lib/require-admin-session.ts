import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@admin/lib/auth";
import { getAdminDatabase } from "@admin/lib/database";
import { hasMfaEnabledSession, isAdminRole } from "@admin/lib/session-policy";

export async function hasAdminRole(userId: string): Promise<boolean> {
  const result = await getAdminDatabase().query<{ role: unknown }>(
    "SELECT role FROM admin_user_role WHERE user_id = $1",
    [userId],
  );
  return result.rowCount === 1 && isAdminRole(result.rows[0]?.role);
}

export async function getAdminSession() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session || !hasMfaEnabledSession(session)) return null;
  if (!await hasAdminRole(session.user.id)) return null;
  return session;
}

export async function getAuthenticatedSession() {
  return getAuth().api.getSession({ headers: await headers() });
}

export async function requireAuthenticatedSession() {
  const session = await getAuthenticatedSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdminSession() {
  const session = await getAuthenticatedSession();
  if (!session) redirect("/login");
  if (!hasMfaEnabledSession(session)) redirect("/two-factor/setup");
  if (!await hasAdminRole(session.user.id)) redirect("/login?error=not-admin");
  return session;
}
