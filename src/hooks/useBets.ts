import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BetSelection {
  match_id: string;
  home_team: string;
  away_team: string;
  sport: string;
  league?: string;
  selection_type: string;
  selection_value: string;
  odds: number;
  match_time?: string;
}

interface CreateBetParams {
  stake: number;
  selections: BetSelection[];
}

export const useBets = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createBet = async ({ stake, selections }: CreateBetParams) => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-bet', {
        body: { stake, selections }
      });

      if (error) throw error;

      toast({
        title: "Bet Placed Successfully",
        description: `Your bet of ₦${stake.toLocaleString()} has been placed.`,
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating bet:', error);
      toast({
        title: "Bet Failed",
        description: error.message || "Failed to place bet",
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setIsCreating(false);
    }
  };

  const listBets = async (page: number = 1, limit: number = 20) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('list-bets', {
        body: { page, limit }
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching bets:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch bets",
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createBet,
    listBets,
    isCreating,
    isLoading
  };
};
