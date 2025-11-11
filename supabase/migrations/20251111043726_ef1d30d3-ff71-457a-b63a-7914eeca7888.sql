-- Pool Betting Tables
CREATE TABLE public.pool_bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  sport TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'public', -- 'public' or 'private'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'locked', 'settled'
  max_members INTEGER NOT NULL DEFAULT 100,
  min_entry NUMERIC NOT NULL DEFAULT 5000,
  total_stake NUMERIC NOT NULL DEFAULT 0,
  potential_win NUMERIC NOT NULL DEFAULT 0,
  total_odds NUMERIC NOT NULL DEFAULT 1.0,
  selections_count INTEGER NOT NULL DEFAULT 0,
  closes_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.pool_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id UUID NOT NULL REFERENCES public.pool_bets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stake_amount NUMERIC NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(pool_id, user_id)
);

-- Fantasy Sports Tables
CREATE TABLE public.fantasy_leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  season TEXT NOT NULL,
  entry_fee NUMERIC NOT NULL DEFAULT 10000,
  prize_pool NUMERIC NOT NULL DEFAULT 0,
  max_participants INTEGER,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'active', 'completed'
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.fantasy_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID NOT NULL REFERENCES public.fantasy_leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  team_name TEXT NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(league_id, user_id)
);

-- Live Streaming Metadata
CREATE TABLE public.live_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id TEXT NOT NULL,
  sport TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  league TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming', -- 'live', 'upcoming', 'ended'
  stream_url TEXT,
  quality TEXT NOT NULL DEFAULT 'HD', -- 'SD', 'HD', '4K'
  viewer_count INTEGER NOT NULL DEFAULT 0,
  active_bets_count INTEGER NOT NULL DEFAULT 0,
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Virtual Stadium Experiences
CREATE TABLE public.vr_experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stadium_name TEXT NOT NULL,
  match_id TEXT,
  sport TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'live', 'ended'
  viewer_count INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.vr_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL REFERENCES public.vr_experiences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  duration_minutes INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.pool_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vr_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vr_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Pool Bets
CREATE POLICY "Anyone can view public pools" ON public.pool_bets FOR SELECT USING (type = 'public' OR creator_id = auth.uid());
CREATE POLICY "Users can create pools" ON public.pool_bets FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update pools" ON public.pool_bets FOR UPDATE USING (auth.uid() = creator_id);

-- RLS Policies for Pool Members
CREATE POLICY "Members can view pool members" ON public.pool_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM pool_bets WHERE id = pool_members.pool_id AND (type = 'public' OR creator_id = auth.uid()))
);
CREATE POLICY "Users can join pools" ON public.pool_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own membership" ON public.pool_members FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Fantasy Leagues
CREATE POLICY "Anyone can view leagues" ON public.fantasy_leagues FOR SELECT USING (true);
CREATE POLICY "Admins can create leagues" ON public.fantasy_leagues FOR INSERT WITH CHECK (true);

-- RLS Policies for Fantasy Teams
CREATE POLICY "Anyone can view teams" ON public.fantasy_teams FOR SELECT USING (true);
CREATE POLICY "Users can create own teams" ON public.fantasy_teams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own teams" ON public.fantasy_teams FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Live Streams
CREATE POLICY "Anyone can view streams" ON public.live_streams FOR SELECT USING (true);
CREATE POLICY "System can manage streams" ON public.live_streams FOR ALL USING (true);

-- RLS Policies for VR Experiences
CREATE POLICY "Anyone can view VR experiences" ON public.vr_experiences FOR SELECT USING (true);
CREATE POLICY "Users can view own VR sessions" ON public.vr_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create VR sessions" ON public.vr_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_pool_bets_status ON public.pool_bets(status);
CREATE INDEX idx_pool_bets_creator ON public.pool_bets(creator_id);
CREATE INDEX idx_pool_members_pool ON public.pool_members(pool_id);
CREATE INDEX idx_pool_members_user ON public.pool_members(user_id);
CREATE INDEX idx_fantasy_teams_league ON public.fantasy_teams(league_id);
CREATE INDEX idx_fantasy_teams_user ON public.fantasy_teams(user_id);
CREATE INDEX idx_live_streams_status ON public.live_streams(status);
CREATE INDEX idx_vr_experiences_status ON public.vr_experiences(status);

-- Trigger for updated_at
CREATE TRIGGER update_pool_bets_updated_at BEFORE UPDATE ON public.pool_bets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_fantasy_teams_updated_at BEFORE UPDATE ON public.fantasy_teams FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_live_streams_updated_at BEFORE UPDATE ON public.live_streams FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();