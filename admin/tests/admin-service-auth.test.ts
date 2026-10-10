import assert from "node:assert/strict";
import { test } from "node:test";
import { createAdminServiceAssertion, verifyAdminServiceAssertion, verifyAdminServiceRequest } from "@/lib/admin-service-auth";

const secret = "test-admin-content-token-with-at-least-32-characters";
const now = 1_800_000_000_000;

function signedRequest(overrides: Record<string, string> = {}, method = "GET", pathname = "/api/admin/content") {
  const assertion = createAdminServiceAssertion(secret, {
    actor: "admin-user-123", method, pathname, timestamp: now,
  });
  return new Request(`https://portfolio.example.test${pathname}`, {
    method,
    headers: { authorization: `Bearer ${secret}`, ...assertion, ...overrides },
  });
}

test("Admin service assertions bind admin role, actor, method, path, and expiry", () => {
  assert.equal(verifyAdminServiceAssertion(secret, signedRequest(), now), true);
  assert.equal(verifyAdminServiceAssertion(secret, signedRequest({}, "PUT"), now), true);
  assert.equal(verifyAdminServiceAssertion(secret, signedRequest({}, "PUT"), now + 60_001), false);
  assert.equal(verifyAdminServiceAssertion(secret, signedRequest({ "x-admin-role": "user" }), now), false);
  assert.equal(verifyAdminServiceAssertion(secret, signedRequest({ "x-admin-actor": "other" }), now), false);
  const signedForContent = signedRequest();
  const replayedToAnotherPath = new Request("https://portfolio.example.test/api/other", {
    method: signedForContent.method,
    headers: signedForContent.headers,
  });
  assert.equal(verifyAdminServiceAssertion(secret, replayedToAnotherPath, now), false);
  assert.equal(verifyAdminServiceRequest(secret, signedRequest(), now), true);
  assert.equal(verifyAdminServiceRequest(secret, new Request("https://portfolio.example.test/api/admin/content", {
    headers: { authorization: `Bearer ${secret}` },
  }), now), false);
});

test("Admin service assertions cannot be reused with another API secret", () => {
  assert.equal(verifyAdminServiceAssertion(`${secret}-different`, signedRequest(), now), false);
});
