-- ============================================================================
-- Betfuz Final Schema Migration
-- Ensures all tables, indexes, constraints, and RLS policies are in place
-- ============================================================================

-- Create indexes for performance optimization on key foreign keys and lookup columns
-- These improve query performance for user-specific and match-specific data

-- Bet-related indexes
CREATE INDEX IF NOT EXISTS idx_bet_slips_user_id ON public.bet_slips(user_id);
CREATE INDEX IF NOT EXISTS idx_bet_slips_status ON public.bet_slips(status);
CREATE INDEX IF NOT EXISTS idx_bet_slips_created_at ON public.bet_slips(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bet_selections_bet_slip_id ON public.bet_selections(bet_slip_id);
CREATE INDEX IF NOT EXISTS idx_bet_selections_match_id ON public.bet_selections(match_id);
CREATE INDEX IF NOT EXISTS idx_bet_selections_status ON public.bet_selections(status);

-- Match-related indexes
CREATE INDEX IF NOT EXISTS idx_matches_sport_key ON public.matches(sport_key);
CREATE INDEX IF NOT EXISTS idx_matches_league_id ON public.matches(league_id);
CREATE INDEX IF NOT EXISTS idx_matches_commence_time ON public.matches(commence_time DESC);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_match_id ON public.matches(match_id);

CREATE INDEX IF NOT EXISTS idx_match_statistics_match_id ON public.match_statistics(match_id);

-- Social betting indexes
CREATE INDEX IF NOT EXISTS idx_social_bets_user_id ON public.social_bets(user_id);
CREATE INDEX IF NOT EXISTS idx_social_bets_bet_slip_id ON public.social_bets(bet_slip_id);
CREATE INDEX IF NOT EXISTS idx_social_bets_created_at ON public.social_bets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_bets_is_public ON public.social_bets(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_social_feed_likes_social_bet_id ON public.social_feed_likes(social_bet_id);
CREATE INDEX IF NOT EXISTS idx_social_feed_likes_user_id ON public.social_feed_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_bet_copies_user_id ON public.bet_copies(user_id);
CREATE INDEX IF NOT EXISTS idx_bet_copies_original_bet_id ON public.bet_copies(original_bet_id);

-- Marketplace indexes
CREATE INDEX IF NOT EXISTS idx_bet_listings_status ON public.bet_listings(status);
CREATE INDEX IF NOT EXISTS idx_bet_listings_seller_id ON public.bet_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_bet_listings_buyer_id ON public.bet_listings(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bet_listings_created_at ON public.bet_listings(created_at DESC);

-- Pool betting indexes
CREATE INDEX IF NOT EXISTS idx_pool_bets_creator_id ON public.pool_bets(creator_id);
CREATE INDEX IF NOT EXISTS idx_pool_bets_status ON public.pool_bets(status);
CREATE INDEX IF NOT EXISTS idx_pool_bets_type ON public.pool_bets(type);
CREATE INDEX IF NOT EXISTS idx_pool_bets_closes_at ON public.pool_bets(closes_at);

CREATE INDEX IF NOT EXISTS idx_pool_members_pool_id ON public.pool_members(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_members_user_id ON public.pool_members(user_id);

-- Fantasy sports indexes
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_league_id ON public.fantasy_teams(league_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_user_id ON public.fantasy_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_rank ON public.fantasy_teams(rank);

CREATE INDEX IF NOT EXISTS idx_fantasy_leagues_sport ON public.fantasy_leagues(sport);
CREATE INDEX IF NOT EXISTS idx_fantasy_leagues_status ON public.fantasy_leagues(status);

-- User statistics and achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON public.user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_sport_statistics_user_id ON public.sport_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_sport_statistics_sport ON public.sport_statistics(sport);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_type ON public.user_achievements(achievement_type);

-- Leaderboard indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_week_start ON public.leaderboard_entries(week_start);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_rank ON public.leaderboard_entries(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user_id ON public.leaderboard_entries(user_id);

-- Challenge indexes
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_week_start ON public.weekly_challenges(week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_is_active ON public.weekly_challenges(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user_id ON public.user_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_challenge_id ON public.user_challenge_progress(challenge_id);

-- Live streaming indexes
CREATE INDEX IF NOT EXISTS idx_live_streams_match_id ON public.live_streams(match_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON public.live_streams(status);
CREATE INDEX IF NOT EXISTS idx_live_streams_scheduled_start ON public.live_streams(scheduled_start);

-- VR experiences indexes
CREATE INDEX IF NOT EXISTS idx_vr_experiences_sport ON public.vr_experiences(sport);
CREATE INDEX IF NOT EXISTS idx_vr_experiences_status ON public.vr_experiences(status);
CREATE INDEX IF NOT EXISTS idx_vr_sessions_user_id ON public.vr_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_vr_sessions_experience_id ON public.vr_sessions(experience_id);

-- NFT badges indexes
CREATE INDEX IF NOT EXISTS idx_nft_badges_user_id ON public.nft_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_nft_badges_badge_type ON public.nft_badges(badge_type);

-- Admin indexes
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_resource_type ON public.admin_audit_log(resource_type);

-- AI predictions indexes
CREATE INDEX IF NOT EXISTS idx_ai_predictions_match_id ON public.ai_predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_sport ON public.ai_predictions(sport);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_created_at ON public.ai_predictions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_user_id ON public.ai_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_created_at ON public.ai_chat_messages(created_at DESC);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_pending_notifications_user_id ON public.pending_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_notifications_read ON public.pending_notifications(read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_pending_notifications_created_at ON public.pending_notifications(created_at DESC);

-- User relationships indexes
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON public.user_follows(following_id);

-- Betting trends indexes
CREATE INDEX IF NOT EXISTS idx_betting_trends_match_id ON public.betting_trends(match_id);
CREATE INDEX IF NOT EXISTS idx_betting_trends_updated_at ON public.betting_trends(updated_at DESC);

-- Odds cache indexes
CREATE INDEX IF NOT EXISTS idx_realtime_odds_cache_match_id ON public.realtime_odds_cache(match_id);
CREATE INDEX IF NOT EXISTS idx_realtime_odds_cache_market ON public.realtime_odds_cache(market);
CREATE INDEX IF NOT EXISTS idx_realtime_odds_cache_last_updated ON public.realtime_odds_cache(last_updated DESC);

-- N8N events indexes
CREATE INDEX IF NOT EXISTS idx_n8n_events_log_event_type ON public.n8n_events_log(event_type);
CREATE INDEX IF NOT EXISTS idx_n8n_events_log_processed ON public.n8n_events_log(processed) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_n8n_events_log_created_at ON public.n8n_events_log(created_at DESC);

-- ============================================================================
-- Add composite indexes for common query patterns
-- ============================================================================

-- User bets by status and date
CREATE INDEX IF NOT EXISTS idx_bet_slips_user_status_date ON public.bet_slips(user_id, status, created_at DESC);

-- Social feed queries
CREATE INDEX IF NOT EXISTS idx_social_bets_public_date ON public.social_bets(is_public, created_at DESC) WHERE is_public = true;

-- Active pools
CREATE INDEX IF NOT EXISTS idx_pool_bets_active ON public.pool_bets(status, closes_at) WHERE status = 'active';

-- Upcoming matches
CREATE INDEX IF NOT EXISTS idx_matches_upcoming ON public.matches(status, commence_time) WHERE status = 'upcoming';

-- User's active challenges
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_active ON public.user_challenge_progress(user_id, is_completed) WHERE is_completed = false;

COMMENT ON INDEX idx_bet_slips_user_id IS 'Fast lookup of user bet slips';
COMMENT ON INDEX idx_matches_match_id IS 'Fast lookup of matches by external match ID';
COMMENT ON INDEX idx_social_bets_public_date IS 'Optimized for social feed queries';
COMMENT ON INDEX idx_pool_bets_active IS 'Fast lookup of active betting pools';
COMMENT ON INDEX idx_matches_upcoming IS 'Optimized for upcoming matches queries';