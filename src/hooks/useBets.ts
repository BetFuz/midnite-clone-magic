import { useState } from 'react';
import { betApi } from '@/lib/api/bets';
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
  // BetFuz API fields
  eventId?: string;
  marketId?: string;
  oddsId?: string;
}

interface CreateBetParams {
  stake: number;
  selections: BetSelection[];
  betType?: 'single' | 'accumulator';
}

export const useBets = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createBet = async ({ stake, selections, betType }: CreateBetParams) => {
    setIsCreating(true);
    try {
      const apiSelections = selections.map(s => ({
        eventId: s.eventId || s.match_id,
        marketId: s.marketId || s.selection_type,
        oddsId: s.oddsId || `${s.match_id}_${s.selection_type}_${s.selection_value}`,
        odds: s.odds,
      }));

      const type = betType || (selections.length > 1 ? 'accumulator' : 'single');
      const data = await betApi.placeBet({ selections: apiSelections, stake, betType: type });

      toast({
        title: "Bet Placed Successfully",
        description: `Your bet of ₦${stake.toLocaleString()} has been placed.`,
      });
      return { data, error: null };
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to place bet";
      toast({ title: "Bet Failed", description: msg, variant: "destructive" });
      return { data: null, error };
    } finally {
      setIsCreating(false);
    }
  };

  const listBets = async (page: number = 1, limit: number = 20) => {
    setIsLoading(true);
    try {
      const data = await betApi.getMyBets({ limit, offset: (page - 1) * limit });
      return { data, error: null };
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to fetch bets";
      toast({ title: "Error", description: msg, variant: "destructive" });
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { createBet, listBets, isCreating, isLoading };
};
