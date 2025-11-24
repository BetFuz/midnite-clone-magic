import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';

interface BalanceUpdate {
  old_balance: number;
  new_balance: number;
  change: number;
  reason: string;
  timestamp: string;
}

export const useRealtimeBalance = () => {
  const { user, profile, refreshProfile } = useUserProfile();
  const [balanceUpdates, setBalanceUpdates] = useState<BalanceUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      console.log('No user, skipping balance subscription');
      return;
    }

    console.log('Setting up realtime balance subscription for user:', user.id);

    // Subscribe to broadcast channel for balance changes
    const channel = supabase
      .channel(`user:${user.id}`)
      .on(
        'broadcast',
        { event: 'balance_change' },
        (payload) => {
          console.log('Received balance change:', payload);

          const update: BalanceUpdate = {
            old_balance: payload.payload.old_balance || 0,
            new_balance: payload.payload.new_balance || 0,
            change: payload.payload.change || 0,
            reason: payload.payload.reason || 'Unknown',
            timestamp: payload.payload.timestamp || new Date().toISOString(),
          };

          setBalanceUpdates(prev => [...prev.slice(-9), update]);

          // Refresh profile to get latest balance
          refreshProfile();

          console.log('Balance updated:', update);
        }
      )
      .subscribe((status) => {
        console.log('Balance channel status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Also subscribe to profiles table changes
    const profileChannel = supabase
      .channel('profiles-balance-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Profile balance updated via database:', payload);
          
          const oldData = payload.old as any;
          const newData = payload.new as any;

          if (oldData.balance !== newData.balance) {
            const update: BalanceUpdate = {
              old_balance: oldData.balance || 0,
              new_balance: newData.balance || 0,
              change: (newData.balance || 0) - (oldData.balance || 0),
              reason: 'Database update',
              timestamp: new Date().toISOString(),
            };

            setBalanceUpdates(prev => [...prev.slice(-9), update]);
            refreshProfile();
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up balance subscriptions');
      supabase.removeChannel(channel);
      supabase.removeChannel(profileChannel);
    };
  }, [user?.id]);

  return {
    currentBalance: profile?.balance || 0,
    balanceUpdates,
    isConnected,
    clearUpdates: () => setBalanceUpdates([]),
  };
};
