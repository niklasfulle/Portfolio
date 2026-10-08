ALTER TABLE content_draft
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

ALTER TABLE content_draft
  ADD COLUMN IF NOT EXISTS published_draft_version integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS admin_api_rate_limit (
  actor text PRIMARY KEY,
  request_count integer NOT NULL CHECK (request_count > 0),
  window_started_at timestamptz NOT NULL
);
