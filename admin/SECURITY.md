# Admin security and privacy notes

## Trust boundaries

- The admin console and its PostgreSQL database are separate from the public
  portfolio runtime.
- Admin UI mutations require an authenticated Better Auth session with TOTP
  enabled. The app sends users without MFA to setup before protected routes.
- The public app's admin content endpoints accept a server-to-server bearer
  token. The token is a deployment secret and must never reach client bundles.
- The preview is rendered inside the admin application, requires the same
  MFA-authenticated session, and is noindex/no-follow. No preview bearer URL or
  preview token is used.
- Mutating admin content requests require a matching Origin and are limited to
  20 requests per admin per minute in the admin database. Better Auth login
  and MFA endpoints use database-backed rate limiting.
- Security headers include a restrictive CSP, frame denial, no-referrer,
  nosniff, and production HSTS. CORS is not enabled for the admin application.
- MFA recovery codes are stored encrypted using Better Auth's server secret
  and are consumed after a successful one-time use.
- Database queries are parameterized; content is validated with strict Zod
  schemas and only allowed fields can be persisted. Project key points require
  at least six entries.

## Data handled

The admin database stores administrator account/authenticator data, content
draft JSON, draft version metadata, mutation rate-limit counters, and audit
events (actor ID, action, timestamp). Authentication audit events do not store
passwords, TOTP values, recovery codes, or IP addresses. It does not need
visitor accounts or visitor analytics. Configure database backups and
retention according to the operator's requirements; no retention period is
assumed by this project.

## Required deployment controls

- HTTPS for both apps; secure cookies and production-only secrets.
- Network/firewall restrictions for the admin app and database.
- High-entropy independent values for `BETTER_AUTH_SECRET`,
  `ADMIN_CONTENT_API_TOKEN`, and `ADMIN_BOOTSTRAP_TOKEN`.
- Remove the bootstrap token immediately after creating the first account.
- Restrict registration to the configured bootstrap process; do not enable
  public sign-up.
- Monitor authentication attempts and database/API errors without logging
  passwords, TOTP values, recovery codes, or bearer tokens.
- Review proxy logs, backup access, incident response, and administrator
  recovery procedures before production. The application has no email-based
  admin recovery flow; recovery uses one-time MFA recovery codes and operator
  access to the admin database.

## Remaining operator decisions

This repository cannot establish the hosting jurisdiction, controller identity,
data-retention periods, backup schedule, breach process, or the administrator's
legal notice. The operator must decide and document these for the real
deployment. Review Better Auth, PostgreSQL hosting, and any reverse-proxy logs
as processors/recipients in the deployment's privacy documentation.
