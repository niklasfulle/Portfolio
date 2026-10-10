import { createHmac, timingSafeEqual } from "node:crypto";

const ASSERTION_TTL_MS = 60_000;
const ROLE = "admin";

type AdminServiceAssertionInput = {
  actor: string;
  method: string;
  pathname: string;
  timestamp?: number;
};

function canonicalAssertion(input: AdminServiceAssertionInput, timestamp: number) {
  return ["portfolio-admin-v1", ROLE, input.actor, input.method.toUpperCase(), input.pathname, timestamp].join("\n");
}

export function createAdminServiceAssertion(
  secret: string,
  input: AdminServiceAssertionInput,
): Record<string, string> {
  const timestamp = input.timestamp ?? Date.now();
  const signature = createHmac("sha256", secret)
    .update(canonicalAssertion(input, timestamp))
    .digest("hex");
  return {
    "x-admin-actor": input.actor,
    "x-admin-role": ROLE,
    "x-admin-timestamp": String(timestamp),
    "x-admin-signature": signature,
  };
}

export function verifyAdminServiceAssertion(
  secret: string,
  request: Request,
  now = Date.now(),
): boolean {
  const actor = request.headers.get("x-admin-actor") ?? "";
  const role = request.headers.get("x-admin-role") ?? "";
  const timestampText = request.headers.get("x-admin-timestamp") ?? "";
  const suppliedSignature = request.headers.get("x-admin-signature") ?? "";
  if (!actor || actor.length > 200 || role !== ROLE || !/^\d{10,16}$/.test(timestampText) || !/^[a-f0-9]{64}$/i.test(suppliedSignature)) {
    return false;
  }

  const timestamp = Number(timestampText);
  if (!Number.isSafeInteger(timestamp) || Math.abs(now - timestamp) > ASSERTION_TTL_MS) return false;

  const expectedSignature = createHmac("sha256", secret)
    .update(canonicalAssertion({ actor, method: request.method, pathname: new URL(request.url).pathname }, timestamp))
    .digest();
  const supplied = Buffer.from(suppliedSignature, "hex");
  return expectedSignature.length === supplied.length && timingSafeEqual(expectedSignature, supplied);
}

export function verifyAdminServiceRequest(secret: string, request: Request, now = Date.now()): boolean {
  const authorization = request.headers.get("authorization") ?? "";
  const suppliedToken = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
  const expected = Buffer.from(secret);
  const supplied = Buffer.from(suppliedToken);
  return expected.length >= 32
    && expected.length === supplied.length
    && timingSafeEqual(expected, supplied)
    && verifyAdminServiceAssertion(secret, request, now);
}
