-- Long-Running Query Protection
-- Prevents badly written queries from locking tables during high-traffic periods
-- Sets 30-second timeout for user queries, unlimited for admin operations

-- Set statement timeout for authenticator role (API queries)
ALTER ROLE authenticator SET statement_timeout = '30s';

-- Set statement timeout for anon role (unauthenticated queries)
ALTER ROLE anon SET statement_timeout = '30s';

-- Keep unlimited timeout for admin operations (reports, migrations, etc.)
-- supabase_admin and postgres roles retain default unlimited timeout

-- Create function to log slow queries (called automatically by Postgres log settings)
CREATE OR REPLACE FUNCTION public.log_slow_query(
  p_query TEXT,
  p_duration_ms NUMERIC,
  p_user_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log to admin_audit_log for Slack notification integration
  INSERT INTO admin_audit_log (
    admin_id,
    action,
    resource_type,
    resource_id,
    status,
    error_message,
    mfa_verified
  ) VALUES (
    COALESCE(p_user_id, '00000000-0000-0000-0000-000000000000'::UUID),
    'slow_query_detected',
    'database',
    NULL,
    'warning',
    format('Query took %s ms: %s', p_duration_ms, LEFT(p_query, 500)),
    false
  );
END;
$$;

-- Add index on admin_audit_log for slow query filtering
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_slow_queries 
  ON admin_audit_log(action, created_at DESC) 
  WHERE action = 'slow_query_detected';

COMMENT ON FUNCTION public.log_slow_query(TEXT, NUMERIC, UUID) IS 'Logs slow queries exceeding threshold for monitoring and alerting. Integrates with Slack notifications via admin_audit_log.';

-- Note: To enable automatic slow query logging, configure PostgreSQL log settings:
-- log_min_duration_statement = 5000 (log queries > 5 seconds)
-- This requires database admin access to modify postgresql.conf