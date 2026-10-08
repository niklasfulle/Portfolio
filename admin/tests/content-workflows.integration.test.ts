import assert from "node:assert/strict";
import { after, test } from "node:test";
import { Pool } from "pg";
import { discardDraft, publishDraft } from "@admin/lib/content-workflows";

const integrationUrl = process.env.ADMIN_INTEGRATION_DATABASE_URL;
let database: Pool | undefined;

if (integrationUrl) {
  const parsed = new URL(integrationUrl);
  if (!/[\w-]+_test$/.test(parsed.pathname.slice(1)) || !["localhost", "127.0.0.1"].includes(parsed.hostname)) {
    throw new Error("Admin workflow integration tests only allow a local database whose name ends in _test.");
  }
  database = new Pool({ connectionString: integrationUrl, max: 1 });
}

after(async () => {
  await database?.end();
});

async function resetTestRows() {
  if (!database) return;
  await database.query("DELETE FROM content_draft WHERE id = 'portfolio'");
  await database.query("DELETE FROM admin_audit_log WHERE actor = 'integration-test-admin'");
}

async function createDraft() {
  assert.ok(database);
  await database.query(
    `INSERT INTO content_draft (id, payload, version, source_version, published_version, updated_by)
     VALUES ('portfolio', '{"projects":[]}'::jsonb, 7, 2, 2, 'integration-test-admin')`,
  );
}

test("publish commits the remote version, timestamp, and audit record together", { skip: !database }, async () => {
  await resetTestRows();
  await createDraft();
  const outcome = await publishDraft(database!, "integration-test-admin", async (expectedVersion, payload) => {
    assert.equal(expectedVersion, 2);
    assert.deepEqual(payload, { projects: [] });
    return { ok: true, status: 200, version: 3 };
  });

  assert.equal(outcome.kind, "published");
  if (outcome.kind !== "published") return;
  assert.equal(outcome.version, 3);
  assert.ok(outcome.publishedAt instanceof Date);
  const row = await database!.query("SELECT source_version, published_version, published_draft_version, published_at FROM content_draft WHERE id = 'portfolio'");
  assert.equal(row.rows[0].source_version, 3);
  assert.equal(row.rows[0].published_version, 3);
  assert.equal(row.rows[0].published_draft_version, 7);
  assert.ok(row.rows[0].published_at);
  const audit = await database!.query("SELECT action FROM admin_audit_log WHERE actor = 'integration-test-admin'");
  assert.deepEqual(audit.rows.map((entry) => entry.action), ["content.published"]);
  await resetTestRows();
});

test("retry reuses the same idempotency key after the remote commit response is lost", { skip: !database }, async () => {
  await resetTestRows();
  await createDraft();
  let committedKey: string | undefined;
  let committedVersion = 2;
  const firstAttempt = await publishDraft(database!, "integration-test-admin", async (_version, _payload, key) => {
    committedKey = key;
    committedVersion += 1;
    throw new Error("The remote publish committed, but its response was lost.");
  });
  assert.deepEqual(firstAttempt, { kind: "upstream-unavailable" });

  const retry = await publishDraft(database!, "integration-test-admin", async (_version, _payload, key) => {
    assert.equal(key, committedKey);
    return { ok: true, status: 200, version: committedVersion };
  });
  assert.equal(retry.kind, "published");
  const row = await database!.query("SELECT published_draft_version FROM content_draft WHERE id = 'portfolio'");
  assert.equal(row.rows[0].published_draft_version, 7);
  await resetTestRows();
});

test("publish conflict leaves the draft and audit history unchanged", { skip: !database }, async () => {
  await resetTestRows();
  await createDraft();
  const outcome = await publishDraft(database!, "integration-test-admin", async () => ({ ok: false, status: 409 }));
  assert.deepEqual(outcome, { kind: "conflict" });
  const row = await database!.query("SELECT version, source_version, published_version, published_draft_version, published_at FROM content_draft WHERE id = 'portfolio'");
  assert.equal(row.rows[0].version, 7);
  assert.equal(row.rows[0].source_version, 2);
  assert.equal(row.rows[0].published_version, 2);
  assert.equal(row.rows[0].published_draft_version, 0);
  assert.equal(row.rows[0].published_at, null);
  const audit = await database!.query("SELECT count(*)::int AS count FROM admin_audit_log WHERE actor = 'integration-test-admin'");
  assert.equal(audit.rows[0].count, 0);
  await resetTestRows();
});

test("discard removes only the draft and records the actor", { skip: !database }, async () => {
  await resetTestRows();
  await createDraft();
  assert.equal(await discardDraft(database!, "integration-test-admin"), true);
  assert.equal(await discardDraft(database!, "integration-test-admin"), false);
  const row = await database!.query("SELECT count(*)::int AS count FROM content_draft WHERE id = 'portfolio'");
  assert.equal(row.rows[0].count, 0);
  const audit = await database!.query("SELECT action FROM admin_audit_log WHERE actor = 'integration-test-admin'");
  assert.deepEqual(audit.rows.map((entry) => entry.action), ["content.draft_discarded"]);
  await resetTestRows();
});
