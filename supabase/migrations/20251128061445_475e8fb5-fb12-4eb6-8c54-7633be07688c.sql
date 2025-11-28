-- Market exposure and liability tracking
CREATE TABLE IF NOT EXISTS market_exposure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id TEXT NOT NULL,
  market_type TEXT NOT NULL,
  selection_value TEXT NOT NULL,
  total_liability NUMERIC NOT NULL DEFAULT 0,
  total_stakes NUMERIC NOT NULL DEFAULT 0,
  bet_count INTEGER NOT NULL DEFAULT 0,
  max_liability_threshold NUMERIC NOT NULL DEFAULT 50000000, -- ₦50M default
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  suspended_at TIMESTAMPTZ,
  suspended_by UUID,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trader odds overrides
CREATE TABLE IF NOT EXISTS odds_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id TEXT NOT NULL,
  market_type TEXT NOT NULL,
  selection_value TEXT NOT NULL,
  original_odds NUMERIC NOT NULL,
  override_odds NUMERIC NOT NULL,
  trader_id UUID NOT NULL,
  reason TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bet delays for high-risk leagues
CREATE TABLE IF NOT EXISTS bet_delays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_slip_id UUID NOT NULL,
  user_id UUID NOT NULL,
  match_id TEXT NOT NULL,
  league TEXT NOT NULL,
  total_stake NUMERIC NOT NULL,
  potential_win NUMERIC NOT NULL,
  delay_seconds INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  trader_id UUID,
  decision_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Early payout offers (Acca Edge)
CREATE TABLE IF NOT EXISTS early_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_slip_id UUID NOT NULL,
  user_id UUID NOT NULL,
  original_potential_win NUMERIC NOT NULL,
  early_payout_amount NUMERIC NOT NULL,
  settled_legs INTEGER NOT NULL,
  remaining_legs INTEGER NOT NULL,
  monte_carlo_probability NUMERIC NOT NULL,
  offer_expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'offered' CHECK (status IN ('offered', 'accepted', 'rejected', 'expired')),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Parimutuel pools for racing
CREATE TABLE IF NOT EXISTS parimutuel_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id TEXT NOT NULL,
  race_type TEXT NOT NULL,
  pool_type TEXT NOT NULL CHECK (pool_type IN ('win', 'place', 'exacta', 'trifecta', 'superfecta')),
  total_pool NUMERIC NOT NULL DEFAULT 0,
  platform_commission NUMERIC NOT NULL DEFAULT 15, -- 15% takeout
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'settled')),
  race_start_time TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  winning_selections JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pool bets
CREATE TABLE IF NOT EXISTS parimutuel_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES parimutuel_pools(id),
  user_id UUID NOT NULL,
  stake_amount NUMERIC NOT NULL,
  selections JSONB NOT NULL,
  units NUMERIC NOT NULL,
  potential_dividend NUMERIC,
  actual_payout NUMERIC,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- High-risk leagues configuration
CREATE TABLE IF NOT EXISTS high_risk_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_name TEXT NOT NULL UNIQUE,
  sport TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  bet_delay_seconds INTEGER NOT NULL DEFAULT 5,
  max_stake_limit NUMERIC,
  requires_trader_approval BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE market_exposure ENABLE ROW LEVEL SECURITY;
ALTER TABLE odds_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bet_delays ENABLE ROW LEVEL SECURITY;
ALTER TABLE early_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE parimutuel_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE parimutuel_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE high_risk_leagues ENABLE ROW LEVEL SECURITY;

-- Traders and admins can view all exposure
CREATE POLICY "Traders can view market exposure" ON market_exposure
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "System can manage exposure" ON market_exposure
  FOR ALL USING (true);

-- Traders can create and view overrides
CREATE POLICY "Traders can view odds overrides" ON odds_overrides
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Traders can create odds overrides" ON odds_overrides
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Traders can update odds overrides" ON odds_overrides
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Traders can manage bet delays
CREATE POLICY "Traders can view bet delays" ON bet_delays
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "System can insert bet delays" ON bet_delays
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Traders can update bet delays" ON bet_delays
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Users can view their own early payout offers
CREATE POLICY "Users can view own early payouts" ON early_payouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage early payouts" ON early_payouts
  FOR ALL USING (true);

-- Everyone can view parimutuel pools
CREATE POLICY "Anyone can view parimutuel pools" ON parimutuel_pools
  FOR SELECT USING (true);

CREATE POLICY "System can manage parimutuel pools" ON parimutuel_pools
  FOR ALL USING (true);

-- Users can view and create their own pool bets
CREATE POLICY "Users can view own pool bets" ON parimutuel_bets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create pool bets" ON parimutuel_bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view high risk leagues
CREATE POLICY "Admins can view high risk leagues" ON high_risk_leagues
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Admins can manage high risk leagues" ON high_risk_leagues
  FOR ALL USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_market_exposure_match_id ON market_exposure(match_id);
CREATE INDEX IF NOT EXISTS idx_market_exposure_suspended ON market_exposure(is_suspended);
CREATE INDEX IF NOT EXISTS idx_odds_overrides_match_id ON odds_overrides(match_id);
CREATE INDEX IF NOT EXISTS idx_odds_overrides_active ON odds_overrides(is_active);
CREATE INDEX IF NOT EXISTS idx_bet_delays_status ON bet_delays(status);
CREATE INDEX IF NOT EXISTS idx_bet_delays_expires_at ON bet_delays(expires_at);
CREATE INDEX IF NOT EXISTS idx_early_payouts_bet_slip_id ON early_payouts(bet_slip_id);
CREATE INDEX IF NOT EXISTS idx_early_payouts_status ON early_payouts(status);
CREATE INDEX IF NOT EXISTS idx_parimutuel_pools_race_id ON parimutuel_pools(race_id);
CREATE INDEX IF NOT EXISTS idx_parimutuel_pools_status ON parimutuel_pools(status);
CREATE INDEX IF NOT EXISTS idx_parimutuel_bets_pool_id ON parimutuel_bets(pool_id);
CREATE INDEX IF NOT EXISTS idx_parimutuel_bets_user_id ON parimutuel_bets(user_id);

-- Seed high-risk leagues
INSERT INTO high_risk_leagues (league_name, sport, risk_level, bet_delay_seconds, requires_trader_approval) VALUES
  ('Nigerian Premier League', 'football', 'high', 5, true),
  ('Ghana Premier League', 'football', 'high', 5, true),
  ('Kenyan Premier League', 'football', 'medium', 3, false),
  ('South African PSL', 'football', 'medium', 3, false),
  ('Virtual Football', 'virtual', 'critical', 10, true)
ON CONFLICT (league_name) DO NOTHING;