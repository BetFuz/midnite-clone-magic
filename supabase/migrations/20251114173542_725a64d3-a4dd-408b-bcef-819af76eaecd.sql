-- Step 1: Create canonical leagues table
CREATE TABLE IF NOT EXISTS public.leagues (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  sport_title text,
  sport_key text,
  provider_meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Step 2: Populate from sports_leagues JSONB 'leagues' array
WITH extracted AS (
  SELECT 
    (l->>'name') AS name, 
    sl.sport_title,
    sl.sport_key,
    l AS meta
  FROM public.sports_leagues sl,
       jsonb_array_elements(sl.leagues) AS l
)
INSERT INTO public.leagues (name, sport_title, sport_key, provider_meta)
SELECT DISTINCT name, sport_title, sport_key, jsonb_build_object('meta', meta)
FROM extracted
ON CONFLICT (name) DO NOTHING;

-- Step 3: Add league_id to matches (nullable for now)
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS league_id integer;

-- Step 4: Backfill league_id using the canonical leagues table
UPDATE public.matches m
SET league_id = l.id
FROM public.leagues l
WHERE m.league_name = l.name
  AND m.league_id IS DISTINCT FROM l.id;

-- Step 5: Create index for fast queries
CREATE INDEX IF NOT EXISTS idx_matches_league_id_commence ON public.matches (league_id, commence_time);

-- Step 6: Create public_matches view for frontend/API
CREATE OR REPLACE VIEW public.public_matches AS
SELECT
  m.id,
  m.match_id,
  m.league_id,
  m.league_name,
  m.sport_key,
  m.sport_title,
  m.home_team,
  m.away_team,
  m.commence_time AS kickoff_at,
  m.status,
  m.home_odds,
  m.draw_odds,
  m.away_odds,
  m.updated_at
FROM public.matches m
WHERE m.league_id IS NOT NULL;

-- Step 7: Grant SELECT on view
GRANT SELECT ON public.public_matches TO anon, authenticated;

-- Step 8: Enable RLS on leagues table
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Step 9: Create policy for public read access
CREATE POLICY "Leagues are publicly readable"
  ON public.leagues
  FOR SELECT
  USING (true);