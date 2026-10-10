ALTER TABLE admin_audit_log
  DROP CONSTRAINT IF EXISTS admin_audit_log_action_check;

ALTER TABLE admin_audit_log
  ADD CONSTRAINT admin_audit_log_action_check
  CHECK (action IN (
    'content.draft_saved', 'content.draft_discarded', 'content.published',
    'auth.login_attempt', 'auth.login_succeeded', 'auth.mfa_attempt', 'auth.mfa_succeeded',
    'auth.mfa_enabled', 'auth.mfa_disabled', 'auth.logout'
  ));
