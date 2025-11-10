import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BetSelection {
  id: string;
  matchId: string;
  sport: string;
  league?: string;
  homeTeam: string;
  awayTeam: string;
  selectionType: "home" | "away" | "draw";
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please login to place a bet",
          variant: "destructive",
        });
        return;
      }

      // Create bet slip
      const { data: betSlip, error: betSlipError } = await supabase
        .from("bet_slips")
        .insert({
          user_id: user.id,
          total_stake: stake,
          total_odds: totalOdds,
          potential_win: potentialWin,
          bet_type: selections.length === 1 ? "single" : "multiple",
        })
        .select()
        .single();

      if (betSlipError) throw betSlipError;

      // Create bet selections
      const { error: selectionsError } = await supabase
        .from("bet_selections")
        .insert(
          selections.map(sel => ({
            bet_slip_id: betSlip.id,
            match_id: sel.matchId,
            sport: sel.sport,
            league: sel.league,
            home_team: sel.homeTeam,
            away_team: sel.awayTeam,
            selection_type: sel.selectionType,
            selection_value: sel.selectionValue,
            odds: sel.odds,
            match_time: sel.matchTime,
          }))
        );

      if (selectionsError) throw selectionsError;

      toast({
        title: "Bet Placed Successfully! 🎉",
        description: `Ticket ID: ${betSlip.id.slice(0, 8)}... | Potential win: ₦${potentialWin.toFixed(2)}`,
      });

      clearSelections();
    } catch (error: any) {
      console.error("Error placing bet:", error);
      toast({
        title: "Failed to Place Bet",
        description: error.message || "Please try again",
        variant: "destructive",
      });
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
