CREATE TABLE IF NOT EXISTS admin_user_role (
  user_id text PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_draft_state (
  id text PRIMARY KEY CHECK (id = 'portfolio'),
  version integer NOT NULL DEFAULT 0 CHECK (version >= 0),
  published_version integer NOT NULL DEFAULT 0 CHECK (published_version >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO content_draft_state (id, version, published_version)
VALUES (
  'portfolio',
  COALESCE((SELECT version FROM content_draft WHERE id = 'portfolio'), 0),
  COALESCE((SELECT published_draft_version FROM content_draft WHERE id = 'portfolio'), 0)
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE content_draft DROP CONSTRAINT IF EXISTS content_draft_id_check;

INSERT INTO content_draft (
  id, payload, version, source_version, published_version,
  published_draft_version, updated_by, updated_at, published_at
)
SELECT
  section.key,
  section.value,
  legacy.version,
  legacy.source_version,
  legacy.published_version,
  legacy.published_draft_version,
  legacy.updated_by,
  legacy.updated_at,
  legacy.published_at
FROM content_draft AS legacy
CROSS JOIN LATERAL jsonb_each(legacy.payload) AS section(key, value)
WHERE legacy.id = 'portfolio'
  AND section.key IN ('aboutMe', 'projects', 'skills', 'experience', 'contactEmail')
ON CONFLICT (id) DO NOTHING;

DELETE FROM content_draft WHERE id = 'portfolio';

ALTER TABLE content_draft
  ADD CONSTRAINT content_draft_id_check
  CHECK (id IN ('aboutMe', 'projects', 'skills', 'experience', 'contactEmail'));
