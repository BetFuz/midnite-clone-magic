-- Add confederation and region columns to sports_leagues table
ALTER TABLE sports_leagues
ADD COLUMN IF NOT EXISTS confederation TEXT,
ADD COLUMN IF NOT EXISTS region TEXT;

-- Add index for confederation filtering
CREATE INDEX IF NOT EXISTS idx_sports_leagues_confederation ON sports_leagues(confederation);

-- Add comment for documentation
COMMENT ON COLUMN sports_leagues.confederation IS 'Football confederation: AFC, CAF, CONCACAF, CONMEBOL, OFC, or UEFA';
COMMENT ON COLUMN sports_leagues.region IS 'Geographic region of the league';