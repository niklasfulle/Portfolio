import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@admin/lib/auth";
import { hasMfaEnabledSession } from "@admin/lib/session-policy";

export async function getAdminSession() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!hasMfaEnabledSession(session)) return null;
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
  return session;
}
