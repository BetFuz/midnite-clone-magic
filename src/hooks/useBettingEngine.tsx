import { useState, useEffect, useCallback } from 'react';
import { UniversalBettingEngine, BettingConfig, BetType, BetResult, GameBet } from '@/lib/betting/universalBettingEngine';
import { toast } from '@/hooks/use-toast';

export const useBettingEngine = (config: BettingConfig) => {
  const [engine] = useState(() => new UniversalBettingEngine(config));
  const [availableBets, setAvailableBets] = useState<BetType[]>([]);
  const [activeBets, setActiveBets] = useState<GameBet[]>([]);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  useEffect(() => {
    setAvailableBets(engine.getBetTypes());
  }, [engine]);

  const placeBet = useCallback(async (
    sessionId: string,
    betType: string,
    betValue: string,
    customStake?: number
  ): Promise<BetResult> => {
    setIsPlacingBet(true);

    try {
      const result = await engine.placeBet(sessionId, betType, betValue, customStake);

      if (result.success) {
        toast({
          title: config.culturalMode ? '🎯 Bet Placed!' : 'Bet Placed Successfully',
          description: `Stake: ₦${customStake || config.stakeAmount} | Potential Win: ₦${result.potentialWin?.toFixed(2)}`,
        });

        // Refresh active bets
        if (sessionId) {
          const bets = await engine.getSessionBets(sessionId);
          setActiveBets(bets);
        }
      } else {
        toast({
          title: 'Bet Failed',
          description: result.error || 'Could not place bet',
          variant: 'destructive',
        });
      }

      return result;
    } finally {
      setIsPlacingBet(false);
    }
  }, [engine, config]);

  const getSessionBets = useCallback(async (sessionId: string) => {
    const bets = await engine.getSessionBets(sessionId);
    setActiveBets(bets);
    return bets;
  }, [engine]);

  const settleBets = useCallback(async (
    sessionId: string,
    gameResult: any
  ) => {
    await engine.settleBets(sessionId, gameResult);
    
    // Show cultural celebration if enabled
    const celebration = engine.getCulturalCelebration(gameResult.winner === 'player1');
    if (celebration) {
      toast({
        title: 'Game Complete!',
        description: celebration,
      });
    }

    // Refresh bets
    const bets = await engine.getSessionBets(sessionId);
    setActiveBets(bets);
  }, [engine]);

  const calculateOdds = useCallback((betType: string, difficulty?: string): number => {
    return engine.calculateOdds(betType, difficulty);
  }, [engine]);

  return {
    availableBets,
    activeBets,
    isPlacingBet,
    placeBet,
    getSessionBets,
    settleBets,
    calculateOdds,
  };
};
