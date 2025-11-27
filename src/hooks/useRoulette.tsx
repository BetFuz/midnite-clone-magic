import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type BetType = 
  | 'straight' | 'split' | 'street' | 'corner' | 'line'
  | 'red' | 'black' | 'even' | 'odd' | 'low' | 'high'
  | 'dozen1' | 'dozen2' | 'dozen3' | 'column1' | 'column2' | 'column3';

interface Bet {
  type: BetType;
  numbers: number[];
  amount: number;
  payout: number;
}

interface SpinResult {
  number: number;
  color: 'red' | 'black' | 'green';
}

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

export function useRoulette() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [spinHistory, setSpinHistory] = useState<SpinResult[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentResult, setCurrentResult] = useState<SpinResult | null>(null);
  const [balance, setBalance] = useState(10000);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const getNumberColor = (num: number): 'red' | 'black' | 'green' => {
    if (num === 0) return 'green';
    if (RED_NUMBERS.includes(num)) return 'red';
    return 'black';
  };

  const getBetPayout = (type: BetType): number => {
    const payouts: Record<BetType, number> = {
      straight: 35,
      split: 17,
      street: 11,
      corner: 8,
      line: 5,
      dozen1: 2,
      dozen2: 2,
      dozen3: 2,
      column1: 2,
      column2: 2,
      column3: 2,
      red: 1,
      black: 1,
      even: 1,
      odd: 1,
      low: 1,
      high: 1,
    };
    return payouts[type];
  };

  const getBetNumbers = (type: BetType, number?: number): number[] => {
    switch (type) {
      case 'straight':
        return number ? [number] : [];
      case 'red':
        return RED_NUMBERS;
      case 'black':
        return BLACK_NUMBERS;
      case 'even':
        return Array.from({ length: 18 }, (_, i) => (i + 1) * 2);
      case 'odd':
        return Array.from({ length: 18 }, (_, i) => i * 2 + 1);
      case 'low':
        return Array.from({ length: 18 }, (_, i) => i + 1);
      case 'high':
        return Array.from({ length: 18 }, (_, i) => i + 19);
      case 'dozen1':
        return Array.from({ length: 12 }, (_, i) => i + 1);
      case 'dozen2':
        return Array.from({ length: 12 }, (_, i) => i + 13);
      case 'dozen3':
        return Array.from({ length: 12 }, (_, i) => i + 25);
      case 'column1':
        return Array.from({ length: 12 }, (_, i) => i * 3 + 1);
      case 'column2':
        return Array.from({ length: 12 }, (_, i) => i * 3 + 2);
      case 'column3':
        return Array.from({ length: 12 }, (_, i) => i * 3 + 3);
      default:
        return [];
    }
  };

  const placeBet = useCallback((type: BetType, amount: number, number?: number) => {
    const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0) + amount;
    
    if (totalBet > balance) {
      toast({
        title: 'Insufficient Balance',
        description: 'Not enough funds to place this bet',
        variant: 'destructive',
      });
      return;
    }

    const newBet: Bet = {
      type,
      numbers: getBetNumbers(type, number),
      amount,
      payout: getBetPayout(type),
    };

    setBets(prev => [...prev, newBet]);
    toast({
      title: 'Bet Placed',
      description: `₦${amount.toLocaleString()} on ${type}${number ? ` (${number})` : ''}`,
    });
  }, [bets, balance]);

  const clearBets = useCallback(() => {
    setBets([]);
    toast({ title: 'Bets Cleared' });
  }, []);

  const spin = useCallback(async () => {
    if (bets.length === 0) {
      toast({
        title: 'No Bets Placed',
        description: 'Place at least one bet to spin',
        variant: 'destructive',
      });
      return;
    }

    const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0);
    setBalance(prev => prev - totalBet);
    setIsSpinning(true);

    // Simulate spin animation delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    const winningNumber = Math.floor(Math.random() * 37); // 0-36
    const result: SpinResult = {
      number: winningNumber,
      color: getNumberColor(winningNumber),
    };

    setCurrentResult(result);
    setSpinHistory(prev => [result, ...prev.slice(0, 19)]);

    // Calculate winnings
    let totalWin = 0;
    bets.forEach(bet => {
      if (bet.numbers.includes(winningNumber)) {
        totalWin += bet.amount * (bet.payout + 1);
      }
    });

    if (totalWin > 0) {
      setBalance(prev => prev + totalWin);
      toast({
        title: `Winner! ${winningNumber} ${result.color.toUpperCase()}`,
        description: `You won ₦${totalWin.toLocaleString()}!`,
      });
    } else {
      toast({
        title: `${winningNumber} ${result.color.toUpperCase()}`,
        description: 'Better luck next time!',
        variant: 'destructive',
      });
    }

    setIsSpinning(false);
    setBets([]);
  }, [bets, balance]);

  const getAIAnalysis = useCallback(async () => {
    if (spinHistory.length < 5) {
      toast({
        title: 'More Spins Needed',
        description: 'AI analysis requires at least 5 spins',
      });
      return;
    }

    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-roulette', {
        body: { 
          action: 'analyze',
          spinHistory: spinHistory.slice(0, 10) 
        },
      });

      if (error) throw error;
      setAiAnalysis(data.analysis);
      toast({ title: 'AI Analysis Ready' });
    } catch (error) {
      console.error('AI analysis error:', error);
      toast({
        title: 'AI Analysis Failed',
        description: 'Could not generate analysis',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAI(false);
    }
  }, [spinHistory]);

  const getAIStrategy = useCallback(async () => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-roulette', {
        body: { 
          action: 'strategy',
          balance,
          spinHistory: spinHistory.slice(0, 10)
        },
      });

      if (error) throw error;
      toast({
        title: 'AI Strategy Suggestion',
        description: data.strategy,
      });
    } catch (error) {
      console.error('AI strategy error:', error);
      toast({
        title: 'AI Strategy Failed',
        description: 'Could not generate strategy',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAI(false);
    }
  }, [balance, spinHistory]);

  return {
    bets,
    spinHistory,
    isSpinning,
    currentResult,
    balance,
    aiAnalysis,
    isLoadingAI,
    placeBet,
    clearBets,
    spin,
    getAIAnalysis,
    getAIStrategy,
  };
}
