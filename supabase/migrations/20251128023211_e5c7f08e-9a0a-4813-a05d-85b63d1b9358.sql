-- Post-Launch Growth Features

-- Affiliate boost periods tracking
CREATE TABLE IF NOT EXISTS public.affiliate_boost_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  commission_multiplier NUMERIC NOT NULL DEFAULT 2.0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payment method wait-list
CREATE TABLE IF NOT EXISTS public.payment_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('apple_pay', 'google_pay')),
  user_id UUID REFERENCES auth.users(id),
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(email, payment_method)
);

-- Retention incentives tracking
CREATE TABLE IF NOT EXISTS public.retention_incentives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  incentive_type TEXT NOT NULL DEFAULT 'inactive_bonus',
  amount NUMERIC NOT NULL,
  credited_at TIMESTAMPTZ DEFAULT now(),
  days_inactive INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'
);

-- Daily retention spend cap tracking
CREATE TABLE IF NOT EXISTS public.daily_retention_caps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cap_date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  cap_limit NUMERIC NOT NULL DEFAULT 50000,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_boost_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retention_incentives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_retention_caps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_boost_periods
CREATE POLICY "Admins can manage boost periods"
  ON public.affiliate_boost_periods
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Anyone can view active boost periods"
  ON public.affiliate_boost_periods
  FOR SELECT
  USING (is_active = true);

-- RLS Policies for payment_waitlist
CREATE POLICY "Users can join waitlist"
  ON public.payment_waitlist
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own waitlist entries"
  ON public.payment_waitlist
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all waitlist"
  ON public.payment_waitlist
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins can update waitlist"
  ON public.payment_waitlist
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- RLS Policies for retention_incentives
CREATE POLICY "Users can view own incentives"
  ON public.retention_incentives
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert incentives"
  ON public.retention_incentives
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all incentives"
  ON public.retention_incentives
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- RLS Policies for daily_retention_caps
CREATE POLICY "Admins can view caps"
  ON public.daily_retention_caps
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "System can manage caps"
  ON public.daily_retention_caps
  FOR ALL
  USING (true);

-- Indexes for performance
CREATE INDEX idx_boost_periods_active ON public.affiliate_boost_periods(is_active, start_time, end_time);
CREATE INDEX idx_payment_waitlist_notified ON public.payment_waitlist(notified, payment_method);
CREATE INDEX idx_retention_incentives_user ON public.retention_incentives(user_id, credited_at);
CREATE INDEX idx_retention_caps_date ON public.daily_retention_caps(cap_date);