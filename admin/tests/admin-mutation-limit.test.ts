import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { getAdminDatabase } from "@admin/lib/database";
import { isAdminMutationLimited, rateLimitedResponse } from "@admin/lib/admin-mutation-limit";
import { ADMIN_MUTATION_LIMIT, isAdminMutationRateLimited } from "@admin/lib/mutation-rate-limit";

const integrationUrl = process.env.ADMIN_INTEGRATION_DATABASE_URL;
const originalAdminDatabaseUrl = process.env.ADMIN_DATABASE_URL;
let integrationDatabase: ReturnType<typeof getAdminDatabase> | undefined;

if (integrationUrl) {
  const parsedUrl = new URL(integrationUrl);
  const databaseName = decodeURIComponent(parsedUrl.pathname.slice(1));
  if (!["localhost", "127.0.0.1", "::1", "db"].includes(parsedUrl.hostname) || !databaseName.endsWith("_test")) {
    throw new Error("Admin rate-limit integration tests only allow a local database whose name ends in _test.");
  }
  process.env.ADMIN_DATABASE_URL = integrationUrl;
  integrationDatabase = getAdminDatabase();
}

const testActor = `admin-rate-limit-test-${randomUUID()}`;

after(async () => {
  try {
    await integrationDatabase?.query("DELETE FROM admin_api_rate_limit WHERE actor = $1", [testActor]);
  } finally {
    await integrationDatabase?.end();
    if (originalAdminDatabaseUrl === undefined) delete process.env.ADMIN_DATABASE_URL;
    else process.env.ADMIN_DATABASE_URL = originalAdminDatabaseUrl;
  }
});

test("admin mutation throttle allows the configured limit and rejects the next request", () => {
  assert.equal(isAdminMutationRateLimited(ADMIN_MUTATION_LIMIT), false);
  assert.equal(isAdminMutationRateLimited(ADMIN_MUTATION_LIMIT + 1), true);
});

test("throttled response is a no-store 429 with a retry interval", async () => {
  const response = rateLimitedResponse();

  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("Retry-After"), "60");
  assert.deepEqual(await response.json(), {
    message: "Too many admin changes. Wait a minute and try again.",
  });
});

test("database-backed mutation throttle crosses the limit and produces the 429 contract", { skip: !integrationDatabase }, async () => {
  const decisions: boolean[] = [];
  for (let request = 0; request < ADMIN_MUTATION_LIMIT + 1; request += 1) {
    decisions.push(await isAdminMutationLimited(testActor));
  }

  assert.deepEqual(decisions, [
    ...Array.from({ length: ADMIN_MUTATION_LIMIT }, () => false),
    true,
  ]);
  const response = rateLimitedResponse();
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "60");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});
