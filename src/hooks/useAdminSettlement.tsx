import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SettlementResult = 'won' | 'lost' | 'void';

export const useAdminSettlement = () => {
  const [loading, setLoading] = useState(false);

  const settleBet = async (betId: string, result: SettlementResult): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-bet-settlement', {
        body: { action: 'settle_bet', betId, result },
      });

      if (error) throw error;
      toast.success(data.message || 'Bet settled successfully');
      return true;
    } catch (error) {
      console.error('Error settling bet:', error);
      toast.error('Failed to settle bet');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const settleMatch = async (matchId: string, result: SettlementResult): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-bet-settlement', {
        body: { action: 'settle_match', matchId, result },
      });

      if (error) throw error;
      toast.success(data.message || 'Match bets settled successfully');
      return true;
    } catch (error) {
      console.error('Error settling match:', error);
      toast.error('Failed to settle match bets');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAutoSettlementStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-bet-settlement', {
        body: { action: 'auto_settle' },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting settlement stats:', error);
      toast.error('Failed to get settlement stats');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    settleBet,
    settleMatch,
    getAutoSettlementStats,
  };
};