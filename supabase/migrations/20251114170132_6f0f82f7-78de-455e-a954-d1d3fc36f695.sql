-- Ensure RLS is enabled and add public read policies for non-sensitive public data tables
-- Matches: public fixture and odds data should be readable by everyone
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'matches' AND policyname = 'Matches are publicly readable'
  ) THEN
    CREATE POLICY "Matches are publicly readable"
    ON public.matches
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Sports leagues catalog used to render tabs and names
ALTER TABLE public.sports_leagues ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sports_leagues' AND policyname = 'Sports leagues are publicly readable'
  ) THEN
    CREATE POLICY "Sports leagues are publicly readable"
    ON public.sports_leagues
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Optionally expose realtime_odds_cache for read-only consumption if used in UI (safe, non-PII)
ALTER TABLE public.realtime_odds_cache ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'realtime_odds_cache' AND policyname = 'Realtime odds cache is publicly readable'
  ) THEN
    CREATE POLICY "Realtime odds cache is publicly readable"
    ON public.realtime_odds_cache
    FOR SELECT
    USING (true);
  END IF;
END $$;