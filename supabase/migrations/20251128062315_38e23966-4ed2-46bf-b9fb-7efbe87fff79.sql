-- Bonus & CRM Edge-cases System

-- Bonus abuse detection flags
CREATE TABLE IF NOT EXISTS public.bonus_abuse_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  flag_type TEXT NOT NULL, -- 'ip_match', 'device_match', 'payment_duplicate', 'rapid_hedge', etc.
  severity TEXT NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  details JSONB DEFAULT '{}',
  related_user_ids UUID[] DEFAULT '{}',
  ip_address INET,
  device_fingerprint TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID
);

-- Bonus forfeitures (user cancels bonus)
CREATE TABLE IF NOT EXISTS public.bonus_forfeitures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bonus_id UUID NOT NULL,
  bonus_type TEXT NOT NULL, -- 'deposit', 'free_bet', 'cashback'
  forfeited_amount NUMERIC NOT NULL,
  rollover_cleared NUMERIC NOT NULL DEFAULT 0,
  rollover_remaining NUMERIC NOT NULL,
  reason TEXT DEFAULT 'user_requested',
  created_at TIMESTAMPTZ DEFAULT now(),
  balance_adjusted BOOLEAN DEFAULT false
);

-- Free bet tokens
CREATE TABLE IF NOT EXISTS public.free_bet_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token_code TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'used', 'expired', 'cancelled'
  expires_at TIMESTAMPTZ NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ,
  bet_slip_id UUID,
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,
  source TEXT DEFAULT 'promotion', -- 'promotion', 'compensation', 'referral'
  terms JSONB DEFAULT '{}'
);

-- Bonus rollover tracking
CREATE TABLE IF NOT EXISTS public.bonus_rollover (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bonus_id UUID NOT NULL,
  bonus_type TEXT NOT NULL,
  total_required NUMERIC NOT NULL,
  completed NUMERIC NOT NULL DEFAULT 0,
  remaining NUMERIC NOT NULL,
  min_odds NUMERIC DEFAULT 1.5,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'forfeited'
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  forfeited_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE public.bonus_abuse_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_forfeitures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_bet_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_rollover ENABLE ROW LEVEL SECURITY;

-- Bonus abuse flags - admin only
CREATE POLICY "Admins can view abuse flags"
  ON public.bonus_abuse_flags
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "System can create abuse flags"
  ON public.bonus_abuse_flags
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can resolve abuse flags"
  ON public.bonus_abuse_flags
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Bonus forfeitures - user can view own, admins view all
CREATE POLICY "Users can view own forfeitures"
  ON public.bonus_forfeitures
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all forfeitures"
  ON public.bonus_forfeitures
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can create forfeitures"
  ON public.bonus_forfeitures
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Free bet tokens - user owned
CREATE POLICY "Users can view own tokens"
  ON public.free_bet_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage tokens"
  ON public.free_bet_tokens
  FOR ALL
  USING (true);

-- Bonus rollover - user can view own
CREATE POLICY "Users can view own rollover"
  ON public.bonus_rollover
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rollover"
  ON public.bonus_rollover
  FOR ALL
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_abuse_flags_user ON public.bonus_abuse_flags(user_id, resolved);
CREATE INDEX IF NOT EXISTS idx_abuse_flags_ip ON public.bonus_abuse_flags(ip_address);
CREATE INDEX IF NOT EXISTS idx_abuse_flags_device ON public.bonus_abuse_flags(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_forfeitures_user ON public.bonus_forfeitures(user_id);
CREATE INDEX IF NOT EXISTS idx_free_bet_tokens_user ON public.free_bet_tokens(user_id, status);
CREATE INDEX IF NOT EXISTS idx_free_bet_tokens_expiry ON public.free_bet_tokens(expires_at, status);
CREATE INDEX IF NOT EXISTS idx_rollover_user ON public.bonus_rollover(user_id, status);