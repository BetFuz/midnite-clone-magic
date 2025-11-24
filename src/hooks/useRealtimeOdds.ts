import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OddsUpdate {
  match_id: string;
  home_odds: number | null;
  draw_odds: number | null;
  away_odds: number | null;
  updated_at: string;
}

interface UseRealtimeOddsOptions {
  matchIds?: string[];
  debounceMs?: number;
}

export const useRealtimeOdds = (options: UseRealtimeOddsOptions = {}) => {
  const { matchIds, debounceMs = 500 } = options;
  const [oddsUpdates, setOddsUpdates] = useState<OddsUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('Setting up realtime odds subscription');

    const channel = supabase
      .channel('matches-odds-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        (payload) => {
          console.log('Received matches change:', payload);

          // Clear existing debounce timer
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }

          // Set new debounce timer
          const timer = setTimeout(() => {
            const newData = payload.new as any;
            
            // Filter by matchIds if provided
            if (matchIds && matchIds.length > 0 && !matchIds.includes(newData.match_id)) {
              return;
            }

            const update: OddsUpdate = {
              match_id: newData.match_id,
              home_odds: newData.home_odds,
              draw_odds: newData.draw_odds,
              away_odds: newData.away_odds,
              updated_at: new Date().toISOString(),
            };

            setOddsUpdates(prev => {
              // Keep only last 50 updates
              const filtered = prev.filter(u => u.match_id !== update.match_id);
              return [...filtered, update].slice(-50);
            });

            console.log('Odds updated for match:', newData.match_id);
          }, debounceMs);

          setDebounceTimer(timer);
        }
      )
      .subscribe((status) => {
        console.log('Odds channel status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('Cleaning up odds subscription');
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      supabase.removeChannel(channel);
    };
  }, [matchIds?.join(','), debounceMs]);

  return {
    oddsUpdates,
    isConnected,
    clearUpdates: () => setOddsUpdates([]),
  };
};

