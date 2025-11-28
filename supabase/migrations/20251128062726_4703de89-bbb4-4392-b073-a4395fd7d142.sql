-- Payment & Reconciliation System

-- NUBAN name matching logs
CREATE TABLE IF NOT EXISTS public.nuban_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  withdrawal_id UUID NOT NULL,
  bank_name TEXT NOT NULL,
  kyc_name TEXT NOT NULL,
  fuzzy_score NUMERIC NOT NULL,
  match_result TEXT NOT NULL, -- 'approved', 'manual_review', 'rejected'
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Instant payout tracking
CREATE TABLE IF NOT EXISTS public.instant_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  withdrawal_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  bank_code TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'zenith_rtp', -- 'zenith_rtp', 'flutterwave', 'paystack'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  transaction_ref TEXT,
  processing_time_ms INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  error_message TEXT
);

-- Deposit reconciliation
CREATE TABLE IF NOT EXISTS public.deposit_reconciliation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_date DATE NOT NULL,
  provider TEXT NOT NULL, -- 'flutterwave', 'paystack'
  ledger_total NUMERIC NOT NULL DEFAULT 0,
  settlement_total NUMERIC NOT NULL DEFAULT 0,
  difference NUMERIC NOT NULL DEFAULT 0,
  matched_count INTEGER NOT NULL DEFAULT 0,
  unmatched_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'matched', 'mismatched'
  settlement_file_path TEXT,
  support_ticket_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  reconciled_at TIMESTAMPTZ
);

-- Failed deposit retries
CREATE TABLE IF NOT EXISTS public.failed_deposit_retries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  original_transaction_ref TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  bank_code TEXT NOT NULL,
  account_number TEXT NOT NULL,
  failure_reason TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 48, -- 24h x 2 retries/hour
  next_retry_at TIMESTAMPTZ,
  last_retry_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'retrying', 'success', 'exhausted'
  success_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  sms_notifications_sent INTEGER DEFAULT 0
);

-- RLS Policies
ALTER TABLE public.nuban_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instant_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_reconciliation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_deposit_retries ENABLE ROW LEVEL SECURITY;

-- NUBAN validations - user can view own, admins view all
CREATE POLICY "Users can view own validations"
  ON public.nuban_validations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all validations"
  ON public.nuban_validations
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "System can create validations"
  ON public.nuban_validations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can review validations"
  ON public.nuban_validations
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Instant payouts - user can view own
CREATE POLICY "Users can view own payouts"
  ON public.instant_payouts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage payouts"
  ON public.instant_payouts
  FOR ALL
  USING (true);

-- Deposit reconciliation - admin only
CREATE POLICY "Admins can view reconciliation"
  ON public.deposit_reconciliation
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "System can manage reconciliation"
  ON public.deposit_reconciliation
  FOR ALL
  USING (true);

-- Failed deposit retries - user can view own
CREATE POLICY "Users can view own retries"
  ON public.failed_deposit_retries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage retries"
  ON public.failed_deposit_retries
  FOR ALL
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_nuban_validations_user ON public.nuban_validations(user_id, match_result);
CREATE INDEX IF NOT EXISTS idx_nuban_validations_withdrawal ON public.nuban_validations(withdrawal_id);
CREATE INDEX IF NOT EXISTS idx_instant_payouts_user ON public.instant_payouts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_instant_payouts_created ON public.instant_payouts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reconciliation_date ON public.deposit_reconciliation(reconciliation_date, status);
CREATE INDEX IF NOT EXISTS idx_failed_retries_status ON public.failed_deposit_retries(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_failed_retries_user ON public.failed_deposit_retries(user_id);