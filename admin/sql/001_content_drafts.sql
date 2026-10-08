CREATE TABLE IF NOT EXISTS content_draft (
  id text PRIMARY KEY CHECK (id = 'portfolio'),
  payload jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  source_version integer NOT NULL DEFAULT 0 CHECK (source_version >= 0),
  published_version integer NOT NULL DEFAULT 0 CHECK (published_version >= 0),
  published_draft_version integer NOT NULL DEFAULT 0 CHECK (published_draft_version >= 0),
  updated_by text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor text NOT NULL,
  action text NOT NULL CHECK (action IN ('content.draft_saved', 'content.draft_discarded', 'content.published', 'auth.login_attempt', 'auth.login_succeeded', 'auth.mfa_succeeded', 'auth.mfa_enabled', 'auth.mfa_disabled', 'auth.logout')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_log_created_at_idx
  ON admin_audit_log (created_at DESC);

CREATE TABLE IF NOT EXISTS admin_api_rate_limit (
  actor text PRIMARY KEY,
  request_count integer NOT NULL CHECK (request_count > 0),
  window_started_at timestamptz NOT NULL
);
