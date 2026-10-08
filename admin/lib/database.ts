
import { Pool } from "pg";

let pool: Pool | undefined;

export function getAdminDatabase() {
  if (pool) return pool;
  const connectionString = process.env.ADMIN_DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing required server environment variable: ADMIN_DATABASE_URL");
  }
  pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 30_000 });
  return pool;
}
