import { createContentPublishIdempotencyKey } from "@/lib/content-publish-idempotency";
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

export async function publishDraft(
  database: Pool,
  actor: string,
  publishContent: (expectedVersion: number, content: unknown, idempotencyKey: string) => Promise<PublishResult>,
): Promise<PublishOutcome> {
  const client = await database.connect();
  let transactionOpen = false;
  try {
    await client.query("BEGIN");
    transactionOpen = true;
    const draftResult = await client.query<{
      payload: unknown;
      version: number;
      source_version: number;
      published_draft_version: number;
    }>("SELECT payload, version, source_version, published_draft_version FROM content_draft WHERE id = $1 FOR UPDATE", ["portfolio"]);
    const draft = draftResult.rows[0];
    if (!draft) {
      await client.query("COMMIT");
      transactionOpen = false;
      return { kind: "no-draft" };
    }
    if (draft.version <= draft.published_draft_version) {
      await client.query("COMMIT");
      transactionOpen = false;
      return { kind: "no-unpublished-draft" };
    }

    let publishResult: PublishResult;
    const idempotencyKey = createContentPublishIdempotencyKey(draft.source_version, draft.payload);
    try {
      publishResult = await publishContent(draft.source_version, draft.payload, idempotencyKey);
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

    const saved = await client.query<{ published_at: Date }>(
      `UPDATE content_draft
         SET source_version = $1, published_version = $1, published_draft_version = $3,
             published_at = now(), updated_at = now()
       WHERE id = $2 AND version = $3
       RETURNING published_at`,
      [publishResult.version, "portfolio", draft.version],
    );
    if (saved.rowCount !== 1) throw new Error("Draft changed while publishing.");
    await client.query("INSERT INTO admin_audit_log (actor, action) VALUES ($1, $2)", [actor, "content.published"]);
    await client.query("COMMIT");
    transactionOpen = false;
    return {
      kind: "published",
      version: publishResult.version,
      publishedAt: saved.rows[0].published_at,
    };
  } catch (error) {
    if (transactionOpen) await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function discardDraft(database: Pool, actor: string): Promise<boolean> {
  const client = await database.connect();
  try {
    await client.query("BEGIN");
    const deleted = await client.query("DELETE FROM content_draft WHERE id = $1 RETURNING id", ["portfolio"]);
    if (deleted.rowCount) {
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
