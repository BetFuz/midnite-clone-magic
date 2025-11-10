-- Create user statistics table
CREATE TABLE IF NOT EXISTS public.user_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_bets INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  total_pending INTEGER DEFAULT 0,
  total_staked NUMERIC(10,2) DEFAULT 0,
  total_returns NUMERIC(10,2) DEFAULT 0,
  profit_loss NUMERIC(10,2) DEFAULT 0,
  win_rate NUMERIC(5,2) DEFAULT 0,
  roi NUMERIC(5,2) DEFAULT 0,
  favorite_sport TEXT,
  biggest_win NUMERIC(10,2) DEFAULT 0,
  biggest_loss NUMERIC(10,2) DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own statistics"
  ON public.user_statistics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own statistics"
  ON public.user_statistics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own statistics"
  ON public.user_statistics
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create sport statistics table
CREATE TABLE IF NOT EXISTS public.sport_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sport TEXT NOT NULL,
  bets_placed INTEGER DEFAULT 0,
  bets_won INTEGER DEFAULT 0,
  total_staked NUMERIC(10,2) DEFAULT 0,
  total_returns NUMERIC(10,2) DEFAULT 0,
  profit_loss NUMERIC(10,2) DEFAULT 0,
  win_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, sport)
);

-- Enable RLS
ALTER TABLE public.sport_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own sport statistics"
  ON public.sport_statistics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sport statistics"
  ON public.sport_statistics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sport statistics"
  ON public.sport_statistics
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create match statistics table (for display purposes)
CREATE TABLE IF NOT EXISTS public.match_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id TEXT NOT NULL UNIQUE,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  sport TEXT NOT NULL,
  league TEXT,
  home_form TEXT, -- e.g., "WWDLW"
  away_form TEXT,
  home_position INTEGER,
  away_position INTEGER,
  home_goals_scored INTEGER DEFAULT 0,
  away_goals_scored INTEGER DEFAULT 0,
  home_goals_conceded INTEGER DEFAULT 0,
  away_goals_conceded INTEGER DEFAULT 0,
  h2h_home_wins INTEGER DEFAULT 0,
  h2h_draws INTEGER DEFAULT 0,
  h2h_away_wins INTEGER DEFAULT 0,
  last_meeting_date TIMESTAMP WITH TIME ZONE,
  last_meeting_result TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Make match statistics publicly readable (no sensitive data)
ALTER TABLE public.match_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Match statistics are viewable by everyone"
  ON public.match_statistics
  FOR SELECT
  USING (true);

-- Create betting trends table
CREATE TABLE IF NOT EXISTS public.betting_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id TEXT NOT NULL,
  selection_type TEXT NOT NULL,
  selection_value TEXT NOT NULL,
  bet_count INTEGER DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(match_id, selection_type, selection_value)
);

-- Make betting trends publicly readable
ALTER TABLE public.betting_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Betting trends are viewable by everyone"
  ON public.betting_trends
  FOR SELECT
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_user_statistics_updated_at
  BEFORE UPDATE ON public.user_statistics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_sport_statistics_updated_at
  BEFORE UPDATE ON public.sport_statistics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_match_statistics_updated_at
  BEFORE UPDATE ON public.match_statistics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_betting_trends_updated_at
  BEFORE UPDATE ON public.betting_trends
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();