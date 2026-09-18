const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_REQUESTS = 5;

type RateLimitEntry = { count: number; resetAt: number };
const requestsByClient = new Map<string, RateLimitEntry>();

function getClientAddress(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return req.headers.get("x-real-ip") ?? forwardedFor ?? "unknown";
}

export function checkContactRateLimit(req: Request) {
  const now = Date.now();
  const clientAddress = getClientAddress(req);
  const current = requestsByClient.get(clientAddress);

  if (!current || current.resetAt <= now) {
    requestsByClient.set(clientAddress, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return null;
  }

  if (current.count >= RATE_LIMIT_REQUESTS) {
    return Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  }

  current.count += 1;
  return null;
}

export function resetContactRateLimitForTests() {
  if (process.env.NODE_ENV === "test") {
    requestsByClient.clear();
  }
}
