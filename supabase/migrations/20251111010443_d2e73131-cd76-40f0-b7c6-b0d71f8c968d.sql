-- Create leaderboard entries table
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  total_points integer DEFAULT 0,
  total_bets integer DEFAULT 0,
  total_wins integer DEFAULT 0,
  win_streak integer DEFAULT 0,
  bonus_points integer DEFAULT 0,
  rank integer DEFAULT 0,
  reward_tier text DEFAULT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_type text NOT NULL,
  achievement_name text NOT NULL,
  achievement_description text,
  points_earned integer DEFAULT 0,
  unlocked_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create weekly challenges table
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL,
  challenge_type text NOT NULL,
  challenge_name text NOT NULL,
  challenge_description text,
  target_value integer NOT NULL,
  reward_points integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create user challenge progress table
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL,
  current_progress integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leaderboard_entries
CREATE POLICY "Leaderboard entries are viewable by everyone"
  ON public.leaderboard_entries FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own leaderboard entries"
  ON public.leaderboard_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard entries"
  ON public.leaderboard_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for weekly_challenges
CREATE POLICY "Weekly challenges are viewable by everyone"
  ON public.weekly_challenges FOR SELECT
  USING (true);

-- RLS Policies for user_challenge_progress
CREATE POLICY "Users can view own challenge progress"
  ON public.user_challenge_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge progress"
  ON public.user_challenge_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress"
  ON public.user_challenge_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_week_rank ON public.leaderboard_entries(week_start, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON public.leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.weekly_challenges(is_active, week_start);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user ON public.user_challenge_progress(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_leaderboard_entries_updated_at
  BEFORE UPDATE ON public.leaderboard_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_weekly_challenges_updated_at
  BEFORE UPDATE ON public.weekly_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_challenge_progress_updated_at
  BEFORE UPDATE ON public.user_challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();