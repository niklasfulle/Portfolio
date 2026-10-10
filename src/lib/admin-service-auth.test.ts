/** @jest-environment node */

import { describe, expect, it } from "@jest/globals";
import {
  createAdminServiceAssertion,
  verifyAdminServiceAssertion,
  verifyAdminServiceRequest,
} from "@/lib/admin-service-auth";

const secret = "test-admin-service-secret-with-at-least-thirty-two-characters";
const now = 1_800_000_000_000;

function request(headers: Record<string, string> = {}, method = "PUT", path = "/api/admin/content") {
  return new Request(`http://localhost${path}`, { method, headers });
}

function assertionHeaders(overrides: Record<string, string> = {}) {
  return {
    ...createAdminServiceAssertion(secret, {
      actor: "test-admin",
      method: "PUT",
      pathname: "/api/admin/content",
      timestamp: now,
    }),
    ...overrides,
  };
}

describe("admin service request authentication", () => {
  it("accepts a valid, fresh assertion and bearer token", () => {
    const headers = {
      authorization: `Bearer ${secret}`,
      ...assertionHeaders(),
    };
    const validRequest = request(headers);

    expect(verifyAdminServiceAssertion(secret, validRequest, now)).toBe(true);
    expect(verifyAdminServiceRequest(secret, validRequest, now)).toBe(true);
  });

  it("rejects malformed assertion fields and stale or unsafe timestamps", () => {
    expect(verifyAdminServiceAssertion(secret, request(), now)).toBe(false);
    expect(verifyAdminServiceAssertion(secret, request(assertionHeaders({ "x-admin-actor": "a".repeat(201) })), now)).toBe(false);
    expect(verifyAdminServiceAssertion(secret, request(assertionHeaders({ "x-admin-role": "editor" })), now)).toBe(false);
    expect(verifyAdminServiceAssertion(secret, request(assertionHeaders({ "x-admin-timestamp": "invalid" })), now)).toBe(false);
    expect(verifyAdminServiceAssertion(secret, request(assertionHeaders({ "x-admin-timestamp": "9999999999999999" })), now)).toBe(false);
    expect(verifyAdminServiceAssertion(secret, request(assertionHeaders()), now + 60_001)).toBe(false);
    expect(verifyAdminServiceAssertion(secret, request(assertionHeaders()), now - 60_001)).toBe(false);
    expect(verifyAdminServiceAssertion(secret, request(assertionHeaders({ "x-admin-signature": "g".repeat(64) })), now)).toBe(false);
  });

  it("binds the assertion to the request method and path", () => {
    const headers = assertionHeaders();
    expect(verifyAdminServiceAssertion(secret, request(headers, "GET"), now)).toBe(false);
    expect(verifyAdminServiceAssertion(secret, request(headers, "PUT", "/api/admin/other"), now)).toBe(false);
  });

  it("requires a sufficiently long matching bearer secret and a valid assertion", () => {
    const headers = assertionHeaders();
    expect(verifyAdminServiceRequest("short", request({ authorization: "Bearer short", ...headers }), now)).toBe(false);
    expect(verifyAdminServiceRequest(secret, request(headers), now)).toBe(false);
    expect(verifyAdminServiceRequest(secret, request({ authorization: `Bearer ${"x".repeat(secret.length)}`, ...headers }), now)).toBe(false);
    expect(verifyAdminServiceRequest(secret, request({ authorization: `Bearer ${secret}` }), now)).toBe(false);
  });
});
