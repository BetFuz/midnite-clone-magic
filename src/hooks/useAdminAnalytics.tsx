import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealtimeAnalytics {
  timestamp: string;
  realtime: {
    activeUsers: number;
    recentBetsCount: number;
    liveBetsCount: number;
    liveStake: number;
    potentialPayout: number;
    avgBetSize: number;
  };
  today: {
    totalBets: number;
    totalStaked: number;
    won: number;
    lost: number;
    pending: number;
    newUsers: number;
  };
  trending: {
    markets: Array<{
      market: string;
      count: number;
    }>;
  };
  system: {
    totalUsers: number;
    totalMatches: number;
    status: string;
  };
}

export const useAdminAnalytics = (autoRefresh = true, refreshInterval = 30000) => {
  const [analytics, setAnalytics] = useState<RealtimeAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase.functions.invoke('admin-realtime-analytics');

      if (fetchError) throw fetchError;
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  return {
    analytics,
    loading,
    error,
    refresh: fetchAnalytics,
  };
};