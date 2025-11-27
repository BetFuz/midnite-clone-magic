import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface BurstGame {
  id: string;
  name: string;
  icon: string;
  minStake: number;
  maxWin: number;
  duration: number; // seconds
  rtp: number;
}

const BURST_GAMES: BurstGame[] = [
  { id: 'lightning', name: 'Lightning Strike', icon: '⚡', minStake: 50, maxWin: 10000, duration: 10, rtp: 96.5 },
  { id: 'rocket', name: 'Rocket Blast', icon: '🚀', minStake: 100, maxWin: 50000, duration: 15, rtp: 97.0 },
  { id: 'jackpot', name: 'Jackpot Rush', icon: '💰', minStake: 200, maxWin: 100000, duration: 20, rtp: 95.5 },
  { id: 'mega', name: 'Mega Burst', icon: '💥', minStake: 500, maxWin: 500000, duration: 30, rtp: 94.8 },
];

export const useBurstGames = () => {
  const [balance, setBalance] = useState(50000);
  const [activeGame, setActiveGame] = useState<BurstGame | null>(null);
  const [stake, setStake] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [multiplier, setMultiplier] = useState(1.00);
  const [countdown, setCountdown] = useState(0);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const selectGame = useCallback((game: BurstGame) => {
    setActiveGame(game);
    setStake(game.minStake);
    setResult(null);
  }, []);

  const playGame = useCallback(async () => {
    if (!activeGame) return;
    if (stake > balance) {
      toast({
        title: 'Insufficient Balance',
        description: 'Not enough funds',
        variant: 'destructive'
      });
      return;
    }

    setIsPlaying(true);
    setBalance(prev => prev - stake);
    setCountdown(activeGame.duration);
    setMultiplier(1.00);

    // Simulate burst game with increasing multiplier
    const interval = setInterval(() => {
      setMultiplier(prev => {
        const increase = Math.random() * 0.5;
        return parseFloat((prev + increase).toFixed(2));
      });
      
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          
          // Determine outcome
          const won = Math.random() < (activeGame.rtp / 100);
          const finalMultiplier = multiplier;
          const winAmount = won ? stake * finalMultiplier : 0;

          if (won) {
            setBalance(prevBalance => prevBalance + winAmount);
            toast({
              title: '🎉 Burst Win!',
              description: `Won ₦${winAmount.toLocaleString()} at ${finalMultiplier.toFixed(2)}x`
            });
          } else {
            toast({
              title: 'Burst!',
              description: 'Better luck next time',
              variant: 'destructive'
            });
          }

          setResult({ won, amount: winAmount });
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

  }, [activeGame, stake, balance, multiplier]);

  return {
    games: BURST_GAMES,
    balance,
    activeGame,
    setActiveGame,
    stake,
    setStake,
    isPlaying,
    multiplier,
    countdown,
    result,
    selectGame,
    playGame
  };
};
