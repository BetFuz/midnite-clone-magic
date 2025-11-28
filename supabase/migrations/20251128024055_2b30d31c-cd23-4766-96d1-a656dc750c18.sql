-- Create cashout_rules configuration table
CREATE TABLE IF NOT EXISTS public.cashout_rules (
  id INTEGER PRIMARY KEY DEFAULT 1,
  min_pct NUMERIC NOT NULL DEFAULT 5.0 CHECK (min_pct >= 0 AND min_pct <= 100),
  cool_down_seconds INTEGER NOT NULL DEFAULT 30 CHECK (cool_down_seconds >= 0),
  max_cashout_pct NUMERIC NOT NULL DEFAULT 95.0 CHECK (max_cashout_pct >= 0 AND max_cashout_pct <= 100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  CONSTRAINT single_config_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE public.cashout_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read, admin write
CREATE POLICY "Anyone can view cashout rules"
  ON public.cashout_rules
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can update cashout rules"
  ON public.cashout_rules
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Seed default configuration
INSERT INTO public.cashout_rules (id, min_pct, cool_down_seconds, max_cashout_pct)
VALUES (1, 5.0, 30, 95.0)
ON CONFLICT (id) DO NOTHING;

-- Create cashout_transactions table to track cash-out history
CREATE TABLE IF NOT EXISTS public.cashout_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_slip_id UUID NOT NULL REFERENCES public.bet_slips(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  original_stake NUMERIC NOT NULL,
  potential_win NUMERIC NOT NULL,
  cashout_amount NUMERIC NOT NULL,
  cashout_pct NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected', 'cancelled')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  last_cashout_at TIMESTAMPTZ -- Track last cashout attempt for cooldown
);

-- Enable RLS on cashout_transactions
ALTER TABLE public.cashout_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cashout_transactions
CREATE POLICY "Users can view own cashout transactions"
  ON public.cashout_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cashout transactions"
  ON public.cashout_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all cashout transactions"
  ON public.cashout_transactions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins can update cashout transactions"
  ON public.cashout_transactions
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Create indexes for performance
CREATE INDEX idx_cashout_transactions_user_id ON public.cashout_transactions(user_id);
CREATE INDEX idx_cashout_transactions_bet_slip_id ON public.cashout_transactions(bet_slip_id);
CREATE INDEX idx_cashout_transactions_status ON public.cashout_transactions(status);
CREATE INDEX idx_cashout_transactions_created_at ON public.cashout_transactions(created_at DESC);

-- Add trigger for updated_at on cashout_rules
CREATE TRIGGER set_cashout_rules_updated_at
  BEFORE UPDATE ON public.cashout_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.cashout_rules IS 'Configuration table for cash-out constraints: minimum percentage, cooldown timer, and maximum cashout percentage';
COMMENT ON COLUMN public.cashout_rules.min_pct IS 'Minimum cash-out percentage of potential win (default: 5%)';
COMMENT ON COLUMN public.cashout_rules.cool_down_seconds IS 'Cooldown period in seconds between cash-out attempts (default: 30s)';
COMMENT ON COLUMN public.cashout_rules.max_cashout_pct IS 'Maximum cash-out percentage allowed to prevent 100% cashouts (default: 95%)';
COMMENT ON TABLE public.cashout_transactions IS 'Tracks all cash-out transaction attempts and their outcomes';