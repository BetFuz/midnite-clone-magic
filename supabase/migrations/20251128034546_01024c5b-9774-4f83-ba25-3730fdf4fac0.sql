-- Contest Management Tables
CREATE TABLE IF NOT EXISTS fantasy_contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES fantasy_leagues(id) ON DELETE CASCADE,
  contest_type_id UUID REFERENCES fantasy_contest_types(id),
  name TEXT NOT NULL,
  entry_fee NUMERIC NOT NULL,
  prize_pool NUMERIC NOT NULL,
  max_entries INTEGER NOT NULL,
  current_entries INTEGER DEFAULT 0,
  allows_multi_entry BOOLEAN DEFAULT true,
  max_entries_per_user INTEGER DEFAULT 150,
  allows_late_swap BOOLEAN DEFAULT true,
  late_swap_deadline TIMESTAMPTZ,
  is_beginner_only BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'live', 'completed', 'cancelled')),
  starts_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fantasy_contest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES fantasy_contests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  lineup_id UUID REFERENCES fantasy_lineups(id) ON DELETE CASCADE,
  entry_number INTEGER NOT NULL,
  current_rank INTEGER,
  current_points NUMERIC DEFAULT 0,
  prize_won NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(contest_id, user_id, entry_number)
);

CREATE TABLE IF NOT EXISTS fantasy_player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES fantasy_players(id) ON DELETE CASCADE,
  match_id TEXT,
  game_date DATE NOT NULL,
  minutes_played INTEGER,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  shots INTEGER DEFAULT 0,
  shots_on_target INTEGER DEFAULT 0,
  passes_completed INTEGER DEFAULT 0,
  pass_accuracy NUMERIC,
  tackles INTEGER DEFAULT 0,
  interceptions INTEGER DEFAULT 0,
  clearances INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  clean_sheet BOOLEAN DEFAULT false,
  fantasy_points NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fantasy_player_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES fantasy_players(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  content TEXT,
  impact TEXT CHECK (impact IN ('high', 'medium', 'low')),
  news_type TEXT CHECK (news_type IN ('injury', 'lineup', 'transfer', 'performance', 'other')),
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fantasy_matchups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES fantasy_players(id) ON DELETE CASCADE,
  opponent_team TEXT NOT NULL,
  match_date TIMESTAMPTZ NOT NULL,
  opponent_rank INTEGER,
  opponent_def_rating NUMERIC,
  vegas_line NUMERIC,
  over_under NUMERIC,
  difficulty_rating NUMERIC CHECK (difficulty_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fantasy_lineup_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lineup_id UUID REFERENCES fantasy_lineups(id) ON DELETE CASCADE,
  export_code TEXT NOT NULL UNIQUE,
  export_data JSONB NOT NULL,
  times_imported INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

-- RLS Policies
ALTER TABLE fantasy_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_contest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_player_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_matchups ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_lineup_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contests"
  ON fantasy_contests FOR SELECT
  USING (true);

CREATE POLICY "System can manage contests"
  ON fantasy_contests FOR ALL
  USING (true);

CREATE POLICY "Users can view all contest entries"
  ON fantasy_contest_entries FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own entries"
  ON fantasy_contest_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON fantasy_contest_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON fantasy_contest_entries FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view player stats"
  ON fantasy_player_stats FOR SELECT
  USING (true);

CREATE POLICY "System can manage player stats"
  ON fantasy_player_stats FOR ALL
  USING (true);

CREATE POLICY "Anyone can view player news"
  ON fantasy_player_news FOR SELECT
  USING (true);

CREATE POLICY "System can manage player news"
  ON fantasy_player_news FOR ALL
  USING (true);

CREATE POLICY "Anyone can view matchups"
  ON fantasy_matchups FOR SELECT
  USING (true);

CREATE POLICY "System can manage matchups"
  ON fantasy_matchups FOR ALL
  USING (true);

CREATE POLICY "Users can view their own exports"
  ON fantasy_lineup_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create exports"
  ON fantasy_lineup_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exports"
  ON fantasy_lineup_exports FOR DELETE
  USING (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX idx_contests_status ON fantasy_contests(status);
CREATE INDEX idx_contests_starts_at ON fantasy_contests(starts_at);
CREATE INDEX idx_contest_entries_contest ON fantasy_contest_entries(contest_id);
CREATE INDEX idx_contest_entries_user ON fantasy_contest_entries(user_id);
CREATE INDEX idx_player_stats_player ON fantasy_player_stats(player_id);
CREATE INDEX idx_player_stats_date ON fantasy_player_stats(game_date DESC);
CREATE INDEX idx_player_news_player ON fantasy_player_news(player_id);
CREATE INDEX idx_player_news_published ON fantasy_player_news(published_at DESC);
CREATE INDEX idx_matchups_player ON fantasy_matchups(player_id);
CREATE INDEX idx_matchups_date ON fantasy_matchups(match_date);
