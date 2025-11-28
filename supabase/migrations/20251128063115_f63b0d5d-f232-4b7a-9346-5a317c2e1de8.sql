-- Customer Support Operations Migration

-- KYC Submissions with SLA tracking
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  tier TEXT NOT NULL CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD')),
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  selfie_url TEXT,
  nin TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  sla_deadline TIMESTAMPTZ NOT NULL,
  escalated_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bet Disputes
CREATE TABLE IF NOT EXISTS public.bet_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  bet_slip_id UUID NOT NULL REFERENCES public.bet_slips(id),
  dispute_reason TEXT NOT NULL,
  dispute_details TEXT,
  zendesk_ticket_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved_user', 'resolved_operator', 'rejected')),
  winnings_frozen BOOLEAN DEFAULT true,
  frozen_amount NUMERIC(10,2),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Live Chat Sessions with Co-browsing
CREATE TABLE IF NOT EXISTS public.live_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  agent_id UUID,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'resolved', 'abandoned')),
  cobrowse_enabled BOOLEAN DEFAULT false,
  cobrowse_session_id TEXT,
  screen_share_url TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  resolution_summary TEXT,
  user_satisfaction_rating INTEGER CHECK (user_satisfaction_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RTP (Return to Player) Calculations
CREATE TABLE IF NOT EXISTS public.rtp_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  game_type TEXT NOT NULL,
  game_name TEXT NOT NULL,
  total_wagered NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_won NUMERIC(12,2) NOT NULL DEFAULT 0,
  rtp_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  bet_count INTEGER NOT NULL DEFAULT 0,
  calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, game_type, game_name, calculation_date)
);

-- Enable RLS
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bet_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rtp_calculations ENABLE ROW LEVEL SECURITY;

-- KYC Submissions RLS Policies
CREATE POLICY "Users can view own KYC submissions"
  ON public.kyc_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create KYC submissions"
  ON public.kyc_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all KYC submissions"
  ON public.kyc_submissions FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins can update KYC submissions"
  ON public.kyc_submissions FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Bet Disputes RLS Policies
CREATE POLICY "Users can view own disputes"
  ON public.bet_disputes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create disputes"
  ON public.bet_disputes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all disputes"
  ON public.bet_disputes FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins can update disputes"
  ON public.bet_disputes FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Live Chat Sessions RLS Policies
CREATE POLICY "Users can view own chat sessions"
  ON public.live_chat_sessions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = agent_id);

CREATE POLICY "Users can create chat sessions"
  ON public.live_chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Agents can update chat sessions"
  ON public.live_chat_sessions FOR UPDATE
  USING (auth.uid() = agent_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- RTP Calculations RLS Policies
CREATE POLICY "Users can view own RTP"
  ON public.rtp_calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage RTP calculations"
  ON public.rtp_calculations FOR ALL
  USING (true);

-- Performance Indexes
CREATE INDEX idx_kyc_submissions_user_id ON public.kyc_submissions(user_id);
CREATE INDEX idx_kyc_submissions_status ON public.kyc_submissions(status);
CREATE INDEX idx_kyc_submissions_sla_deadline ON public.kyc_submissions(sla_deadline) WHERE status = 'pending';
CREATE INDEX idx_kyc_submissions_tier ON public.kyc_submissions(tier);

CREATE INDEX idx_bet_disputes_user_id ON public.bet_disputes(user_id);
CREATE INDEX idx_bet_disputes_bet_slip_id ON public.bet_disputes(bet_slip_id);
CREATE INDEX idx_bet_disputes_status ON public.bet_disputes(status);

CREATE INDEX idx_live_chat_sessions_user_id ON public.live_chat_sessions(user_id);
CREATE INDEX idx_live_chat_sessions_agent_id ON public.live_chat_sessions(agent_id);
CREATE INDEX idx_live_chat_sessions_status ON public.live_chat_sessions(status);

CREATE INDEX idx_rtp_calculations_user_id ON public.rtp_calculations(user_id);
CREATE INDEX idx_rtp_calculations_game_type ON public.rtp_calculations(game_type);
CREATE INDEX idx_rtp_calculations_calculation_date ON public.rtp_calculations(calculation_date);