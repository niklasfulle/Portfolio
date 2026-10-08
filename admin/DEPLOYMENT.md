# Admin deployment checklist

The admin console is a separate Next.js application. Deploy it on a private
admin hostname and keep the public portfolio and admin database endpoints
restricted to their intended network paths.

## Provisioning

1. Create a dedicated PostgreSQL database for the admin app and set
   `ADMIN_DATABASE_URL` only in the admin deployment's secret store.
2. Set a unique `BETTER_AUTH_SECRET`, the canonical HTTPS `BETTER_AUTH_URL`,
   and the first administrator's `ADMIN_EMAIL`.
3. Set a one-time high-entropy `ADMIN_BOOTSTRAP_TOKEN`, complete `/setup`, then
   remove that token from the runtime environment. Enroll TOTP and store the
   recovery codes offline before leaving setup.
4. Set `PORTFOLIO_CONTENT_API_URL` to the public app's `/api/admin/content`
   endpoint, and set the same high-entropy `ADMIN_CONTENT_API_TOKEN` in both
   deployments. Set `NEXT_PUBLIC_SITE_URL` to the canonical public origin.
5. Run `npm run auth:migrate` and then `npm run db:migrate` in the admin app.
   Before releasing the public app, back it up and apply the Prisma schema using
   the repository's current deployment workflow (`yarn prisma db push`); the
   new publish-key column is nullable and additive. Test this on staging first.
6. Serve both apps over HTTPS. Do not expose the admin database publicly;
   restrict admin access at the reverse proxy/VPN layer where practical.

## Operational checks

- Verify login requires TOTP after MFA enrollment; test one recovery code and
  confirm a code cannot be reused.
- Verify unauthenticated requests to admin APIs are rejected.
- Verify the public content API rejects missing/incorrect bearer tokens and
  that only the editor's allowed content schema is accepted.
- Verify `/preview` redirects unauthenticated users to login and requires MFA;
  it must use the saved draft while keeping it out of public routes and caches.
- Verify publishing updates live content and revalidates the portfolio cache.
- Verify a publish retry after a simulated lost API response reuses its stable
  idempotency key and does not apply the same publication twice.
- Rotate the shared API token and auth secrets through the deployment secret
  store; never commit production values or database dumps.
- Back up both databases before migrations and retain encrypted backups under
  an operator-defined retention policy. Restore into an isolated database and
  verify `/`, `/admin`, and `/preview` before switching traffic back.
- To recover an administrator, first use a stored one-time recovery code. If
  all recovery codes are unavailable, use the documented Better Auth account
  recovery procedure against a database backup in a controlled maintenance
  window; do not disable MFA or expose a public reset endpoint.

This checklist does not replace deployment-specific security review, backups,
monitoring, or recovery testing.
