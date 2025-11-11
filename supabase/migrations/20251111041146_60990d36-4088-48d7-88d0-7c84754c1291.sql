-- Social Betting Tables
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS public.social_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bet_slip_id UUID NOT NULL,
  caption TEXT,
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  copies_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bet_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  original_bet_id UUID NOT NULL REFERENCES public.social_bets(id),
  bet_slip_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_feed_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  social_bet_id UUID NOT NULL REFERENCES public.social_bets(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, social_bet_id)
);

-- Bet Trading Marketplace
CREATE TABLE IF NOT EXISTS public.bet_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  bet_slip_id UUID NOT NULL,
  asking_price NUMERIC(10,2) NOT NULL,
  original_stake NUMERIC(10,2) NOT NULL,
  potential_win NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  buyer_id UUID,
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Chat History
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Predictions
CREATE TABLE IF NOT EXISTS public.ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  sport TEXT NOT NULL,
  prediction_type TEXT NOT NULL,
  predicted_outcome TEXT NOT NULL,
  confidence_score NUMERIC(5,2),
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Web3 NFT Badges
CREATE TABLE IF NOT EXISTS public.nft_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_name TEXT NOT NULL,
  badge_type TEXT NOT NULL,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  token_id TEXT,
  metadata JSONB,
  minted_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bet_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_feed_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bet_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_follows
CREATE POLICY "Users can follow others"
  ON public.user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.user_follows FOR DELETE
  USING (auth.uid() = follower_id);

CREATE POLICY "Anyone can view follows"
  ON public.user_follows FOR SELECT
  USING (true);

-- RLS Policies for social_bets
CREATE POLICY "Users can create social bets"
  ON public.social_bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view public bets"
  ON public.social_bets FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can update own bets"
  ON public.social_bets FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for bet_copies
CREATE POLICY "Users can copy bets"
  ON public.bet_copies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own copies"
  ON public.bet_copies FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for social_feed_likes
CREATE POLICY "Users can like bets"
  ON public.social_feed_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike bets"
  ON public.social_feed_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes"
  ON public.social_feed_likes FOR SELECT
  USING (true);

-- RLS Policies for bet_listings
CREATE POLICY "Users can list bets"
  ON public.bet_listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Anyone can view active listings"
  ON public.bet_listings FOR SELECT
  USING (status = 'active' OR auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE POLICY "Sellers can update listings"
  ON public.bet_listings FOR UPDATE
  USING (auth.uid() = seller_id);

-- RLS Policies for ai_chat_messages
CREATE POLICY "Users can create messages"
  ON public.ai_chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own messages"
  ON public.ai_chat_messages FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for ai_predictions
CREATE POLICY "Anyone can view predictions"
  ON public.ai_predictions FOR SELECT
  USING (true);

-- RLS Policies for nft_badges
CREATE POLICY "Users can mint badges"
  ON public.nft_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own badges"
  ON public.nft_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX idx_social_bets_user ON public.social_bets(user_id);
CREATE INDEX idx_social_bets_created ON public.social_bets(created_at DESC);
CREATE INDEX idx_bet_listings_status ON public.bet_listings(status);
CREATE INDEX idx_ai_chat_user ON public.ai_chat_messages(user_id, created_at);
CREATE INDEX idx_ai_predictions_match ON public.ai_predictions(match_id);