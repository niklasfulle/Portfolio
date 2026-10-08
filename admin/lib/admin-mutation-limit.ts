import { getAdminDatabase } from "@admin/lib/database";
import { isAdminMutationRateLimited } from "@admin/lib/mutation-rate-limit";

export async function isAdminMutationLimited(actor: string): Promise<boolean> {
  const database = getAdminDatabase();
  const result = await database.query<{ request_count: number }>(
    `INSERT INTO admin_api_rate_limit (actor, request_count, window_started_at)
     VALUES ($1, 1, now())
     ON CONFLICT (actor) DO UPDATE SET
       request_count = CASE
         WHEN admin_api_rate_limit.window_started_at <= now() - interval '1 minute' THEN 1
         ELSE admin_api_rate_limit.request_count + 1
       END,
       window_started_at = CASE
         WHEN admin_api_rate_limit.window_started_at <= now() - interval '1 minute' THEN now()
         ELSE admin_api_rate_limit.window_started_at
       END
     RETURNING request_count`,
    [actor],
  );
  return isAdminMutationRateLimited(Number(result.rows[0]?.request_count ?? 0));
}

export function rateLimitedResponse() {
  return Response.json(
    { message: "Too many admin changes. Wait a minute and try again." },
    { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "60" } },
  );
}
