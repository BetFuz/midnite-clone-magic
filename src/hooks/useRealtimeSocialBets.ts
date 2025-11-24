import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SocialBet {
  id: string;
  user_id: string;
  bet_slip_id: string;
  caption: string | null;
  likes_count: number;
  copies_count: number;
  is_public: boolean;
  created_at: string;
}

interface UseRealtimeSocialBetsOptions {
  initialLimit?: number;
  autoLoadNew?: boolean;
}

export const useRealtimeSocialBets = (options: UseRealtimeSocialBetsOptions = {}) => {
  const { initialLimit = 20, autoLoadNew = true } = options;
  const { toast } = useToast();
  const [socialBets, setSocialBets] = useState<SocialBet[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [newBetsCount, setNewBetsCount] = useState(0);

  // Load initial social bets
  useEffect(() => {
    const loadInitialBets = async () => {
      const { data, error } = await supabase
        .from('social_bets')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(initialLimit);

      if (error) {
        console.error('Error loading social bets:', error);
        return;
      }

      if (data) {
        setSocialBets(data);
      }
    };

    loadInitialBets();
  }, [initialLimit]);

  // Subscribe to realtime social bets
  useEffect(() => {
    console.log('Setting up realtime social bets subscription');

    const channel = supabase
      .channel('social-bets-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_bets',
        },
        (payload) => {
          console.log('New social bet:', payload);

          const newBet = payload.new as SocialBet;

          // Only show public bets
          if (!newBet.is_public) {
            return;
          }

          if (autoLoadNew) {
            // Prepend to feed
            setSocialBets(prev => [newBet, ...prev]);
            
            toast({
              title: 'New Bet Shared',
              description: newBet.caption || 'A new bet has been shared to the feed',
              duration: 3000,
            });
          } else {
            // Just increment counter
            setNewBetsCount(prev => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'social_bets',
        },
        (payload) => {
          console.log('Social bet updated:', payload);

          const updatedBet = payload.new as SocialBet;

          setSocialBets(prev =>
            prev.map(bet => bet.id === updatedBet.id ? updatedBet : bet)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'social_bets',
        },
        (payload) => {
          console.log('Social bet deleted:', payload);

          const deletedBet = payload.old as SocialBet;

          setSocialBets(prev =>
            prev.filter(bet => bet.id !== deletedBet.id)
          );
        }
      )
      .subscribe((status) => {
        console.log('Social bets channel status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Subscribe to likes updates
    const likesChannel = supabase
      .channel('social-bets-likes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_feed_likes',
        },
        async (payload) => {
          console.log('Likes changed:', payload);

          const likeData = (payload.new || payload.old) as any;
          const socialBetId = likeData?.social_bet_id;
          if (!socialBetId) return;

          // Fetch updated like count
          const { data, error } = await supabase
            .from('social_bets')
            .select('likes_count')
            .eq('id', socialBetId)
            .single();

          if (error || !data) {
            console.error('Error fetching updated like count:', error);
            return;
          }

          setSocialBets(prev =>
            prev.map(bet =>
              bet.id === socialBetId
                ? { ...bet, likes_count: data.likes_count }
                : bet
            )
          );
        }
      )
      .subscribe();

    // Subscribe to copies updates
    const copiesChannel = supabase
      .channel('social-bets-copies')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bet_copies',
        },
        async (payload) => {
          console.log('Bet copied:', payload);

          const copyData = payload.new as any;
          const originalBetId = copyData?.original_bet_id;
          if (!originalBetId) return;

          // Fetch updated copy count
          const { data, error } = await supabase
            .from('social_bets')
            .select('copies_count')
            .eq('id', originalBetId)
            .single();

          if (error || !data) {
            console.error('Error fetching updated copy count:', error);
            return;
          }

          setSocialBets(prev =>
            prev.map(bet =>
              bet.id === originalBetId
                ? { ...bet, copies_count: data.copies_count }
                : bet
            )
          );
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up social bets subscriptions');
      supabase.removeChannel(channel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(copiesChannel);
    };
  }, [autoLoadNew, toast]);

  const loadNewBets = () => {
    setNewBetsCount(0);
    // Trigger reload of initial bets
    window.location.reload();
  };

  return {
    socialBets,
    isConnected,
    newBetsCount,
    loadNewBets,
    refreshBets: () => setSocialBets([]),
  };
};
