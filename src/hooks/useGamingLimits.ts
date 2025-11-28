import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GamingLimits {
  id: string;
  user_id: string;
  daily_stake_limit: number;
  daily_loss_limit: number;
  session_time_limit: number;
  cooling_off_until: string | null;
  self_excluded_until: string | null;
  created_at: string;
  updated_at: string;
}

interface DailyUsage {
  total_stake: number;
  total_loss: number;
}

export const useGamingLimits = () => {
  const [limits, setLimits] = useState<GamingLimits | null>(null);
  const [usage, setUsage] = useState<DailyUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const fetchLimits = async () => {
    try {
      setLoading(true);
      
      // Get user limits
      const { data: limitsData, error: limitsError } = await supabase
        .from('responsible_gaming_limits')
        .select('*')
        .single();

      if (limitsError && limitsError.code !== 'PGRST116') {
        throw limitsError;
      }

      setLimits(limitsData);

      // Get daily usage
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: usageData, error: usageError } = await supabase
          .rpc('get_daily_usage', { p_user_id: user.id })
          .single();

        if (usageError) {
          console.error('Error fetching usage:', usageError);
        } else {
          setUsage(usageData);
        }
      }
    } catch (error) {
      console.error('Error fetching gaming limits:', error);
      toast({
        title: "Error",
        description: "Failed to fetch gaming limits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  const updateLimits = async (newLimits: {
    daily_stake_limit?: number;
    daily_loss_limit?: number;
    session_time_limit?: number;
    cooling_off_days?: number;
    self_exclusion_days?: number;
  }) => {
    setUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('set-gaming-limits', {
        body: newLimits
      });

      if (error) throw error;

      toast({
        title: "Limits Updated",
        description: "Your responsible gaming limits have been updated.",
      });

      await fetchLimits();
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating limits:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update gaming limits",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setUpdating(false);
    }
  };

  const isLimitExceeded = () => {
    if (!limits || !usage) return false;

    return (
      usage.total_stake >= limits.daily_stake_limit ||
      usage.total_loss >= limits.daily_loss_limit
    );
  };

  const isSelfExcluded = () => {
    if (!limits) return false;
    return limits.self_excluded_until && new Date(limits.self_excluded_until) > new Date();
  };

  const isCoolingOff = () => {
    if (!limits) return false;
    return limits.cooling_off_until && new Date(limits.cooling_off_until) > new Date();
  };

  return {
    limits,
    usage,
    loading,
    updating,
    updateLimits,
    refreshLimits: fetchLimits,
    isLimitExceeded,
    isSelfExcluded,
    isCoolingOff
  };
};
