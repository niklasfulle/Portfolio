# Portfolio Admin

Standalone Next.js application for managing Portfolio content. It has its own
package manifest and starts independently from the public site on
`http://127.0.0.1:3001`.

## Local development

```powershell
cd admin
Copy-Item .env.example .env.local
npm install
npm run auth:migrate
npm run db:migrate
npm run dev
```

Set all values in `.env.local` before migrating. Open `http://127.0.0.1:3001/setup`
to create the one configured admin account. The setup request requires the
configured `ADMIN_EMAIL` and `ADMIN_BOOTSTRAP_TOKEN`; after account creation,
remove the bootstrap token from the runtime environment. The first login must
enroll an authenticator app and verify a TOTP code before `/admin` is available.

The admin database should be a dedicated PostgreSQL database. The admin app uses
it for Better Auth accounts and sessions plus a separate draft table. The
Portfolio application receives the same high-entropy `ADMIN_CONTENT_API_TOKEN`
in its server environment. Configure that token on both servers and keep it out
of browser-visible variables. The root `.env.example` documents the Portfolio
side; `admin/.env.example` documents the admin side.

The editor stores changes in the admin database as drafts. Publishing is an
explicit action that sends the draft through the authenticated server-to-server
content API. `/preview` is rendered by this app from the saved draft and is
guarded by the same authenticated, MFA-enabled admin session as `/admin`.
Preview does not use public bearer links and cannot submit the contact form.

Each saved draft revision uses a deterministic idempotency key when published.
If the Portfolio API commits but its response is lost, retrying the same draft
confirms that commit rather than applying the content a second time.

## Configuration

`PORTFOLIO_CONTENT_API_URL` must identify the Portfolio server-side content API,
including `/api/admin/content`. The admin
browser must never connect directly to the Portfolio database. Keep API secrets
and credentials on the server and out of `NEXT_PUBLIC_*` variables.

The auth service uses the separate `ADMIN_DATABASE_URL`, `BETTER_AUTH_SECRET`,
`BETTER_AUTH_URL`, `ADMIN_APP_ORIGIN`, `ADMIN_EMAIL`, and
`ADMIN_BOOTSTRAP_TOKEN` settings. Generate independent high-entropy secrets of
at least 32 characters and store them in the deployment secret manager. The
signup endpoint only accepts the configured admin email and bootstrap token,
and becomes unavailable once the first user exists. Remove the bootstrap token
from the environment after initial account creation.

## Deployment boundary

Deploy this application independently from the public Portfolio. Keep its
database and admin hostname private. `NEXT_PUBLIC_SITE_URL` is used only to send
legal/footer links from the preview back to the public site. Do not deploy until
the documented MFA, secret, TLS, backup, and access controls are configured.
