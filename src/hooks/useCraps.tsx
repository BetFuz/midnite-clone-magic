import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type GamePhase = 'come-out' | 'point';
type BetType = 'pass' | 'dont-pass' | 'field' | 'any-craps' | 'seven' | 'eleven';

interface Bet {
  type: BetType;
  amount: number;
}

interface DiceResult {
  die1: number;
  die2: number;
  total: number;
}

export const useCraps = () => {
  const [balance, setBalance] = useState(50000);
  const [phase, setPhase] = useState<GamePhase>('come-out');
  const [point, setPoint] = useState<number | null>(null);
  const [currentBets, setCurrentBets] = useState<Bet[]>([]);
  const [diceResult, setDiceResult] = useState<DiceResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useState<DiceResult[]>([]);
  const [stickmanCall, setStickmanCall] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { toast } = useToast();

  const betPayouts: Record<BetType, number> = {
    'pass': 1,
    'dont-pass': 1,
    'field': 1, // 2:1 for 2 or 12
    'any-craps': 7,
    'seven': 4,
    'eleven': 15
  };

  const placeBet = useCallback((type: BetType, amount: number) => {
    if (amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: "Not enough balance for this bet",
        variant: "destructive"
      });
      return;
    }

    setCurrentBets(prev => [...prev, { type, amount }]);
    setBalance(prev => prev - amount);

    toast({
      title: "Bet Placed",
      description: `${type.toUpperCase()} - ₦${amount.toLocaleString()}`
    });
  }, [balance, toast]);

  const clearBets = useCallback(() => {
    const totalBets = currentBets.reduce((sum, bet) => sum + bet.amount, 0);
    setBalance(prev => prev + totalBets);
    setCurrentBets([]);
    toast({
      title: "Bets Cleared",
      description: "All bets returned"
    });
  }, [currentBets, toast]);

  const getStickmanCall = useCallback(async (result: DiceResult) => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-craps', {
        body: { 
          action: 'stickmanCall', 
          roll: result,
          phase,
          point 
        }
      });

      if (error) throw error;

      setStickmanCall(data.call);
      return data.call;
    } catch (error) {
      console.error('Stickman call error:', error);
      return getDefaultCall(result);
    } finally {
      setIsLoadingAI(false);
    }
  }, [phase, point]);

  const getDefaultCall = (result: DiceResult): string => {
    const { total } = result;
    
    if (phase === 'come-out') {
      if (total === 7 || total === 11) return `${total}! Winner winner! Pass line wins!`;
      if (total === 2 || total === 3 || total === 12) return `Craps! ${total}! Don't pass wins!`;
      return `${total}! Point is ${total}! Mark it!`;
    } else {
      if (total === point) return `${total}! That's the point! Winner!`;
      if (total === 7) return `Seven out! Line away!`;
      return `${total}! Keep rolling!`;
    }
  };

  const calculateWinnings = useCallback((result: DiceResult): number => {
    const { total } = result;
    let winnings = 0;

    currentBets.forEach(bet => {
      if (phase === 'come-out') {
        if (bet.type === 'pass' && (total === 7 || total === 11)) {
          winnings += bet.amount * (1 + betPayouts[bet.type]);
        } else if (bet.type === 'dont-pass' && (total === 2 || total === 3 || total === 12)) {
          winnings += bet.amount * (1 + betPayouts[bet.type]);
        } else if (bet.type === 'field' && [2, 3, 4, 9, 10, 11, 12].includes(total)) {
          const multiplier = [2, 12].includes(total) ? 2 : 1;
          winnings += bet.amount * (1 + betPayouts[bet.type] * multiplier);
        } else if (bet.type === 'any-craps' && [2, 3, 12].includes(total)) {
          winnings += bet.amount * (1 + betPayouts[bet.type]);
        } else if (bet.type === 'seven' && total === 7) {
          winnings += bet.amount * (1 + betPayouts[bet.type]);
        } else if (bet.type === 'eleven' && total === 11) {
          winnings += bet.amount * (1 + betPayouts[bet.type]);
        }
      } else {
        // Point phase
        if (bet.type === 'pass' && total === point) {
          winnings += bet.amount * (1 + betPayouts[bet.type]);
        } else if (bet.type === 'dont-pass' && total === 7) {
          winnings += bet.amount * (1 + betPayouts[bet.type]);
        }
      }
    });

    return winnings;
  }, [currentBets, phase, point, betPayouts]);

  const rollDice = useCallback(async () => {
    if (currentBets.length === 0) {
      toast({
        title: "No Bets Placed",
        description: "Place a bet before rolling",
        variant: "destructive"
      });
      return;
    }

    setIsRolling(true);

    // Simulate dice roll
    await new Promise(resolve => setTimeout(resolve, 1500));

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    const result: DiceResult = { die1, die2, total };

    setDiceResult(result);
    setRollHistory(prev => [result, ...prev].slice(0, 20));

    // Get AI stickman call
    const call = await getStickmanCall(result);

    // Calculate winnings
    const winnings = calculateWinnings(result);
    
    if (winnings > 0) {
      setBalance(prev => prev + winnings);
      toast({
        title: "Winner! 🎉",
        description: `Won ₦${winnings.toLocaleString()}!`
      });
    }

    // Update game phase
    if (phase === 'come-out') {
      if ([4, 5, 6, 8, 9, 10].includes(total)) {
        setPoint(total);
        setPhase('point');
      } else if ([7, 11, 2, 3, 12].includes(total)) {
        setCurrentBets([]);
      }
    } else {
      if (total === point || total === 7) {
        setPoint(null);
        setPhase('come-out');
        setCurrentBets([]);
      }
    }

    setIsRolling(false);
  }, [currentBets, phase, point, calculateWinnings, getStickmanCall, toast]);

  const getTotalBetAmount = useCallback(() => {
    return currentBets.reduce((sum, bet) => sum + bet.amount, 0);
  }, [currentBets]);

  return {
    balance,
    phase,
    point,
    currentBets,
    diceResult,
    isRolling,
    rollHistory,
    stickmanCall,
    isLoadingAI,
    betPayouts,
    placeBet,
    clearBets,
    rollDice,
    getTotalBetAmount
  };
};
