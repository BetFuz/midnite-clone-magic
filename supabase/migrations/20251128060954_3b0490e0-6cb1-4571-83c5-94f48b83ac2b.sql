-- State-by-state gaming tax rates
CREATE TABLE IF NOT EXISTS state_tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code TEXT NOT NULL UNIQUE,
  state_name TEXT NOT NULL,
  tax_rate NUMERIC NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 100),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tax accruals per user per period
CREATE TABLE IF NOT EXISTS tax_accruals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  state_code TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_gaming_revenue NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL,
  tax_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'remitted', 'failed')),
  remitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Suspicious Activity Reports (SAR)
CREATE TABLE IF NOT EXISTS sar_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('high_volume_24h', 'structuring', 'rapid_in_out', 'multiple_accounts')),
  amount_24h NUMERIC NOT NULL DEFAULT 0,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  pattern_details JSONB DEFAULT '{}',
  xml_content TEXT,
  xml_path TEXT,
  filed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'filed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Self-exclusion registry (syncs to NLRC)
CREATE TABLE IF NOT EXISTS self_exclusion_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  exclusion_type TEXT NOT NULL CHECK (exclusion_type IN ('permanent', 'temporary', 'cooling_off')),
  reason TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  synced_to_nlrc_at TIMESTAMPTZ,
  nlrc_sync_status TEXT DEFAULT 'pending' CHECK (nlrc_sync_status IN ('pending', 'synced', 'failed')),
  nlrc_reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Advertising compliance logs
CREATE TABLE IF NOT EXISTS advertising_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'push', 'in_app')),
  message_type TEXT NOT NULL,
  message_content TEXT NOT NULL,
  compliance_footer TEXT NOT NULL,
  helpline_included BOOLEAN NOT NULL DEFAULT true,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add age verification and state to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS is_age_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS state_code TEXT,
ADD COLUMN IF NOT EXISTS nin_verification_status TEXT DEFAULT 'pending' CHECK (nin_verification_status IN ('pending', 'verified', 'failed', 'rejected'));

-- RLS Policies
ALTER TABLE state_tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_accruals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sar_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_exclusion_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertising_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all tax data
CREATE POLICY "Admins can view all tax rates" ON state_tax_rates
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Admins can manage tax rates" ON state_tax_rates
  FOR ALL USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Users can view their own tax accruals
CREATE POLICY "Users can view own tax accruals" ON tax_accruals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tax accruals" ON tax_accruals
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "System can insert tax accruals" ON tax_accruals
  FOR INSERT WITH CHECK (true);

-- Admins can view SAR filings
CREATE POLICY "Admins can view SAR filings" ON sar_filings
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "System can insert SAR filings" ON sar_filings
  FOR INSERT WITH CHECK (true);

-- Users can view own self-exclusion
CREATE POLICY "Users can view own self-exclusion" ON self_exclusion_registry
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create self-exclusion" ON self_exclusion_registry
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all self-exclusions" ON self_exclusion_registry
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Admins can view advertising logs
CREATE POLICY "Admins can view advertising logs" ON advertising_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "System can insert advertising logs" ON advertising_logs
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tax_accruals_user_id ON tax_accruals(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_accruals_period ON tax_accruals(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_sar_filings_user_id ON sar_filings(user_id);
CREATE INDEX IF NOT EXISTS idx_sar_filings_status ON sar_filings(status);
CREATE INDEX IF NOT EXISTS idx_self_exclusion_user_id ON self_exclusion_registry(user_id);
CREATE INDEX IF NOT EXISTS idx_advertising_logs_user_id ON advertising_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_advertising_logs_sent_at ON advertising_logs(sent_at);

-- Seed Nigerian state tax rates
INSERT INTO state_tax_rates (state_code, state_name, tax_rate) VALUES
  ('LA', 'Lagos', 5.0),
  ('OY', 'Oyo', 3.0),
  ('FC', 'Federal Capital Territory', 7.0),
  ('KN', 'Kano', 4.0),
  ('RV', 'Rivers', 5.5),
  ('AN', 'Anambra', 4.5),
  ('KD', 'Kaduna', 4.0),
  ('OG', 'Ogun', 4.5),
  ('AB', 'Abia', 3.5),
  ('DT', 'Delta', 4.0)
ON CONFLICT (state_code) DO NOTHING;