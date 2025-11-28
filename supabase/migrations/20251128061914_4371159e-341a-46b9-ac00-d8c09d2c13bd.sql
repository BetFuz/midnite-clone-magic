-- Sports Data & Integrity System

-- Official data sources configuration
CREATE TABLE IF NOT EXISTS public.official_data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league TEXT NOT NULL,
  sport TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'sportradar', 'betradar', 'betgenius'
  is_official BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Player props feed for bet builder
CREATE TABLE IF NOT EXISTS public.player_props (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  team TEXT NOT NULL,
  prop_type TEXT NOT NULL, -- 'goals', 'assists', 'shots', 'passes', 'tackles', etc.
  line NUMERIC NOT NULL,
  over_odds NUMERIC NOT NULL,
  under_odds NUMERIC NOT NULL,
  market_status TEXT DEFAULT 'active',
  feed_provider TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bet builder selections (same-game parlay)
CREATE TABLE IF NOT EXISTS public.bet_builder_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_slip_id UUID REFERENCES public.bet_slips(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL,
  selection_type TEXT NOT NULL, -- 'match_result', 'player_prop', 'team_prop'
  selection_value TEXT NOT NULL,
  odds NUMERIC NOT NULL,
  correlation_factor NUMERIC DEFAULT 1.0, -- pricing adjustment for correlation
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Streaming sessions for "watch & bet" compliance
CREATE TABLE IF NOT EXISTS public.streaming_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_id TEXT NOT NULL,
  stream_provider TEXT NOT NULL DEFAULT 'sportradar',
  session_token TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  bet_placed BOOLEAN DEFAULT false
);

-- RLS Policies
ALTER TABLE public.official_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_props ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bet_builder_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaming_sessions ENABLE ROW LEVEL SECURITY;

-- Official data sources - admins only
CREATE POLICY "Admins can manage data sources"
  ON public.official_data_sources
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Anyone can view data sources"
  ON public.official_data_sources
  FOR SELECT
  USING (true);

-- Player props - public read
CREATE POLICY "Anyone can view player props"
  ON public.player_props
  FOR SELECT
  USING (true);

CREATE POLICY "System can manage player props"
  ON public.player_props
  FOR ALL
  USING (true);

-- Bet builder selections - user owned
CREATE POLICY "Users can create bet builder selections"
  ON public.bet_builder_selections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bet_slips
      WHERE bet_slips.id = bet_builder_selections.bet_slip_id
      AND bet_slips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own bet builder selections"
  ON public.bet_builder_selections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bet_slips
      WHERE bet_slips.id = bet_builder_selections.bet_slip_id
      AND bet_slips.user_id = auth.uid()
    )
  );

-- Streaming sessions - user owned
CREATE POLICY "Users can create streaming sessions"
  ON public.streaming_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own streaming sessions"
  ON public.streaming_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaming sessions"
  ON public.streaming_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_official_data_sources_league ON public.official_data_sources(league, is_active);
CREATE INDEX IF NOT EXISTS idx_player_props_match ON public.player_props(match_id, market_status);
CREATE INDEX IF NOT EXISTS idx_bet_builder_slip ON public.bet_builder_selections(bet_slip_id);
CREATE INDEX IF NOT EXISTS idx_streaming_sessions_user ON public.streaming_sessions(user_id, match_id);

-- Seed official data sources
INSERT INTO public.official_data_sources (league, sport, provider, is_official, is_active, priority) VALUES
  ('Premier League', 'football', 'sportradar', true, true, 1),
  ('La Liga', 'football', 'sportradar', true, true, 1),
  ('NBA', 'basketball', 'sportradar', true, true, 1),
  ('Champions League', 'football', 'sportradar', true, true, 1),
  ('Serie A', 'football', 'betradar', false, true, 2),
  ('Bundesliga', 'football', 'betradar', false, true, 2),
  ('AFCON', 'football', 'betgenius', false, true, 2)
ON CONFLICT DO NOTHING;