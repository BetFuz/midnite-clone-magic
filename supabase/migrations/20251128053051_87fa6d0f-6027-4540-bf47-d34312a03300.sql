-- Universal Fantasy Sports Schema - Fixed
-- Drop existing policies first to avoid conflicts

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view contest types" ON fantasy_contest_types;
DROP POLICY IF EXISTS "Anyone can view contests" ON fantasy_contests;
DROP POLICY IF EXISTS "Anyone can view gameweeks" ON fantasy_gameweeks;
DROP POLICY IF EXISTS "Anyone can view scoring rules" ON fantasy_scoring_rules;
DROP POLICY IF EXISTS "Anyone can view player stats" ON fantasy_player_stats;
DROP POLICY IF EXISTS "Anyone can view matchups" ON fantasy_matchups;
DROP POLICY IF EXISTS "Anyone can view player news" ON fantasy_player_news;
DROP POLICY IF EXISTS "Anyone can view ownership data" ON fantasy_player_ownership;
DROP POLICY IF EXISTS "Anyone can view prizes" ON fantasy_prizes;
DROP POLICY IF EXISTS "Anyone can view H2H matches" ON fantasy_h2h_matches;
DROP POLICY IF EXISTS "Anyone can view all contest entries" ON fantasy_contest_entries;
DROP POLICY IF EXISTS "Users can view their own chips" ON fantasy_user_chips;
DROP POLICY IF EXISTS "Users can update their own chips" ON fantasy_user_chips;
DROP POLICY IF EXISTS "Users can view their own lineups" ON fantasy_lineups;
DROP POLICY IF EXISTS "Users can create their own lineups" ON fantasy_lineups;
DROP POLICY IF EXISTS "Users can update their own lineups" ON fantasy_lineups;
DROP POLICY IF EXISTS "Users can delete their own lineups" ON fantasy_lineups;
DROP POLICY IF EXISTS "Users can create their own entries" ON fantasy_contest_entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON fantasy_contest_entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON fantasy_contest_entries;
DROP POLICY IF EXISTS "Users can view their own transfers" ON fantasy_transfers;
DROP POLICY IF EXISTS "Users can create their own transfers" ON fantasy_transfers;
DROP POLICY IF EXISTS "Users can view their lineup scores" ON fantasy_live_scores;
DROP POLICY IF EXISTS "Users can view their own exports" ON fantasy_lineup_exports;
DROP POLICY IF EXISTS "Users can create exports" ON fantasy_lineup_exports;
DROP POLICY IF EXISTS "Users can delete their own exports" ON fantasy_lineup_exports;
DROP POLICY IF EXISTS "System can manage contests" ON fantasy_contests;
DROP POLICY IF EXISTS "System can manage gameweeks" ON fantasy_gameweeks;
DROP POLICY IF EXISTS "System can manage players" ON fantasy_players;
DROP POLICY IF EXISTS "System can manage player stats" ON fantasy_player_stats;
DROP POLICY IF EXISTS "System can manage matchups" ON fantasy_matchups;
DROP POLICY IF EXISTS "System can manage player news" ON fantasy_player_news;
DROP POLICY IF EXISTS "System can manage ownership" ON fantasy_player_ownership;
DROP POLICY IF EXISTS "System can manage prizes" ON fantasy_prizes;
DROP POLICY IF EXISTS "System can manage H2H matches" ON fantasy_h2h_matches;
DROP POLICY IF EXISTS "System can manage live scores" ON fantasy_live_scores;

-- Enhanced players table with multi-sport eligibility
ALTER TABLE fantasy_players 
  ADD COLUMN IF NOT EXISTS secondary_position TEXT,
  ADD COLUMN IF NOT EXISTS dual_sport_eligible BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS cross_sport_tags TEXT[];

-- Seed universal scoring rules for all sports
INSERT INTO fantasy_scoring_rules (sport, stat_type, position, points_per) VALUES
-- Soccer
('Football', 'goal', 'FWD', 6),
('Football', 'goal', 'MID', 5),
('Football', 'goal', 'DEF', 4),
('Football', 'goal', 'GK', 3),
('Football', 'assist', 'ALL', 3),
('Football', 'clean_sheet', 'DEF', 4),
('Football', 'clean_sheet', 'GK', 4),
('Football', 'clean_sheet', 'MID', 1),
('Football', 'penalty_save', 'GK', 5),
('Football', 'yellow_card', 'ALL', -1),
('Football', 'red_card', 'ALL', -3),
('Football', 'missed_penalty', 'ALL', -2),
('Football', 'shot_on_target', 'ALL', 1),
('Football', 'tackle_won', 'ALL', 0.5),
('Football', 'interception', 'ALL', 0.5),
('Football', 'save', 'GK', 0.5),
-- Basketball
('Basketball', 'point', 'ALL', 1),
('Basketball', 'three_pt_made', 'ALL', 0.5),
('Basketball', 'rebound', 'ALL', 1.2),
('Basketball', 'assist', 'ALL', 1.5),
('Basketball', 'steal', 'ALL', 3),
('Basketball', 'block', 'ALL', 3),
('Basketball', 'turnover', 'ALL', -1),
('Basketball', 'double_double', 'ALL', 3),
('Basketball', 'triple_double', 'ALL', 6),
-- American Football
('American Football', 'pass_td', 'QB', 4),
('American Football', 'pass_yard', 'QB', 0.04),
('American Football', 'rush_td', 'RB', 6),
('American Football', 'rush_yard', 'RB', 0.1),
('American Football', 'rec_td', 'WR', 6),
('American Football', 'rec_yard', 'WR', 0.1),
('American Football', 'rec', 'WR', 0.5),
('American Football', 'two_pt_conv', 'ALL', 2),
('American Football', 'fumble_lost', 'ALL', -2),
('American Football', 'int_thrown', 'QB', -2),
-- Baseball
('Baseball', 'single', 'BAT', 1),
('Baseball', 'double', 'BAT', 2),
('Baseball', 'triple', 'BAT', 3),
('Baseball', 'hr', 'BAT', 4),
('Baseball', 'rbi', 'BAT', 1),
('Baseball', 'run', 'BAT', 1),
('Baseball', 'walk', 'BAT', 1),
('Baseball', 'steal', 'BAT', 2),
('Baseball', 'strikeout_b', 'BAT', -0.5),
('Baseball', 'pitcher_win', 'PITCH', 4),
('Baseball', 'pitcher_save', 'PITCH', 5),
('Baseball', 'inning_pitched', 'PITCH', 1),
('Baseball', 'strikeout_p', 'PITCH', 1),
('Baseball', 'earned_run', 'PITCH', -1),
-- Hockey
('Ice Hockey', 'goal', 'ALL', 3),
('Ice Hockey', 'assist', 'ALL', 2),
('Ice Hockey', 'shot_on_goal', 'ALL', 0.5),
('Ice Hockey', 'block', 'ALL', 0.5),
('Ice Hockey', 'short_handed_point', 'ALL', 1),
('Ice Hockey', 'hat_trick', 'ALL', 3),
('Ice Hockey', 'goalie_win', 'G', 3),
('Ice Hockey', 'goalie_save', 'G', 0.2),
('Ice Hockey', 'goal_against', 'G', -1),
('Ice Hockey', 'shutout', 'G', 5),
-- Cricket
('Cricket', 'run', 'BAT', 1),
('Cricket', 'four', 'BAT', 1),
('Cricket', 'six', 'BAT', 2),
('Cricket', 'wicket', 'BOWL', 10),
('Cricket', 'catch', 'ALL', 3),
('Cricket', 'stumping', 'WK', 5),
('Cricket', 'maiden_over', 'BOWL', 4),
('Cricket', 'fifty', 'BAT', 5),
('Cricket', 'century', 'BAT', 10),
('Cricket', 'duck', 'BAT', -3),
-- Tennis
('Tennis', 'ace', 'ALL', 1),
('Tennis', 'double_fault', 'ALL', -1),
('Tennis', 'winner', 'ALL', 0.5),
('Tennis', 'unforced_error', 'ALL', -0.5),
('Tennis', 'game_won', 'ALL', 1),
('Tennis', 'set_won', 'ALL', 3),
('Tennis', 'match_won', 'ALL', 6),
('Tennis', 'break_point_saved', 'ALL', 1),
('Tennis', 'break_point_converted', 'ALL', 2),
-- Rugby
('Rugby', 'try', 'ALL', 4),
('Rugby', 'conversion', 'ALL', 2),
('Rugby', 'penalty_goal', 'ALL', 3),
('Rugby', 'drop_goal', 'ALL', 3),
('Rugby', 'assist', 'ALL', 2),
('Rugby', 'tackle', 'ALL', 0.5),
('Rugby', 'yellow_card', 'ALL', -2),
('Rugby', 'red_card', 'ALL', -5),
-- Volleyball
('Volleyball', 'kill', 'ALL', 1),
('Volleyball', 'ace', 'ALL', 2),
('Volleyball', 'block', 'ALL', 1.5),
('Volleyball', 'dig', 'ALL', 0.5),
('Volleyball', 'set', 'ALL', 0.5),
('Volleyball', 'service_error', 'ALL', -1)
ON CONFLICT DO NOTHING;

-- Seed contest types
INSERT INTO fantasy_contest_types (code, name, description, payout_structure) VALUES
('season_long', 'Season Long', 'Full season competition with playoffs', '{"1st": 0.40, "2nd": 0.25, "3rd": 0.15, "4-10": 0.20}'::jsonb),
('daily', 'Daily Contest', 'Single gameweek winner-take-all', '{"top_10_percent": 1.5}'::jsonb),
('showdown', 'Multi-Sport Showdown', 'Cross-sport head-to-head', '{"winner": 1.0, "loser": 0.0}'::jsonb)
ON CONFLICT DO NOTHING;

-- Recreate RLS Policies
CREATE POLICY "Anyone can view contest types" ON fantasy_contest_types FOR SELECT USING (true);
CREATE POLICY "Anyone can view contests" ON fantasy_contests FOR SELECT USING (true);
CREATE POLICY "Anyone can view gameweeks" ON fantasy_gameweeks FOR SELECT USING (true);
CREATE POLICY "Anyone can view scoring rules" ON fantasy_scoring_rules FOR SELECT USING (true);
CREATE POLICY "Anyone can view player stats" ON fantasy_player_stats FOR SELECT USING (true);
CREATE POLICY "Anyone can view matchups" ON fantasy_matchups FOR SELECT USING (true);
CREATE POLICY "Anyone can view player news" ON fantasy_player_news FOR SELECT USING (true);
CREATE POLICY "Anyone can view ownership data" ON fantasy_player_ownership FOR SELECT USING (true);
CREATE POLICY "Anyone can view prizes" ON fantasy_prizes FOR SELECT USING (true);
CREATE POLICY "Anyone can view H2H matches" ON fantasy_h2h_matches FOR SELECT USING (true);
CREATE POLICY "Anyone can view all contest entries" ON fantasy_contest_entries FOR SELECT USING (true);
CREATE POLICY "Users can view their own chips" ON fantasy_user_chips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own chips" ON fantasy_user_chips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own lineups" ON fantasy_lineups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own lineups" ON fantasy_lineups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lineups" ON fantasy_lineups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own lineups" ON fantasy_lineups FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own entries" ON fantasy_contest_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own entries" ON fantasy_contest_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own entries" ON fantasy_contest_entries FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own transfers" ON fantasy_transfers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transfers" ON fantasy_transfers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their lineup scores" ON fantasy_live_scores FOR SELECT USING (EXISTS (SELECT 1 FROM fantasy_lineups WHERE fantasy_lineups.id = fantasy_live_scores.lineup_id AND fantasy_lineups.user_id = auth.uid()));
CREATE POLICY "Users can view their own exports" ON fantasy_lineup_exports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create exports" ON fantasy_lineup_exports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own exports" ON fantasy_lineup_exports FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "System can manage contests" ON fantasy_contests FOR ALL USING (true);
CREATE POLICY "System can manage gameweeks" ON fantasy_gameweeks FOR ALL USING (true);
CREATE POLICY "System can manage players" ON fantasy_players FOR ALL USING (true);
CREATE POLICY "System can manage player stats" ON fantasy_player_stats FOR ALL USING (true);
CREATE POLICY "System can manage matchups" ON fantasy_matchups FOR ALL USING (true);
CREATE POLICY "System can manage player news" ON fantasy_player_news FOR ALL USING (true);
CREATE POLICY "System can manage ownership" ON fantasy_player_ownership FOR ALL USING (true);
CREATE POLICY "System can manage prizes" ON fantasy_prizes FOR ALL USING (true);
CREATE POLICY "System can manage H2H matches" ON fantasy_h2h_matches FOR ALL USING (true);
CREATE POLICY "System can manage live scores" ON fantasy_live_scores FOR ALL USING (true);

-- Function to calculate fantasy points based on universal scoring matrix
CREATE OR REPLACE FUNCTION calculate_fantasy_points(
  p_player_id UUID,
  p_position TEXT,
  p_stats JSONB
) RETURNS NUMERIC AS $$
DECLARE
  v_points NUMERIC := 0;
  v_goals INTEGER;
  v_assists INTEGER;
  v_clean_sheet BOOLEAN;
  v_penalty_saves INTEGER;
  v_yellow_cards INTEGER;
  v_red_cards INTEGER;
  v_missed_penalties INTEGER;
  v_saves INTEGER;
BEGIN
  -- Extract stats
  v_goals := COALESCE((p_stats->>'goals')::INTEGER, 0);
  v_assists := COALESCE((p_stats->>'assists')::INTEGER, 0);
  v_clean_sheet := COALESCE((p_stats->>'clean_sheet')::BOOLEAN, false);
  v_penalty_saves := COALESCE((p_stats->>'penalty_saves')::INTEGER, 0);
  v_yellow_cards := COALESCE((p_stats->>'yellow_cards')::INTEGER, 0);
  v_red_cards := COALESCE((p_stats->>'red_cards')::INTEGER, 0);
  v_missed_penalties := COALESCE((p_stats->>'missed_penalties')::INTEGER, 0);
  v_saves := COALESCE((p_stats->>'saves')::INTEGER, 0);
  
  -- Calculate points based on position
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
  
  -- Penalty saves, cards, etc
  v_points := v_points + (v_penalty_saves * 5);
  v_points := v_points - v_yellow_cards;
  v_points := v_points - (v_red_cards * 3);
  v_points := v_points - (v_missed_penalties * 2);
  v_points := v_points + (v_saves / 3);
  
  RETURN v_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER fantasy_contests_updated_at BEFORE UPDATE ON fantasy_contests FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER fantasy_contest_entries_updated_at BEFORE UPDATE ON fantasy_contest_entries FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER fantasy_lineups_updated_at BEFORE UPDATE ON fantasy_lineups FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER fantasy_weekly_lineups_updated_at BEFORE UPDATE ON fantasy_weekly_lineups FOR EACH ROW EXECUTE FUNCTION handle_updated_at();