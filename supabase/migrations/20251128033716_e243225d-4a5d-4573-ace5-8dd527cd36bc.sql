-- Fantasy Players with Salaries and Stats
CREATE TABLE IF NOT EXISTS fantasy_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_player_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  team TEXT NOT NULL,
  position TEXT NOT NULL, -- QB, RB, WR, TE, K, DEF for Football, etc.
  salary INTEGER NOT NULL DEFAULT 5000, -- DFS salary (dynamic pricing)
  projected_points NUMERIC DEFAULT 0,
  average_points NUMERIC DEFAULT 0,
  injury_status TEXT DEFAULT 'healthy', -- healthy, questionable, doubtful, out
  sport TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fantasy_players_sport ON fantasy_players(sport);
CREATE INDEX idx_fantasy_players_position ON fantasy_players(position);
CREATE INDEX idx_fantasy_players_salary ON fantasy_players(salary);

-- Fantasy Lineups (User's Drafted Teams)
CREATE TABLE IF NOT EXISTS fantasy_lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES fantasy_leagues(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES fantasy_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  lineup_name TEXT NOT NULL,
  total_salary INTEGER NOT NULL DEFAULT 0,
  salary_cap INTEGER NOT NULL DEFAULT 60000, -- $60K default
  current_points NUMERIC DEFAULT 0,
  projected_points NUMERIC DEFAULT 0,
  roster JSONB NOT NULL DEFAULT '[]', -- Array of {player_id, position, locked}
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fantasy_lineups_league ON fantasy_lineups(league_id);
CREATE INDEX idx_fantasy_lineups_user ON fantasy_lineups(user_id);
CREATE INDEX idx_fantasy_lineups_team ON fantasy_lineups(team_id);

-- Fantasy Contest Types
CREATE TABLE IF NOT EXISTS fantasy_contest_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE, -- h2h, fifty_fifty, gpp, multiplier, survivor
  description TEXT,
  entry_multiplier NUMERIC DEFAULT 1.0,
  payout_structure JSONB NOT NULL, -- {top_1: 0.50, top_2: 0.30, ...}
  min_entries INTEGER DEFAULT 2,
  max_entries INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default contest types
INSERT INTO fantasy_contest_types (name, code, description, payout_structure, min_entries, max_entries) VALUES
('Head-to-Head', 'h2h', 'Winner takes all against one opponent', '{"top_1": 1.80}', 2, 2),
('50/50', 'fifty_fifty', 'Top 50% of entries double their money', '{"top_50_percent": 1.80}', 10, 1000),
('GPP', 'gpp', 'Top-heavy payout tournament', '{"top_1": 0.25, "top_5": 0.15, "top_10": 0.10, "top_20": 0.50}', 100, 100000),
('Multiplier', 'multiplier', '3x, 5x, 10x contests', '{"top_1": 1.00}', 2, 100),
('Survivor', 'survivor', 'Pick one team per week, eliminate if wrong', '{"survivor": 1.00}', 10, 10000)
ON CONFLICT (code) DO NOTHING;

-- Fantasy Scoring Rules
CREATE TABLE IF NOT EXISTS fantasy_scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport TEXT NOT NULL,
  position TEXT NOT NULL,
  stat_type TEXT NOT NULL, -- passing_yards, rushing_td, receptions, etc.
  points_per NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Football scoring rules
INSERT INTO fantasy_scoring_rules (sport, position, stat_type, points_per) VALUES
('Football', 'QB', 'passing_yards', 0.04),
('Football', 'QB', 'passing_td', 4.0),
('Football', 'QB', 'interception', -1.0),
('Football', 'RB', 'rushing_yards', 0.1),
('Football', 'RB', 'rushing_td', 6.0),
('Football', 'RB', 'reception', 0.5),
('Football', 'WR', 'receiving_yards', 0.1),
('Football', 'WR', 'receiving_td', 6.0),
('Football', 'WR', 'reception', 1.0),
('Football', 'TE', 'receiving_yards', 0.1),
('Football', 'TE', 'receiving_td', 6.0),
('Football', 'TE', 'reception', 1.0)
ON CONFLICT DO NOTHING;

-- Fantasy Player Ownership (% rostered)
CREATE TABLE IF NOT EXISTS fantasy_player_ownership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES fantasy_leagues(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES fantasy_players(id) ON DELETE CASCADE,
  ownership_percentage NUMERIC DEFAULT 0, -- 0-100
  total_lineups INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(league_id, player_id)
);

CREATE INDEX idx_ownership_league ON fantasy_player_ownership(league_id);
CREATE INDEX idx_ownership_player ON fantasy_player_ownership(player_id);

-- Fantasy Live Scores
CREATE TABLE IF NOT EXISTS fantasy_live_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lineup_id UUID NOT NULL REFERENCES fantasy_lineups(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES fantasy_players(id),
  live_points NUMERIC DEFAULT 0,
  stats JSONB DEFAULT '{}',
  last_updated TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_live_scores_lineup ON fantasy_live_scores(lineup_id);

-- RLS Policies
ALTER TABLE fantasy_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_contest_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_player_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_live_scores ENABLE ROW LEVEL SECURITY;

-- Anyone can view players and rules
CREATE POLICY "Anyone can view fantasy players" ON fantasy_players FOR SELECT USING (true);
CREATE POLICY "Anyone can view contest types" ON fantasy_contest_types FOR SELECT USING (true);
CREATE POLICY "Anyone can view scoring rules" ON fantasy_scoring_rules FOR SELECT USING (true);
CREATE POLICY "Anyone can view ownership data" ON fantasy_player_ownership FOR SELECT USING (true);

-- Users can manage their own lineups
CREATE POLICY "Users can view their own lineups" ON fantasy_lineups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own lineups" ON fantasy_lineups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lineups" ON fantasy_lineups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own lineups" ON fantasy_lineups FOR DELETE USING (auth.uid() = user_id);

-- Users can view their lineup scores
CREATE POLICY "Users can view their lineup scores" ON fantasy_live_scores FOR SELECT 
USING (EXISTS (SELECT 1 FROM fantasy_lineups WHERE fantasy_lineups.id = fantasy_live_scores.lineup_id AND fantasy_lineups.user_id = auth.uid()));

-- System can update everything
CREATE POLICY "System can manage players" ON fantasy_players FOR ALL USING (true);
CREATE POLICY "System can manage ownership" ON fantasy_player_ownership FOR ALL USING (true);
CREATE POLICY "System can manage live scores" ON fantasy_live_scores FOR ALL USING (true);