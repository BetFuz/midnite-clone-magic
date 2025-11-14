-- Create matches table for league schedules
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id TEXT UNIQUE NOT NULL,
  sport_key TEXT NOT NULL,
  sport_title TEXT NOT NULL,
  league_name TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  commence_time TIMESTAMPTZ NOT NULL,
  home_odds NUMERIC,
  draw_odds NUMERIC,
  away_odds NUMERIC,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view matches"
  ON public.matches
  FOR SELECT
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_matches_commence_time ON public.matches(commence_time);
CREATE INDEX idx_matches_sport_key ON public.matches(sport_key);
CREATE INDEX idx_matches_league ON public.matches(league_name);

-- Create trigger for updated_at
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();