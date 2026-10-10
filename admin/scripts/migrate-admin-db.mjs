import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const connectionString = process.env.ADMIN_DATABASE_URL;
if (!connectionString) {
  throw new Error("Set ADMIN_DATABASE_URL before applying the admin database migration.");
}

const migrationPaths = [
  fileURLToPath(new URL("../sql/001_content_drafts.sql", import.meta.url)),
  fileURLToPath(new URL("../sql/002_admin_audit_draft_discard.sql", import.meta.url)),
  fileURLToPath(new URL("../sql/003_admin_publish_timestamp.sql", import.meta.url)),
  fileURLToPath(new URL("../sql/004_admin_mfa_attempt_audit.sql", import.meta.url)),
  fileURLToPath(new URL("../sql/005_admin_roles_and_section_drafts.sql", import.meta.url)),
];
const pool = new Pool({ connectionString, max: 1 });

try {
  for (const migrationPath of migrationPaths) {
    const migration = await readFile(migrationPath, "utf8");
    await pool.query(migration);
  }
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail) {
    await pool.query(
      `INSERT INTO admin_user_role (user_id, role)
       SELECT id, 'admin' FROM "user" WHERE lower(email) = $1
       ON CONFLICT (user_id) DO NOTHING`,
      [adminEmail],
    );
  }
  process.stdout.write("Admin content tables are ready.\n");
} finally {
  await pool.end();
}
