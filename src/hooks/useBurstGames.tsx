import { useCasinoBalance } from './useCasinoBalance';
import { useState, useCallback, useEffect } from 'react';
import { InstantGameEngine, CrashGameState } from '@/lib/simulation/instantGameEngine';
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
  const [engine] = useState(() => new InstantGameEngine());
  const [gameState, setGameState] = useState<CrashGameState | null>(null);
  const { balance, setBalance, playRound } = useCasinoBalance();
  const [activeGame, setActiveGame] = useState<BurstGame | null>(null);
  const [stake, setStake] = useState(100);
  const [cashedOut, setCashedOut] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  useEffect(() => {
    engine.onUpdate((state: CrashGameState) => {
      setGameState(state);
      
      if (state.crashed && !cashedOut) {
        setResult({ won: false, amount: 0 });
        toast({
          title: `Crashed at ${state.crashPoint.toFixed(2)}x!`,
          description: 'Better luck next time',
          variant: 'destructive'
        });
      }
    });

    return () => {
      engine.destroy();
    };
  }, [engine, cashedOut]);

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

    setBalance(prev => prev - stake);
    setCashedOut(false);
    setWinAmount(0);
    setResult(null);
    
    const state = engine.simulateCrash();
    setGameState(state);
    
    toast({
      title: '🚀 Game Started!',
      description: `Bet: ₦${stake.toLocaleString()}`
    });
  }, [activeGame, stake, balance, engine]);

  const cashOut = useCallback(() => {
    if (!gameState || cashedOut || gameState.crashed) return;

    setCashedOut(true);
    const win = stake * gameState.multiplier;
    setWinAmount(win);
    setBalance(prev => prev + win);
    setResult({ won: true, amount: win });

    playRound('burst', stake, win).catch(() => {
      setBalance(prev => prev + stake);
    });

    toast({
      title: `Cashed out at ${gameState.multiplier.toFixed(2)}x!`,
      description: `Won ₦${win.toLocaleString()}`
    });
  }, [gameState, stake, cashedOut, playRound, setBalance]);

  return {
    games: BURST_GAMES,
    balance,
    activeGame,
    setActiveGame,
    stake,
    setStake,
    gameState,
    cashedOut,
    winAmount,
    result,
    selectGame,
    playGame,
    cashOut
  };
};
