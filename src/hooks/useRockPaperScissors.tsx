import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Move = 'rock' | 'paper' | 'scissors';
type Result = 'win' | 'lose' | 'tie';

interface Round {
  playerMove: Move;
  aiMove: Move;
  result: Result;
  stake: number;
  winnings: number;
}

interface AIProfile {
  name: string;
  style: string;
  description: string;
  winRate: number;
}

export const useRockPaperScissors = () => {
  const [balance, setBalance] = useState(50000);
  const [stake, setStake] = useState(100);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiProfile, setAiProfile] = useState<AIProfile | null>(null);
  const [aiThinking, setAiThinking] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { toast } = useToast();

  const getWinner = useCallback((player: Move, ai: Move): Result => {
    if (player === ai) return 'tie';
    if (
      (player === 'rock' && ai === 'scissors') ||
      (player === 'paper' && ai === 'rock') ||
      (player === 'scissors' && ai === 'paper')
    ) {
      return 'win';
    }
    return 'lose';
  }, []);

  const generateAIProfile = useCallback(async () => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-rps', {
        body: { action: 'generateProfile' }
      });

      if (error) throw error;

      setAiProfile(data.profile);
      return data.profile;
    } catch (error) {
      console.error('AI Profile error:', error);
      // Fallback profile
      const fallback: AIProfile = {
        name: 'Adaptive AI',
        style: 'Pattern Recognition',
        description: 'Analyzes your moves to predict patterns',
        winRate: 0.65
      };
      setAiProfile(fallback);
      return fallback;
    } finally {
      setIsLoadingAI(false);
    }
  }, []);

  const getAIMove = useCallback(async (playerHistory: Move[]): Promise<{ move: Move; thinking: string }> => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-rps', {
        body: { 
          action: 'predictMove',
          history: playerHistory
        }
      });

      if (error) throw error;

      setAiThinking(data.thinking);
      return { move: data.move, thinking: data.thinking };
    } catch (error) {
      console.error('AI Move error:', error);
      // Fallback random move with some pattern logic
      const moves: Move[] = ['rock', 'paper', 'scissors'];
      
      if (playerHistory.length >= 3) {
        const lastThree = playerHistory.slice(-3);
        const rockCount = lastThree.filter(m => m === 'rock').length;
        const paperCount = lastThree.filter(m => m === 'paper').length;
        const scissorsCount = lastThree.filter(m => m === 'scissors').length;
        
        if (rockCount >= 2) return { move: 'paper', thinking: 'Detected rock pattern...' };
        if (paperCount >= 2) return { move: 'scissors', thinking: 'Detected paper pattern...' };
        if (scissorsCount >= 2) return { move: 'rock', thinking: 'Detected scissors pattern...' };
      }
      
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return { move: randomMove, thinking: 'Making unpredictable move...' };
    } finally {
      setIsLoadingAI(false);
    }
  }, []);

  const playRound = useCallback(async (playerMove: Move) => {
    if (stake > balance) {
      toast({
        title: "Insufficient Balance",
        description: "Not enough balance for this bet",
        variant: "destructive"
      });
      return;
    }

    setIsPlaying(true);
    setBalance(prev => prev - stake);

    // Get AI move based on history
    const playerHistory = rounds.map(r => r.playerMove);
    const { move: aiMove, thinking } = await getAIMove(playerHistory);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = getWinner(playerMove, aiMove);
    
    let winnings = 0;
    if (result === 'win') {
      winnings = stake * 2;
      setBalance(prev => prev + winnings);
    } else if (result === 'tie') {
      winnings = stake;
      setBalance(prev => prev + stake);
    }

    const round: Round = {
      playerMove,
      aiMove,
      result,
      stake,
      winnings
    };

    setCurrentRound(round);
    setRounds(prev => [round, ...prev]);

    // Show result toast
    if (result === 'win') {
      toast({
        title: "You Win! 🎉",
        description: `Won ₦${winnings.toLocaleString()}!`
      });
    } else if (result === 'lose') {
      toast({
        title: "AI Wins",
        description: thinking || "Better luck next time!"
      });
    } else {
      toast({
        title: "It's a Tie!",
        description: "Stake returned"
      });
    }

    setIsPlaying(false);
  }, [stake, balance, rounds, getWinner, getAIMove, toast]);

  const resetGame = useCallback(() => {
    setCurrentRound(null);
    setAiThinking('');
  }, []);

  const getStats = useCallback(() => {
    const wins = rounds.filter(r => r.result === 'win').length;
    const losses = rounds.filter(r => r.result === 'lose').length;
    const ties = rounds.filter(r => r.result === 'tie').length;
    const winRate = rounds.length > 0 ? (wins / rounds.length) * 100 : 0;
    const totalWinnings = rounds.reduce((sum, r) => sum + r.winnings, 0);
    const totalStaked = rounds.reduce((sum, r) => sum + r.stake, 0);
    const profit = totalWinnings - totalStaked;

    return { wins, losses, ties, winRate, profit, totalGames: rounds.length };
  }, [rounds]);

  return {
    balance,
    stake,
    setStake,
    rounds,
    currentRound,
    isPlaying,
    aiProfile,
    aiThinking,
    isLoadingAI,
    playRound,
    resetGame,
    generateAIProfile,
    getStats
  };
};
