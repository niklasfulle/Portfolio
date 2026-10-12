export function isTrustedMutationOrigin(request: Request): boolean {
  const originHeader = request.headers.get("origin");
  const configuredOrigin = process.env.ADMIN_APP_ORIGIN;
  if (!originHeader || !configuredOrigin) return false;

  try {
    const requestOrigin = new URL(originHeader).origin;
    const trustedUrl = new URL(configuredOrigin);
    const requestUrl = new URL(requestOrigin);
    if (requestOrigin === trustedUrl.origin) return true;

    const isLocalhostAlias =
      requestUrl.protocol === "http:" &&
      trustedUrl.protocol === "http:" &&
      requestUrl.port === trustedUrl.port &&
      ((requestUrl.hostname === "localhost" && trustedUrl.hostname === "127.0.0.1") ||
        (requestUrl.hostname === "127.0.0.1" && trustedUrl.hostname === "localhost"));

    return isLocalhostAlias;
  } catch {
    return false;
  }
}

export function forbiddenOriginResponse() {
  return Response.json({ message: "Request origin is not allowed." }, { status: 403 });
}
