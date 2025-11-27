import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlatformOverview {
  totalUsers: number;
  activeUsers24h: number;
  totalBets: number;
  pendingBets: number;
  totalStaked: number;
  totalMatches: number;
  liveMatches: number;
  totalViewers: number;
  platformStatus: string;
}

export const useAdminPlatformControl = () => {
  const [loading, setLoading] = useState(false);

  const getPlatformOverview = async (): Promise<PlatformOverview | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-platform-control', {
        body: { action: 'get_overview' },
      });

      if (error) throw error;
      return data.overview;
    } catch (error) {
      console.error('Error getting platform overview:', error);
      toast.error('Failed to load platform overview');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const manageBets = async (betIds: string[], action: 'settle' | 'void', outcome?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-platform-control', {
        body: { 
          action: 'manage_bets',
          data: { betIds, action, outcome }
        },
      });

      if (error) throw error;
      toast.success(data.message);
      return true;
    } catch (error) {
      console.error('Error managing bets:', error);
      toast.error('Failed to manage bets');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const manageUsers = async (userIds: string[], action: 'suspend' | 'adjust_balance', amount?: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-platform-control', {
        body: { 
          action: 'manage_users',
          data: { userIds, action, amount }
        },
      });

      if (error) throw error;
      toast.success(data.message);
      return true;
    } catch (error) {
      console.error('Error managing users:', error);
      toast.error('Failed to manage users');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const manageMatches = async (matchIds: string[], action: 'cancel' | 'postpone', newTime?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-platform-control', {
        body: { 
          action: 'manage_matches',
          data: { matchIds, action, newTime }
        },
      });

      if (error) throw error;
      toast.success(data.message);
      return true;
    } catch (error) {
      console.error('Error managing matches:', error);
      toast.error('Failed to manage matches');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateOdds = async (matchId: string, market: string, newOdds: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-platform-control', {
        body: { 
          action: 'manage_odds',
          data: { matchId, market, newOdds }
        },
      });

      if (error) throw error;
      toast.success(data.message);
      return true;
    } catch (error) {
      console.error('Error updating odds:', error);
      toast.error('Failed to update odds');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getFinancialSummary = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-platform-control', {
        body: { 
          action: 'manage_finances',
          data: { action: 'get_financial_summary', startDate, endDate }
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting financial summary:', error);
      toast.error('Failed to load financial summary');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const suspendPlatform = async (reason: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-platform-control', {
        body: { 
          action: 'suspend_platform',
          data: { reason }
        },
      });

      if (error) throw error;
      toast.success(data.message);
      return true;
    } catch (error) {
      console.error('Error suspending platform:', error);
      toast.error('Failed to suspend platform');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdate = async (table: string, updates: any, filters: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-platform-control', {
        body: { 
          action: 'bulk_update',
          data: { table, updates, filters }
        },
      });

      if (error) throw error;
      toast.success(data.message);
      return true;
    } catch (error) {
      console.error('Error in bulk update:', error);
      toast.error('Failed to complete bulk update');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getPlatformOverview,
    manageBets,
    manageUsers,
    manageMatches,
    updateOdds,
    getFinancialSummary,
    suspendPlatform,
    bulkUpdate,
  };
};
