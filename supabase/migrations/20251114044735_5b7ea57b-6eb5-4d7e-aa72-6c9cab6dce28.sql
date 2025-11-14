-- Create sports_leagues table to store league data from The Odds API
CREATE TABLE IF NOT EXISTS public.sports_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_key TEXT NOT NULL,
  sport_title TEXT NOT NULL,
  leagues JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(sport_key)
);

-- Create marketing_posts table to store marketing content
CREATE TABLE IF NOT EXISTS public.marketing_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  posted_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sports_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sports_leagues (public read access)
CREATE POLICY "Anyone can view sports leagues"
  ON public.sports_leagues
  FOR SELECT
  USING (true);

-- RLS Policies for marketing_posts (public read access)
CREATE POLICY "Anyone can view marketing posts"
  ON public.marketing_posts
  FOR SELECT
  USING (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_sports_leagues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for sports_leagues
CREATE TRIGGER update_sports_leagues_timestamp
  BEFORE UPDATE ON public.sports_leagues
  FOR EACH ROW
  EXECUTE FUNCTION update_sports_leagues_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sports_leagues_sport_key ON public.sports_leagues(sport_key);
CREATE INDEX IF NOT EXISTS idx_marketing_posts_created_at ON public.marketing_posts(created_at DESC);