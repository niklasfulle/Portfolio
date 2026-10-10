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
- To recover an administrator, first use a stored one-time recovery code. If
  all recovery codes are unavailable, use the documented Better Auth account
  recovery procedure against a database backup in a controlled maintenance
  window; do not disable MFA or expose a public reset endpoint.

This checklist does not replace deployment-specific security review, backups,
monitoring, or recovery testing.

## Backup and restore verification

### Automated evidence

- `npm test --prefix admin` checks the mutation-limit boundary and the HTTP
  `429` response contract (`Retry-After: 60`, `Cache-Control: no-store`).
- When `ADMIN_INTEGRATION_DATABASE_URL` points to an isolated local database
  whose name ends in `_test`, the same suite also makes 21 requests through the
  database-backed limiter and verifies the first 20 are allowed and the next
  is throttled. The test removes its uniquely named rate-limit row afterward.
- The auth audit safety test statically guards the audit insert sinks and
  schema: auth audit rows may contain only actor/action metadata, and the auth
  module must not directly log request or credential material.

These tests do not exercise a production reverse proxy, provider-level logs,
Better Auth's internal diagnostics, or a real backup restore. Configure the
integration database using test-only credentials; never point it at either
live database.

### Manual backup and restore drill

Run this from the repository root in PowerShell 7.4 or newer, with the Compose
database healthy and an operator-approved maintenance window. Set
`PORTFOLIO_BACKUP_DIR` to an access-restricted, encrypted-at-rest location
before running the commands. The procedure backs up both logical databases in
the single PostgreSQL 18 container, then restores them to uniquely named
scratch databases. Do not point the restore commands at `portfolio` or
`portfolio_admin`. PowerShell 7.4+ is required so native command redirection
preserves the custom-format dump bytes.

The dumps contain portfolio content and admin account/session/MFA data. Store
them only in an access-restricted location, encrypt them at rest and before
off-site transfer, and apply the retention period approved by the operator.
Pause editorial writes while taking the pair of dumps so the public and admin
snapshots correspond to the same maintenance window.

```powershell
$stamp = Get-Date -Format 'yyyyMMddHHmmss'
$backupRoot = $env:PORTFOLIO_BACKUP_DIR
if (-not $backupRoot) { throw 'Set PORTFOLIO_BACKUP_DIR to an approved encrypted backup location.' }
$backupDir = Join-Path $backupRoot "portfolio-restore-check-$stamp"
New-Item -ItemType Directory -Path $backupDir | Out-Null
$portfolioDump = Join-Path $backupDir 'portfolio.dump'
$adminDump = Join-Path $backupDir 'portfolio-admin.dump'

docker compose exec -T db sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump --format=custom --no-owner --no-acl -U "$POSTGRES_USER" -d portfolio' > $portfolioDump
if ($LASTEXITCODE -ne 0) { throw 'Portfolio backup failed.' }
docker compose exec -T db sh -c 'PGPASSWORD="$POSTGRES_ADMIN_PASSWORD" pg_dump --format=custom --no-owner --no-acl -U "$POSTGRES_ADMIN_USER" -d "$POSTGRES_ADMIN_DB"' > $adminDump
if ($LASTEXITCODE -ne 0) { throw 'Admin backup failed.' }
if ((Get-Item $portfolioDump).Length -eq 0 -or (Get-Item $adminDump).Length -eq 0) {
  throw 'A backup archive is empty.'
}

$portfolioRestoreDb = "portfolio_restore_$stamp"
$adminRestoreDb = "portfolio_admin_restore_$stamp"

docker compose exec -T -e RESTORE_DB=$portfolioRestoreDb db sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" createdb -U "$POSTGRES_USER" --owner="$POSTGRES_USER" "$RESTORE_DB"'
if ($LASTEXITCODE -ne 0) { throw 'Could not create the Portfolio scratch database.' }
docker compose exec -T -e RESTORE_DB=$adminRestoreDb db sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" createdb -U "$POSTGRES_USER" --owner="$POSTGRES_ADMIN_USER" "$RESTORE_DB"'
if ($LASTEXITCODE -ne 0) { throw 'Could not create the admin scratch database.' }

docker compose exec -T -e RESTORE_DB=$portfolioRestoreDb db sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" pg_restore --exit-on-error --no-owner --no-acl -U "$POSTGRES_USER" -d "$RESTORE_DB"' < $portfolioDump
if ($LASTEXITCODE -ne 0) { throw 'Portfolio restore failed.' }
docker compose exec -T -e RESTORE_DB=$adminRestoreDb db sh -c 'PGPASSWORD="$POSTGRES_ADMIN_PASSWORD" pg_restore --exit-on-error --no-owner --no-acl -U "$POSTGRES_ADMIN_USER" -d "$RESTORE_DB"' < $adminDump
if ($LASTEXITCODE -ne 0) { throw 'Admin restore failed.' }

$portfolioCheck = "SELECT count(*) > 0 FROM pg_catalog.pg_tables WHERE schemaname = 'public';"
$portfolioCheck | docker compose exec -T -e RESTORE_DB=$portfolioRestoreDb db sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$RESTORE_DB" -At'
if ($LASTEXITCODE -ne 0) { throw 'Portfolio scratch-database check failed.' }
$adminCheck = "SELECT current_database(), to_regclass('public.admin_audit_log') IS NOT NULL, to_regclass('public.content_draft') IS NOT NULL;"
$adminCheck | docker compose exec -T -e RESTORE_DB=$adminRestoreDb db sh -c 'PGPASSWORD="$POSTGRES_ADMIN_PASSWORD" psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_ADMIN_USER" -d "$RESTORE_DB" -At'
if ($LASTEXITCODE -ne 0) { throw 'Admin scratch-database check failed.' }
```

Confirm the Portfolio check reports `t` (non-empty public schema) and the
admin check reports the scratch database name followed by `t|t` (audit table,
draft table). Then,
in a staging deployment pointed only at these scratch restores and a staging or
mock Portfolio content API, manually verify the expected public page, admin
login/MFA, and draft preview. Do not test publishing against the production
content API during a restore drill.

Before cleanup, verify the two database names still equal the generated
`portfolio_restore_$stamp` and `portfolio_admin_restore_$stamp` values. Drop
only those scratch databases; preserve or securely dispose of the dump files
according to the approved backup retention policy. A successful local drill
does not prove provider snapshots, off-site encryption, production failover,
or rollback timing; those remain operator-run checks and should be recorded
with the drill date, operator, backup location, and result.
