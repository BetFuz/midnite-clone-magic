-- Traditional African Games Tables

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL CHECK (game_type IN ('african_draft', 'morabaraba', 'mancala', 'tournament')),
  mode TEXT NOT NULL CHECK (mode IN ('p2p', 'human_vs_ai', 'ai_vs_ai', 'cultural')),
  player1_id UUID REFERENCES profiles(id),
  player2_id UUID,
  stake_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
  game_state JSONB NOT NULL DEFAULT '{}',
  current_player TEXT DEFAULT 'player1',
  winner TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  CONSTRAINT valid_player2 CHECK (
    (mode = 'p2p' AND player2_id IS NOT NULL) OR 
    (mode != 'p2p' AND player2_id IS NULL)
  )
);

-- Game moves history
CREATE TABLE IF NOT EXISTS game_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player TEXT NOT NULL,
  move_data JSONB NOT NULL,
  move_number INT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Game bets table
CREATE TABLE IF NOT EXISTS game_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  bet_type TEXT NOT NULL,
  bet_value TEXT NOT NULL,
  stake_amount NUMERIC NOT NULL,
  odds NUMERIC NOT NULL,
  potential_win NUMERIC NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'cancelled')),
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI opponents configuration
CREATE TABLE IF NOT EXISTS ai_opponents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  game_type TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'master', 'expert', 'grandmaster')),
  strategy_profile JSONB NOT NULL DEFAULT '{}',
  win_rate NUMERIC DEFAULT 0,
  total_games INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_player1 ON game_sessions(player1_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_type_mode ON game_sessions(game_type, mode);
CREATE INDEX IF NOT EXISTS idx_game_moves_session ON game_moves(session_id);
CREATE INDEX IF NOT EXISTS idx_game_bets_session ON game_bets(session_id);
CREATE INDEX IF NOT EXISTS idx_game_bets_user ON game_bets(user_id);

-- Enable Row Level Security
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_opponents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_sessions
CREATE POLICY "Users can view their own game sessions"
  ON game_sessions FOR SELECT
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can create game sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Users can update their own game sessions"
  ON game_sessions FOR UPDATE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- RLS Policies for game_moves
CREATE POLICY "Users can view moves in their games"
  ON game_moves FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_sessions 
      WHERE game_sessions.id = game_moves.session_id 
      AND (game_sessions.player1_id = auth.uid() OR game_sessions.player2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert moves in their games"
  ON game_moves FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_sessions 
      WHERE game_sessions.id = game_moves.session_id 
      AND (game_sessions.player1_id = auth.uid() OR game_sessions.player2_id = auth.uid())
    )
  );

-- RLS Policies for game_bets
CREATE POLICY "Users can view their own bets"
  ON game_bets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bets"
  ON game_bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bets"
  ON game_bets FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_opponents (read-only for users)
CREATE POLICY "Anyone can view AI opponents"
  ON ai_opponents FOR SELECT
  USING (true);

-- Insert default AI opponents for African Draft
INSERT INTO ai_opponents (name, game_type, difficulty, strategy_profile, win_rate, total_games) VALUES
  ('Rookie AI', 'african_draft', 'beginner', '{"aggression": 0.3, "defensive": 0.7, "risk_tolerance": 0.2}', 35, 1000),
  ('Skilled AI', 'african_draft', 'intermediate', '{"aggression": 0.5, "defensive": 0.5, "risk_tolerance": 0.5}', 55, 2000),
  ('Expert AI', 'african_draft', 'advanced', '{"aggression": 0.6, "defensive": 0.4, "risk_tolerance": 0.6}', 70, 3000),
  ('Master AI', 'african_draft', 'master', '{"aggression": 0.7, "defensive": 0.3, "risk_tolerance": 0.7}', 85, 5000);

-- Enable Realtime for game sessions and moves
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE game_moves;

-- Function to update game session state
CREATE OR REPLACE FUNCTION update_game_state(
  p_session_id UUID,
  p_game_state JSONB,
  p_current_player TEXT,
  p_winner TEXT DEFAULT NULL
) RETURNS game_sessions AS $$
DECLARE
  v_session game_sessions;
BEGIN
  UPDATE game_sessions 
  SET 
    game_state = p_game_state,
    current_player = p_current_player,
    winner = p_winner,
    status = CASE WHEN p_winner IS NOT NULL THEN 'completed' ELSE status END,
    completed_at = CASE WHEN p_winner IS NOT NULL THEN now() ELSE completed_at END
  WHERE id = p_session_id
  RETURNING * INTO v_session;
  
  RETURN v_session;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to settle game bets
CREATE OR REPLACE FUNCTION settle_game_bets(
  p_session_id UUID,
  p_winner TEXT
) RETURNS void AS $$
BEGIN
  -- Update bet statuses based on winner
  UPDATE game_bets
  SET 
    status = CASE 
      WHEN bet_value = p_winner THEN 'won'
      ELSE 'lost'
    END,
    settled_at = now()
  WHERE session_id = p_session_id
    AND status = 'active';
    
  -- Update user balances for winning bets
  UPDATE profiles p
  SET balance = p.balance + gb.potential_win
  FROM game_bets gb
  WHERE gb.user_id = p.id
    AND gb.session_id = p_session_id
    AND gb.status = 'won';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;