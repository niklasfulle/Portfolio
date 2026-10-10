import { createContentPublishIdempotencyKey } from "@/lib/content-publish-idempotency";
import { CONTENT_SECTIONS, type ContentSection, type PortfolioContent, mergeDraftSections } from "@admin/lib/content-sections";
import type { Pool } from "pg";

type PublishResult = {
  ok: boolean;
  status: number;
  version?: number;
};

export type PublishOutcome =
  | { kind: "published"; version: number; publishedAt: Date }
  | { kind: "no-draft" }
  | { kind: "no-unpublished-draft" }
  | { kind: "conflict" }
  | { kind: "upstream-unavailable" }
  | { kind: "publish-failed" }
  | { kind: "unconfirmed" };

type DraftRow = {
  id: ContentSection;
  payload: unknown;
  version: number;
  source_version: number;
  published_draft_version: number;
};

export async function savePortfolioDraft(
  database: Pool,
  actor: string,
  expectedVersion: number,
  sourceVersion: number,
  content: PortfolioContent,
) {
  const client = await database.connect();
  try {
    await client.query("BEGIN");
    const state = await client.query<{ version: number }>(
      "SELECT version FROM content_draft_state WHERE id = 'portfolio' FOR UPDATE",
    );
    if (state.rows[0]?.version !== expectedVersion) {
      await client.query("ROLLBACK");
      return null;
    }

    for (const section of CONTENT_SECTIONS) {
      await client.query(
        `INSERT INTO content_draft (id, payload, version, source_version, published_version, updated_by)
         VALUES ($1, $2::jsonb, 1, $3, $3, $4)
         ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload,
           version = content_draft.version + 1, source_version = EXCLUDED.source_version,
           updated_by = EXCLUDED.updated_by, updated_at = now()`,
        [section, JSON.stringify(content[section]), sourceVersion, actor],
      );
    }
    const nextVersion = expectedVersion + 1;
    await client.query(
      "UPDATE content_draft_state SET version = $1, updated_at = now() WHERE id = 'portfolio'",
      [nextVersion],
    );
    await client.query("INSERT INTO admin_audit_log (actor, action) VALUES ($1, $2)", [actor, "content.draft_saved"]);
    await client.query("COMMIT");
    return { draftVersion: nextVersion, sourceVersion, updatedAt: new Date() };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function saveSectionDraft(
  database: Pool,
  actor: string,
  section: ContentSection,
  expectedSectionVersion: number,
  sourceVersion: number,
  payload: unknown[],
) {
  const client = await database.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT version FROM content_draft_state WHERE id = 'portfolio' FOR UPDATE");
    const saved = expectedSectionVersion === 0
      ? await client.query(
          `INSERT INTO content_draft (id, payload, version, source_version, published_version, updated_by)
           VALUES ($1, $2::jsonb, 1, $3, $3, $4) ON CONFLICT (id) DO NOTHING
           RETURNING version, source_version, updated_at`,
          [section, JSON.stringify(payload), sourceVersion, actor],
        )
      : await client.query(
          `UPDATE content_draft SET payload = $1::jsonb, version = version + 1,
             source_version = $2, updated_by = $3, updated_at = now()
           WHERE id = $4 AND version = $5 RETURNING version, source_version, updated_at`,
          [JSON.stringify(payload), sourceVersion, actor, section, expectedSectionVersion],
        );
    if (saved.rowCount !== 1) {
      await client.query("ROLLBACK");
      return null;
    }
    const revision = await client.query(
      "UPDATE content_draft_state SET version = version + 1, updated_at = now() WHERE id = 'portfolio' RETURNING version",
    );
    await client.query("INSERT INTO admin_audit_log (actor, action) VALUES ($1, $2)", [actor, "content.draft_saved"]);
    await client.query("COMMIT");
    return { ...saved.rows[0], draftVersion: revision.rows[0].version };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function publishDraft(
  database: Pool,
  actor: string,
  published: { version: number; content: unknown },
  publishContent: (expectedVersion: number, content: unknown, idempotencyKey: string) => Promise<PublishResult>,
): Promise<PublishOutcome> {
  const client = await database.connect();
  let transactionOpen = false;
  try {
    await client.query("BEGIN");
    transactionOpen = true;
    await client.query("SELECT version FROM content_draft_state WHERE id = 'portfolio' FOR UPDATE");
    const draftResult = await client.query<DraftRow>(
      "SELECT id, payload, version, source_version, published_draft_version FROM content_draft ORDER BY id FOR UPDATE",
    );
    const drafts = draftResult.rows.filter((row) => row.version > row.published_draft_version);
    if (!drafts.length) {
      await client.query("COMMIT");
      transactionOpen = false;
      return { kind: "no-draft" };
    }

    const merged = mergeDraftSections({ content: published.content }, drafts);
    const content = (merged as { content: unknown }).content;
    const idempotencyKey = createContentPublishIdempotencyKey(published.version, content);

    let publishResult: PublishResult;
    try {
      publishResult = await publishContent(published.version, content, idempotencyKey);
    } catch {
      await client.query("ROLLBACK");
      transactionOpen = false;
      return { kind: "upstream-unavailable" };
    }
    if (!publishResult.ok) {
      await client.query("ROLLBACK");
      transactionOpen = false;
      return publishResult.status === 409 ? { kind: "conflict" } : { kind: "publish-failed" };
    }
    if (typeof publishResult.version !== "number") {
      await client.query("ROLLBACK");
      transactionOpen = false;
      return { kind: "unconfirmed" };
    }

    const publishedAt = new Date();
    for (const draft of drafts) {
      const saved = await client.query(
        `UPDATE content_draft SET source_version = $1, published_version = $1,
           published_draft_version = version, published_at = now(), updated_at = now()
         WHERE id = $2 AND version = $3`,
        [publishResult.version, draft.id, draft.version],
      );
      if (saved.rowCount !== 1) throw new Error("Draft changed while publishing.");
    }
    await client.query(
      "UPDATE content_draft_state SET published_version = version, updated_at = now() WHERE id = 'portfolio'",
    );
    await client.query("INSERT INTO admin_audit_log (actor, action) VALUES ($1, $2)", [actor, "content.published"]);
    await client.query("COMMIT");
    transactionOpen = false;
    return {
      kind: "published",
      version: publishResult.version,
      publishedAt,
    };
  } catch (error) {
    if (transactionOpen) await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function discardDraft(database: Pool, actor: string, section?: ContentSection): Promise<boolean> {
  const client = await database.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT version FROM content_draft_state WHERE id = 'portfolio' FOR UPDATE");
    const deleted = section
      ? await client.query("DELETE FROM content_draft WHERE id = $1 RETURNING id", [section])
      : await client.query("DELETE FROM content_draft WHERE id = ANY($1::text[]) RETURNING id", [CONTENT_SECTIONS]);
    if (deleted.rowCount) {
      await client.query("UPDATE content_draft_state SET version = version + 1, updated_at = now() WHERE id = 'portfolio'");
      await client.query("INSERT INTO admin_audit_log (actor, action) VALUES ($1, $2)", [actor, "content.draft_discarded"]);
    }
    await client.query("COMMIT");
    return Boolean(deleted.rowCount);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
