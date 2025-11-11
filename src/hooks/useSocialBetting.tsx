import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface SocialBet {
  id: string;
  user_id: string;
  bet_slip_id: string;
  caption: string;
  is_public: boolean;
  likes_count: number;
  copies_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
  bet_slips?: {
    total_odds: number;
    total_stake: number;
    potential_win: number;
    status: string;
  };
}

export const useSocialBetting = () => {
  const [socialBets, setSocialBets] = useState<SocialBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSocialBets();
    loadFollowing();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('social-bets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_bets'
        },
        () => {
          loadSocialBets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSocialBets = async () => {
    try {
      const { data: bets, error } = await supabase
        .from('social_bets')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch related data separately
      const enrichedBets = await Promise.all(
        (bets || []).map(async (bet) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', bet.user_id)
            .single();

          const { data: betSlip } = await supabase
            .from('bet_slips')
            .select('total_odds, total_stake, potential_win, status')
            .eq('id', bet.bet_slip_id)
            .single();

          return {
            ...bet,
            profiles: profile || { full_name: '', email: '' },
            bet_slips: betSlip || { total_odds: 0, total_stake: 0, potential_win: 0, status: 'pending' }
          };
        })
      );

      setSocialBets(enrichedBets as SocialBet[]);
    } catch (error: any) {
      console.error('Error loading social bets:', error);
      toast({
        title: "Error",
        description: "Failed to load social feed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFollowing = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (error) throw error;
      setFollowingIds(data?.map(f => f.following_id) || []);
    } catch (error) {
      console.error('Error loading following:', error);
    }
  };

  const followUser = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to follow users",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('user_follows')
        .insert({ follower_id: user.id, following_id: userId });

      if (error) throw error;

      setFollowingIds([...followingIds, userId]);
      toast({
        title: "Success",
        description: "Now following user",
      });
    } catch (error: any) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    }
  };

  const unfollowUser = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;

      setFollowingIds(followingIds.filter(id => id !== userId));
      toast({
        title: "Success",
        description: "Unfollowed user",
      });
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    }
  };

  const likeBet = async (betId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to like bets",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('social_feed_likes')
        .insert({ user_id: user.id, social_bet_id: betId });

      if (error) throw error;

      // Update likes count
      const { data: currentBet } = await supabase
        .from('social_bets')
        .select('likes_count')
        .eq('id', betId)
        .single();

      await supabase
        .from('social_bets')
        .update({ likes_count: (currentBet?.likes_count || 0) + 1 })
        .eq('id', betId);

      loadSocialBets();
      toast({
        title: "Liked!",
        description: "You liked this bet",
      });
    } catch (error: any) {
      console.error('Error liking bet:', error);
      toast({
        title: "Error",
        description: "Failed to like bet",
        variant: "destructive",
      });
    }
  };

  const unlikeBet = async (betId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('social_feed_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('social_bet_id', betId);

      if (error) throw error;

      loadSocialBets();
      toast({
        title: "Unliked",
        description: "Removed like from bet",
      });
    } catch (error: any) {
      console.error('Error unliking bet:', error);
    }
  };

  const copyBet = async (originalBetId: string, betSlipId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to copy bets",
          variant: "destructive",
        });
        return;
      }

      // Get original bet selections
      const { data: selections, error: selectError } = await supabase
        .from('bet_selections')
        .select('*')
        .eq('bet_slip_id', betSlipId);

      if (selectError) throw selectError;

      // Create new bet slip
      const { data: newBetSlip, error: slipError } = await supabase
        .from('bet_slips')
        .insert({
          user_id: user.id,
          total_odds: selections?.reduce((acc, s) => acc * parseFloat(s.odds.toString()), 1) || 0,
          total_stake: 0,
          potential_win: 0,
        })
        .select()
        .single();

      if (slipError) throw slipError;

      // Copy selections
      const newSelections = selections?.map(s => ({
        bet_slip_id: newBetSlip.id,
        match_id: s.match_id,
        sport: s.sport,
        league: s.league,
        home_team: s.home_team,
        away_team: s.away_team,
        selection_type: s.selection_type,
        selection_value: s.selection_value,
        odds: s.odds,
        match_time: s.match_time,
      })) || [];

      const { error: insertError } = await supabase
        .from('bet_selections')
        .insert(newSelections);

      if (insertError) throw insertError;

      // Record copy
      await supabase
        .from('bet_copies')
        .insert({
          user_id: user.id,
          original_bet_id: originalBetId,
          bet_slip_id: newBetSlip.id,
        });

      toast({
        title: "Bet Copied!",
        description: "This bet has been added to your slip",
      });

      loadSocialBets();
    } catch (error: any) {
      console.error('Error copying bet:', error);
      toast({
        title: "Error",
        description: "Failed to copy bet",
        variant: "destructive",
      });
    }
  };

  const shareBet = async (betSlipId: string, caption: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to share bets",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('social_bets')
        .insert({
          user_id: user.id,
          bet_slip_id: betSlipId,
          caption,
          is_public: true,
        });

      if (error) throw error;

      toast({
        title: "Bet Shared!",
        description: "Your bet is now visible to the community",
      });

      loadSocialBets();
    } catch (error: any) {
      console.error('Error sharing bet:', error);
      toast({
        title: "Error",
        description: "Failed to share bet",
        variant: "destructive",
      });
    }
  };

  return {
    socialBets,
    isLoading,
    followingIds,
    followUser,
    unfollowUser,
    likeBet,
    unlikeBet,
    copyBet,
    shareBet,
    refreshFeed: loadSocialBets,
  };
};