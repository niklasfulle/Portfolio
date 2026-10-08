export function isTrustedMutationOrigin(request: Request): boolean {
  const originHeader = request.headers.get("origin");
  const configuredOrigin = process.env.ADMIN_APP_ORIGIN;
  if (!originHeader || !configuredOrigin) return false;

  try {
    const requestOrigin = new URL(originHeader).origin;
    const trustedOrigin = new URL(configuredOrigin).origin;
    return requestOrigin === trustedOrigin;
  } catch {
    return false;
  }
}

export function forbiddenOriginResponse() {
  return Response.json({ message: "Request origin is not allowed." }, { status: 403 });
}
