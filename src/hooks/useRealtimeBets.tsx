import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BetSettlement {
  bet_id: string;
  status: 'won' | 'lost' | 'void';
  payout?: number;
  timestamp: string;
}

export const useRealtimeBets = () => {
  const [settlements, setSettlements] = useState<BetSettlement[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('Setting up realtime bets channel');

    const channel = supabase
      .channel('bets:settlements')
      .on(
        'broadcast',
        { event: 'bet_settled' },
        (payload) => {
          console.log('Received bet settlement:', payload);
          const settlement = payload.payload as BetSettlement;
          setSettlements(prev => [...prev, settlement]);
        }
      )
      .subscribe((status) => {
        console.log('Bets channel status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('Cleaning up bets channel');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    settlements,
    isConnected,
    clearSettlements: () => setSettlements([])
  };
};