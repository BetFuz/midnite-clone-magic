-- Fix security definer view by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_matches;

CREATE OR REPLACE VIEW public.public_matches 
WITH (security_invoker = true)
AS
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

-- Re-grant SELECT on view
GRANT SELECT ON public.public_matches TO anon, authenticated;