import assert from "node:assert/strict";
import { after, test } from "node:test";
import { Pool } from "pg";
import { discardDraft, publishDraft, saveSectionDraft } from "@admin/lib/content-workflows";

const integrationUrl = process.env.ADMIN_INTEGRATION_DATABASE_URL;
let database: Pool | undefined;

if (integrationUrl) {
  const parsed = new URL(integrationUrl);
  if (!/[\w-]+_test$/.test(parsed.pathname.slice(1)) || !["localhost", "127.0.0.1", "::1", "db"].includes(parsed.hostname)) {
    throw new Error("Admin workflow integration tests only allow a local database whose name ends in _test.");
  }
  database = new Pool({ connectionString: integrationUrl, max: 1 });
}

after(async () => {
  await database?.end();
});

async function resetTestRows() {
  if (!database) return;
  await database.query("DELETE FROM content_draft");
  await database.query("UPDATE content_draft_state SET version = 0, published_version = 0 WHERE id = 'portfolio'");
  await database.query("DELETE FROM admin_audit_log WHERE actor = 'integration-test-admin'");
}

async function createDraft() {
  assert.ok(database);
  await database.query(
    `INSERT INTO content_draft (id, payload, version, source_version, published_version, published_draft_version, updated_by)
     VALUES ('projects', '[{"id":"draft-project"}]'::jsonb, 7, 2, 2, 0, 'integration-test-admin'),
            ('skills', '[{"id":"draft-skill"}]'::jsonb, 5, 2, 2, 0, 'integration-test-admin')`,
  );
  await database.query("UPDATE content_draft_state SET version = 7 WHERE id = 'portfolio'");
}

const published = { version: 2, content: { projects: [{ id: "old-project" }], skills: [{ id: "old-skill" }] } };

test("publishes pending sections together and records section versions and audit atomically", { skip: !database }, async () => {
  await resetTestRows();
  await createDraft();
  const outcome = await publishDraft(database!, "integration-test-admin", published, async (expectedVersion, payload) => {
    assert.equal(expectedVersion, 2);
    assert.deepEqual(payload, { projects: [{ id: "draft-project" }], skills: [{ id: "draft-skill" }] });
    return { ok: true, status: 200, version: 3 };
  });

  assert.equal(outcome.kind, "published");
  if (outcome.kind !== "published") return;
  assert.equal(outcome.version, 3);
  assert.ok(outcome.publishedAt instanceof Date);
  const row = await database!.query("SELECT id, source_version, published_version, published_draft_version, published_at FROM content_draft ORDER BY id");
  assert.deepEqual(row.rows.map((entry) => [entry.id, entry.source_version, entry.published_version, entry.published_draft_version]), [
    ["projects", 3, 3, 7], ["skills", 3, 3, 5],
  ]);
  assert.ok(row.rows.every((entry) => entry.published_at));
  const state = await database!.query("SELECT version, published_version FROM content_draft_state WHERE id = 'portfolio'");
  assert.deepEqual(state.rows[0], { version: 7, published_version: 7 });
  const audit = await database!.query("SELECT action FROM admin_audit_log WHERE actor = 'integration-test-admin'");
  assert.deepEqual(audit.rows.map((entry) => entry.action), ["content.published"]);
  await resetTestRows();
});

test("retry reuses the same idempotency key after the remote commit response is lost", { skip: !database }, async () => {
  await resetTestRows();
  await createDraft();
  let committedKey: string | undefined;
  let committedVersion = 2;
  const firstAttempt = await publishDraft(database!, "integration-test-admin", published, async (_version, _payload, key) => {
    committedKey = key;
    committedVersion += 1;
    throw new Error("The remote publish committed, but its response was lost.");
  });
  assert.deepEqual(firstAttempt, { kind: "upstream-unavailable" });

  const retry = await publishDraft(database!, "integration-test-admin", published, async (_version, _payload, key) => {
    assert.equal(key, committedKey);
    return { ok: true, status: 200, version: committedVersion };
  });
  assert.equal(retry.kind, "published");
  const row = await database!.query("SELECT published_draft_version FROM content_draft WHERE id = 'projects'");
  assert.equal(row.rows[0].published_draft_version, 7);
  await resetTestRows();
});

test("publish conflict leaves the draft and audit history unchanged", { skip: !database }, async () => {
  await resetTestRows();
  await createDraft();
  const outcome = await publishDraft(database!, "integration-test-admin", published, async () => ({ ok: false, status: 409 }));
  assert.deepEqual(outcome, { kind: "conflict" });
  const row = await database!.query("SELECT version, source_version, published_version, published_draft_version, published_at FROM content_draft WHERE id = 'projects'");
  assert.equal(row.rows[0].version, 7);
  assert.equal(row.rows[0].source_version, 2);
  assert.equal(row.rows[0].published_version, 2);
  assert.equal(row.rows[0].published_draft_version, 0);
  assert.equal(row.rows[0].published_at, null);
  const audit = await database!.query("SELECT count(*)::int AS count FROM admin_audit_log WHERE actor = 'integration-test-admin'");
  assert.equal(audit.rows[0].count, 0);
  await resetTestRows();
});

test("discarding one section preserves other drafts and records the actor", { skip: !database }, async () => {
  await resetTestRows();
  await createDraft();
  assert.equal(await discardDraft(database!, "integration-test-admin", "projects"), true);
  assert.equal(await discardDraft(database!, "integration-test-admin", "projects"), false);
  const row = await database!.query("SELECT id FROM content_draft ORDER BY id");
  assert.deepEqual(row.rows.map((entry) => entry.id), ["skills"]);
  const audit = await database!.query("SELECT action FROM admin_audit_log WHERE actor = 'integration-test-admin'");
  assert.deepEqual(audit.rows.map((entry) => entry.action), ["content.draft_discarded"]);
  await resetTestRows();
});

test("section saves have independent versions and reject stale writes to the same section", { skip: !database }, async () => {
  await resetTestRows();
  const project = await saveSectionDraft(database!, "integration-test-admin", "projects", 0, 2, [{ id: "project-v1" }]);
  const skill = await saveSectionDraft(database!, "integration-test-admin", "skills", 0, 2, [{ id: "skill-v1" }]);
  assert.equal(project?.version, 1);
  assert.equal(skill?.version, 1);

  const changedProject = await saveSectionDraft(database!, "integration-test-admin", "projects", 1, 2, [{ id: "project-v2" }]);
  assert.equal(changedProject?.version, 2);
  assert.equal(await saveSectionDraft(database!, "integration-test-admin", "projects", 1, 2, [{ id: "stale" }]), null);

  const state = await database!.query("SELECT version FROM content_draft_state WHERE id = 'portfolio'");
  assert.equal(state.rows[0].version, 3);
  const rows = await database!.query("SELECT id, payload FROM content_draft ORDER BY id");
  assert.deepEqual(rows.rows.map((row) => [row.id, row.payload]), [
    ["projects", [{ id: "project-v2" }]], ["skills", [{ id: "skill-v1" }]],
  ]);
  await resetTestRows();
});
