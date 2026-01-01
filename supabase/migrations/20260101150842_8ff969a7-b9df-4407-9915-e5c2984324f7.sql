-- Add push_token to profiles for mobile notifications
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Create country/tenant management for multi-tenant admin
CREATE TABLE IF NOT EXISTS public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'NGN',
  is_active BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'Africa/Lagos',
  regulatory_body TEXT,
  license_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default countries
INSERT INTO public.countries (code, name, currency_code, regulatory_body) VALUES
  ('NG', 'Nigeria', 'NGN', 'NLRC'),
  ('GH', 'Ghana', 'GHS', 'Gaming Commission of Ghana'),
  ('KE', 'Kenya', 'KES', 'BCLB'),
  ('ZA', 'South Africa', 'ZAR', 'NGB')
ON CONFLICT (code) DO NOTHING;

-- Rate limiting table for WAF functionality
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for fast IP lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint 
ON public.rate_limits(ip_address, endpoint);

-- Security alerts for WAF
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ip_address INET,
  user_id UUID REFERENCES auth.users(id),
  user_agent TEXT,
  endpoint TEXT,
  payload_sample JSONB,
  country_code TEXT,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- n8n webhook logs for automation tracking
CREATE TABLE IF NOT EXISTS public.n8n_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT NOT NULL,
  workflow_name TEXT,
  trigger_event TEXT NOT NULL,
  payload JSONB,
  response_status INTEGER,
  response_body JSONB,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Countries - readable by all authenticated, writable by admins
CREATE POLICY "Countries are readable by authenticated users"
ON public.countries FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can modify countries"
ON public.countries FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Rate limits - only accessible by service role (edge functions)
CREATE POLICY "Rate limits accessible by service role only"
ON public.rate_limits FOR ALL
TO service_role
USING (true);

-- Security events - admins only
CREATE POLICY "Security events visible to admins"
ON public.security_events FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Security events insertable by service role"
ON public.security_events FOR INSERT
TO service_role
WITH CHECK (true);

-- n8n logs - admins only
CREATE POLICY "n8n logs visible to admins"
ON public.n8n_webhook_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "n8n logs insertable by service role"
ON public.n8n_webhook_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_ip_address INET,
  p_endpoint TEXT,
  p_limit INTEGER DEFAULT 100,
  p_window_seconds INTEGER DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record rate_limits%ROWTYPE;
  v_now TIMESTAMPTZ := now();
  v_window_start TIMESTAMPTZ := v_now - (p_window_seconds || ' seconds')::INTERVAL;
BEGIN
  -- Check if IP is currently blocked
  SELECT * INTO v_record
  FROM rate_limits
  WHERE ip_address = p_ip_address
    AND endpoint = p_endpoint
    AND blocked_until > v_now;
  
  IF FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked_until', v_record.blocked_until,
      'reason', 'Rate limit exceeded, temporarily blocked'
    );
  END IF;

  -- Count requests in current window
  SELECT * INTO v_record
  FROM rate_limits
  WHERE ip_address = p_ip_address
    AND endpoint = p_endpoint
    AND window_start > v_window_start;

  IF FOUND THEN
    IF v_record.request_count >= p_limit THEN
      -- Block for 5 minutes
      UPDATE rate_limits
      SET blocked_until = v_now + INTERVAL '5 minutes',
          request_count = request_count + 1
      WHERE id = v_record.id;
      
      -- Log security event
      INSERT INTO security_events (event_type, severity, ip_address, endpoint, action_taken)
      VALUES ('rate_limit_exceeded', 'medium', p_ip_address, p_endpoint, 'blocked_5_minutes');
      
      RETURN jsonb_build_object(
        'allowed', false,
        'blocked_until', v_now + INTERVAL '5 minutes',
        'reason', 'Rate limit exceeded'
      );
    ELSE
      UPDATE rate_limits
      SET request_count = request_count + 1
      WHERE id = v_record.id;
    END IF;
  ELSE
    -- Create new rate limit record
    INSERT INTO rate_limits (ip_address, endpoint, request_count, window_start)
    VALUES (p_ip_address, p_endpoint, 1, v_now);
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', p_limit - COALESCE(v_record.request_count, 0) - 1
  );
END;
$$;