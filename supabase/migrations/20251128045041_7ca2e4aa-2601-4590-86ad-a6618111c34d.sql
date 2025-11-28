-- Fantasy Football Nigerian Edition Schema

-- Update fantasy_players table to support Nigerian pricing
ALTER TABLE fantasy_players ADD COLUMN IF NOT EXISTS price_change numeric DEFAULT 0;
ALTER TABLE fantasy_players ADD COLUMN IF NOT EXISTS form_rating numeric DEFAULT 0;
ALTER TABLE fantasy_players ADD COLUMN IF NOT EXISTS minutes_played integer DEFAULT 0;
ALTER TABLE fantasy_players ADD COLUMN IF NOT EXISTS club_id text;

-- Fantasy user chips table
CREATE TABLE IF NOT EXISTS fantasy_user_chips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  league_id uuid NOT NULL REFERENCES fantasy_leagues(id) ON DELETE CASCADE,
  chip_type text NOT NULL CHECK (chip_type IN ('wildcard', 'bench_boost', 'triple_captain', 'free_hit')),
  used_gameweek integer,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, league_id, chip_type, used_gameweek)
);

-- Fantasy gameweeks table
CREATE TABLE IF NOT EXISTS fantasy_gameweeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES fantasy_leagues(id) ON DELETE CASCADE,
  gameweek_number integer NOT NULL,
  deadline timestamptz NOT NULL,
  is_current boolean DEFAULT false,
  is_finished boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(league_id, gameweek_number)
);

-- Fantasy transfers table
CREATE TABLE IF NOT EXISTS fantasy_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lineup_id uuid NOT NULL REFERENCES fantasy_lineups(id) ON DELETE CASCADE,
  gameweek_number integer NOT NULL,
  player_out_id uuid NOT NULL REFERENCES fantasy_players(id),
  player_in_id uuid NOT NULL REFERENCES fantasy_players(id),
  transfer_cost integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Fantasy weekly lineups table (starting XI + bench for each gameweek)
CREATE TABLE IF NOT EXISTS fantasy_weekly_lineups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lineup_id uuid NOT NULL REFERENCES fantasy_lineups(id) ON DELETE CASCADE,
  gameweek_number integer NOT NULL,
  starting_xi jsonb NOT NULL DEFAULT '[]'::jsonb,
  bench jsonb NOT NULL DEFAULT '[]'::jsonb,
  captain_id uuid REFERENCES fantasy_players(id),
  vice_captain_id uuid REFERENCES fantasy_players(id),
  formation text NOT NULL DEFAULT '4-3-3',
  chip_used text,
  points_scored numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(lineup_id, gameweek_number)
);

-- Fantasy head to head matches table
CREATE TABLE IF NOT EXISTS fantasy_h2h_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES fantasy_leagues(id) ON DELETE CASCADE,
  gameweek_number integer NOT NULL,
  home_lineup_id uuid NOT NULL REFERENCES fantasy_lineups(id),
  away_lineup_id uuid NOT NULL REFERENCES fantasy_lineups(id),
  home_points numeric DEFAULT 0,
  away_points numeric DEFAULT 0,
  winner_lineup_id uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(league_id, gameweek_number, home_lineup_id, away_lineup_id)
);

-- Fantasy prizes table
CREATE TABLE IF NOT EXISTS fantasy_prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES fantasy_leagues(id) ON DELETE CASCADE,
  prize_type text NOT NULL CHECK (prize_type IN ('season_champion', 'weekly_top', 'top_20_percent')),
  prize_description text NOT NULL,
  prize_amount numeric NOT NULL,
  awarded_to_user_id uuid REFERENCES auth.users(id),
  gameweek_number integer,
  awarded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE fantasy_user_chips ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_gameweeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_weekly_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_h2h_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_prizes ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own chips
CREATE POLICY "Users can view their own chips"
  ON fantasy_user_chips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own chips"
  ON fantasy_user_chips FOR UPDATE
  USING (auth.uid() = user_id);

-- Anyone can view gameweeks
CREATE POLICY "Anyone can view gameweeks"
  ON fantasy_gameweeks FOR SELECT
  USING (true);

-- System can manage gameweeks
CREATE POLICY "System can manage gameweeks"
  ON fantasy_gameweeks FOR ALL
  USING (true);

-- Users can view their own transfers
CREATE POLICY "Users can view their own transfers"
  ON fantasy_transfers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transfers"
  ON fantasy_transfers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can manage their weekly lineups
CREATE POLICY "Users can view their weekly lineups"
  ON fantasy_weekly_lineups FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM fantasy_lineups
    WHERE fantasy_lineups.id = fantasy_weekly_lineups.lineup_id
    AND fantasy_lineups.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their weekly lineups"
  ON fantasy_weekly_lineups FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM fantasy_lineups
    WHERE fantasy_lineups.id = fantasy_weekly_lineups.lineup_id
    AND fantasy_lineups.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their weekly lineups"
  ON fantasy_weekly_lineups FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM fantasy_lineups
    WHERE fantasy_lineups.id = fantasy_weekly_lineups.lineup_id
    AND fantasy_lineups.user_id = auth.uid()
  ));

-- Anyone can view H2H matches
CREATE POLICY "Anyone can view H2H matches"
  ON fantasy_h2h_matches FOR SELECT
  USING (true);

-- System can manage H2H matches
CREATE POLICY "System can manage H2H matches"
  ON fantasy_h2h_matches FOR ALL
  USING (true);

-- Anyone can view prizes
CREATE POLICY "Anyone can view prizes"
  ON fantasy_prizes FOR SELECT
  USING (true);

-- System can manage prizes
CREATE POLICY "System can manage prizes"
  ON fantasy_prizes FOR ALL
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fantasy_user_chips_user ON fantasy_user_chips(user_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_gameweeks_league ON fantasy_gameweeks(league_id, gameweek_number);
CREATE INDEX IF NOT EXISTS idx_fantasy_transfers_lineup ON fantasy_transfers(lineup_id, gameweek_number);
CREATE INDEX IF NOT EXISTS idx_fantasy_weekly_lineups_lineup ON fantasy_weekly_lineups(lineup_id, gameweek_number);
CREATE INDEX IF NOT EXISTS idx_fantasy_h2h_matches_league ON fantasy_h2h_matches(league_id, gameweek_number);
CREATE INDEX IF NOT EXISTS idx_fantasy_prizes_league ON fantasy_prizes(league_id);

-- Function to calculate fantasy points
CREATE OR REPLACE FUNCTION calculate_fantasy_points(
  p_player_id uuid,
  p_position text,
  p_stats jsonb
) RETURNS numeric AS $$
DECLARE
  v_points numeric := 0;
  v_goals integer;
  v_assists integer;
  v_clean_sheet boolean;
  v_penalty_saves integer;
  v_yellow_cards integer;
  v_red_cards integer;
  v_missed_penalties integer;
  v_saves integer;
BEGIN
  -- Extract stats
  v_goals := COALESCE((p_stats->>'goals')::integer, 0);
  v_assists := COALESCE((p_stats->>'assists')::integer, 0);
  v_clean_sheet := COALESCE((p_stats->>'clean_sheet')::boolean, false);
  v_penalty_saves := COALESCE((p_stats->>'penalty_saves')::integer, 0);
  v_yellow_cards := COALESCE((p_stats->>'yellow_cards')::integer, 0);
  v_red_cards := COALESCE((p_stats->>'red_cards')::integer, 0);
  v_missed_penalties := COALESCE((p_stats->>'missed_penalties')::integer, 0);
  v_saves := COALESCE((p_stats->>'saves')::integer, 0);
  
  -- Goals scoring
  IF p_position = 'FWD' THEN
    v_points := v_points + (v_goals * 6);
  ELSIF p_position = 'MID' THEN
    v_points := v_points + (v_goals * 5);
  ELSIF p_position = 'DEF' THEN
    v_points := v_points + (v_goals * 4);
  ELSIF p_position = 'GK' THEN
    v_points := v_points + (v_goals * 3);
  END IF;
  
  -- Assists
  v_points := v_points + (v_assists * 3);
  
  -- Clean sheet
  IF v_clean_sheet THEN
    IF p_position IN ('DEF', 'GK') THEN
      v_points := v_points + 4;
    ELSIF p_position = 'MID' THEN
      v_points := v_points + 1;
    END IF;
  END IF;
  
  -- Penalty saves
  v_points := v_points + (v_penalty_saves * 5);
  
  -- Cards
  v_points := v_points - v_yellow_cards;
  v_points := v_points - (v_red_cards * 3);
  
  -- Missed penalties
  v_points := v_points - (v_missed_penalties * 2);
  
  -- Saves (every 3 saves = 1 point)
  v_points := v_points + (v_saves / 3);
  
  RETURN v_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE fantasy_user_chips IS 'Tracks fantasy chips (wildcards, boosts) available to users';
COMMENT ON TABLE fantasy_gameweeks IS 'Manages gameweek scheduling and deadlines';
COMMENT ON TABLE fantasy_transfers IS 'Records all player transfers with costs';
COMMENT ON TABLE fantasy_weekly_lineups IS 'Stores starting XI and bench for each gameweek';
COMMENT ON TABLE fantasy_h2h_matches IS 'Head-to-head matchups for H2H leagues';
COMMENT ON TABLE fantasy_prizes IS 'Prize pool distribution and winners';