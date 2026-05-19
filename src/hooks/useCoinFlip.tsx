import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCasinoBalance } from './useCasinoBalance';

interface CoinFlipState {
  balance: number;
  stake: number;
  isFlipping: boolean;
  lastResult: 'heads' | 'tails' | null;
  prediction: 'heads' | 'tails' | null;
  narrative: string;
  wins: number;
  losses: number;
  totalFlips: number;
}

export const useCoinFlip = () => {
  const { toast } = useToast();
  const { balance: walletBalance, playRound: syncRound } = useCasinoBalance();
  const [state, setState] = useState<CoinFlipState>({
    balance: 50000,
    stake: 1000,
    isFlipping: false,
    lastResult: null,
    prediction: null,
    narrative: 'Make your prediction and flip the coin...',
    wins: 0,
    losses: 0,
    totalFlips: 0,
  });

  const setStake = (amount: number) => {
    if (amount > state.balance) {
      toast({
        title: "Insufficient Balance",
        description: `Your balance is ₦${state.balance.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }
    setState(prev => ({ ...prev, stake: amount }));
  };

  const setPrediction = (prediction: 'heads' | 'tails') => {
    setState(prev => ({ ...prev, prediction }));
  };

  const generateNarrative = async (result: 'heads' | 'tails', prediction: 'heads' | 'tails', won: boolean) => {
    try {
      // AI narrative unavailable
      return won ? 'Victory! Fortune favors the brave!' : 'Fate had other plans. Try again!';
    } catch (error) {
      console.error('Error generating narrative:', error);
      return won ? '🎉 Victory! The coin favors the bold!' : '💔 Defeat... But fortune favors the brave!';
    }
  };

  const flipCoin = async () => {
    if (!state.prediction) {
      toast({
        title: "Make a Prediction",
        description: "Choose Heads or Tails before flipping",
        variant: "destructive",
      });
      return;
    }

    if (state.stake > state.balance) {
      toast({
        title: "Insufficient Balance",
        description: `Your balance is ₦${state.balance.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isFlipping: true,
      narrative: '🪙 The coin spins through the air... fate hangs in the balance...'
    }));

    // Simulate coin flip delay for drama
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails';
    const won = result === state.prediction;
    const winAmount = won ? state.stake * 2 : 0;
    const newBalance = won ? state.balance + state.stake : state.balance - state.stake;

    // Generate AI narrative
    const narrative = await generateNarrative(result, state.prediction!, won);

    syncRound('coin-flip', state.stake, winAmount).catch(() => {});

    setState(prev => ({
      ...prev,
      balance: newBalance,
      lastResult: result,
      isFlipping: false,
      narrative,
      wins: won ? prev.wins + 1 : prev.wins,
      losses: won ? prev.losses : prev.losses + 1,
      totalFlips: prev.totalFlips + 1,
      prediction: null,
    }));

    toast({
      title: won ? "🎉 You Won!" : "💔 You Lost",
      description: won 
        ? `You won ₦${winAmount.toLocaleString()}! The coin landed on ${result}.`
        : `You lost ₦${state.stake.toLocaleString()}. The coin landed on ${result}.`,
      variant: won ? "default" : "destructive",
    });
  };

  const reset = () => {
    setState(prev => ({
      ...prev,
      prediction: null,
      lastResult: null,
      narrative: 'Make your prediction and flip the coin...',
    }));
  };

  return {
    ...state,
    setStake,
    setPrediction,
    flipCoin,
    reset,
  };
};
