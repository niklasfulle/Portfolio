export function hasMfaEnabledSession(session: unknown): boolean {
  if (!session || typeof session !== "object" || !("user" in session)) return false;
  const user = session.user;
  return Boolean(user && typeof user === "object" &&
    "twoFactorEnabled" in user && user.twoFactorEnabled === true);
}

export function isAdminRole(role: unknown): boolean {
  return role === "admin";
}
