import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export interface BetSelection {
  id: string;
  matchId: string;
  sport: string;
  league?: string;
  homeTeam: string;
  awayTeam: string;
  selectionType: "home" | "away" | "draw" | "politics" | "economy" | "social" | "other";
  selectionValue: string;
  odds: number;
  matchTime?: string;
}

interface BetSlipContextType {
  selections: BetSelection[];
  addSelection: (selection: BetSelection) => void;
  removeSelection: (id: string) => void;
  clearSelections: () => void;
  totalOdds: number;
  stake: number;
  setStake: (stake: number) => void;
  potentialWin: number;
  placeBet: () => Promise<void>;
  isPlacingBet: boolean;
}

const BetSlipContext = createContext<BetSlipContextType | undefined>(undefined);

export const BetSlipProvider = ({ children }: { children: ReactNode }) => {
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [stake, setStake] = useState<number>(100);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const { toast } = useToast();

  const totalOdds = selections.reduce((acc, sel) => acc * sel.odds, 1);
  const potentialWin = stake * totalOdds;

  const addSelection = (selection: BetSelection) => {
    // Check if selection already exists
    const exists = selections.find(s => s.id === selection.id);
    if (exists) {
      toast({
        title: "Already Added",
        description: "This selection is already in your bet slip",
        variant: "destructive",
      });
      return;
    }

    // Check if there's already a selection from the same match
    const sameMatch = selections.find(s => s.matchId === selection.matchId);
    if (sameMatch) {
      toast({
        title: "Cannot Add",
        description: "You already have a selection from this match",
        variant: "destructive",
      });
      return;
    }

    setSelections(prev => [...prev, selection]);
    toast({
      title: "Added to Bet Slip",
      description: `${selection.homeTeam} vs ${selection.awayTeam} - ${selection.selectionValue}`,
    });
  };

  const removeSelection = (id: string) => {
    setSelections(prev => prev.filter(s => s.id !== id));
    toast({
      title: "Removed",
      description: "Selection removed from bet slip",
    });
  };

  const clearSelections = () => {
    setSelections([]);
    setStake(100);
  };

  const placeBet = async () => {
    if (selections.length === 0) {
      toast({
        title: "No Selections",
        description: "Please add selections to place a bet",
        variant: "destructive",
      });
      return;
    }

    if (stake < 100) {
      toast({
        title: "Invalid Stake",
        description: "Minimum stake is ₦100",
        variant: "destructive",
      });
      return;
    }

    setIsPlacingBet(true);

    try {
      const { betApi } = await import('@/lib/api/bets');
      const { useAuthStore } = await import('@/store/authStore');
      const authUser = useAuthStore.getState().user;

      if (!authUser) {
        toast({
          title: "Authentication Required",
          description: "Please login to place a bet",
          variant: "destructive",
        });
        return;
      }

      const apiSelections = selections.map(sel => ({
        eventId: sel.matchId,
        marketId: sel.selectionType,
        oddsId: `${sel.matchId}_${sel.selectionType}_${sel.selectionValue}`,
        odds: sel.odds,
      }));

      const betType = selections.length === 1 ? 'single' : 'accumulator';
      const result = await betApi.placeBet({ selections: apiSelections, stake, betType });

      toast({
        title: "Bet Placed Successfully! 🎉",
        description: `Ticket: ${result?.id?.slice(0, 8) || 'placed'} | Potential win: ₦${potentialWin.toFixed(2)}`,
      });

      clearSelections();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Please try again";
      toast({ title: "Failed to Place Bet", description: msg, variant: "destructive" });
    } finally {
      setIsPlacingBet(false);
    }
  };

  return (
    <BetSlipContext.Provider
      value={{
        selections,
        addSelection,
        removeSelection,
        clearSelections,
        totalOdds,
        stake,
        setStake,
        potentialWin,
        placeBet,
        isPlacingBet,
      }}
    >
      {children}
    </BetSlipContext.Provider>
  );
};

export const useBetSlip = () => {
  const context = useContext(BetSlipContext);
  if (!context) {
    throw new Error("useBetSlip must be used within BetSlipProvider");
  }
  return context;
};
