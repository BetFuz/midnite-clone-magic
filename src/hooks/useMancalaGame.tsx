import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MancalaEngine, GameState, Move, Player, Variant } from '@/lib/games/mancalaEngine';
import { toast } from '@/hooks/use-toast';
import { useBettingEngine } from '@/hooks/useBettingEngine';

interface UseMancalaGameProps {
  gameId: string | null;
  mode: 'p2p' | 'human-ai' | 'ai-ai' | 'cultural';
  userId: string | null;
  stakeAmount?: number;
  difficulty?: 'Novice' | 'Skilled' | 'Expert' | 'Master';
  variant?: Variant;
  culturalMode?: boolean;
}

export const useMancalaGame = ({
  gameId,
  mode,
  userId,
  stakeAmount = 0,
  difficulty = 'Skilled',
  variant = 'Oware',
  culturalMode = false,
}: UseMancalaGameProps) => {
  const [gameState, setGameState] = useState<GameState>(MancalaEngine.createInitialState(variant));
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize betting engine
  const betting = useBettingEngine({
    gameId,
    gameType: 'mancala',
    mode,
    userId,
    stakeAmount,
    difficulty,
    culturalMode,
  });

  // AI difficulty mapping
  const getDifficulty = () => {
    switch (difficulty) {
      case 'Novice': return 2;
      case 'Skilled': return 3;
      case 'Expert': return 4;
      case 'Master': return 5;
      default: return 3;
    }
  };

  // Handle pit click
  const handlePitClick = useCallback(async (pit: number) => {
    if (isProcessing || gameState.gameOver) return;
    
    // Check if valid move
    if (!gameState.validMoves.includes(pit)) {
      toast({
        title: 'Invalid Move',
        description: 'Please select a pit with seeds on your side',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const move: Move = { pit };
      let newState = MancalaEngine.makeMove(gameState, move);
      setGameState(newState);

      // Check for captures
      if (newState.captureHistory.length > gameState.captureHistory.length) {
        const lastCapture = newState.captureHistory[newState.captureHistory.length - 1];
        toast({
          title: culturalMode ? 'Harvest! 🌱' : 'Seeds Captured!',
          description: `${lastCapture.player === 'player1' ? 'Player 1' : 'Player 2'} captured ${lastCapture.seeds} seeds!`,
        });
      }

      // Update in Supabase if P2P mode
      if (mode === 'p2p' && gameId) {
        await supabase.rpc('update_game_state', {
          p_session_id: gameId,
          p_game_state: newState as any,
          p_current_player: newState.currentPlayer === 'player1' ? 'red' : 'black',
          p_winner: newState.winner === 'player1' ? 'red' : newState.winner === 'player2' ? 'black' : null,
        });
      }

      // Check for game over
      if (newState.gameOver) {
        const winnerText = newState.winner === 'player1' ? 'Player 1' : newState.winner === 'player2' ? 'Player 2' : 'Draw';
        toast({
          title: 'Game Over!',
          description: `${winnerText} wins! Final score: ${newState.player1Seeds} - ${newState.player2Seeds}`,
        });

        // Settle bets
        if (sessionId) {
          await betting.settleBets(sessionId, {
            winner: newState.winner,
            player1Stats: { captured: newState.player1Seeds },
            player2Stats: { captured: newState.player2Seeds },
            gameStats: { perfect: newState.player1Seeds === 48 || newState.player2Seeds === 48 },
          });
        }

        if (mode === 'p2p' && gameId) {
          await supabase.rpc('settle_game_bets', {
            p_session_id: gameId,
            p_winner: newState.winner === 'player1' ? 'red' : 'black',
          });
        }
      }

      // AI move in human-ai mode
      if (mode === 'human-ai' && !newState.gameOver && newState.currentPlayer === 'player2') {
        setTimeout(() => makeAIMove(newState), 800);
      }

    } catch (error) {
      console.error('Error processing move:', error);
      toast({
        title: 'Error',
        description: 'Failed to process move',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [gameState, isProcessing, mode, gameId, culturalMode]);

  // AI move logic
  const makeAIMove = useCallback(async (currentState: GameState) => {
    setIsProcessing(true);

    try {
      const depth = getDifficulty();
      const aiMove = MancalaEngine.getBestMove(currentState, 'player2', depth);

      if (aiMove) {
        const newState = MancalaEngine.makeMove(currentState, aiMove);
        setGameState(newState);

        // Check for AI captures
        if (newState.captureHistory.length > currentState.captureHistory.length) {
          const lastCapture = newState.captureHistory[newState.captureHistory.length - 1];
          toast({
            title: culturalMode ? 'AI Harvests! 🌱' : 'AI Captured Seeds!',
            description: `AI captured ${lastCapture.seeds} seeds from pit ${lastCapture.position}!`,
          });
        }

        if (newState.gameOver) {
          const winnerText = newState.winner === 'player1' ? 'You win!' : newState.winner === 'player2' ? 'AI wins!' : 'Draw!';
          toast({
            title: 'Game Over!',
            description: `${winnerText} Final score: ${newState.player1Seeds} - ${newState.player2Seeds}`,
          });
        }
      }
    } catch (error) {
      console.error('Error making AI move:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [culturalMode]);

  // AI vs AI automation
  useEffect(() => {
    if (mode === 'ai-ai' && !gameState.gameOver && !isProcessing) {
      const timer = setTimeout(() => {
        const depth = 3;
        const aiMove = MancalaEngine.getBestMove(gameState, gameState.currentPlayer, depth);

        if (aiMove) {
          const newState = MancalaEngine.makeMove(gameState, aiMove);
          setGameState(newState);

          if (newState.gameOver) {
            const winnerText = newState.winner === 'player1' ? 'AI 1 wins!' : newState.winner === 'player2' ? 'AI 2 wins!' : 'Draw!';
            toast({
              title: 'Tournament Complete!',
              description: `${winnerText} Final score: ${newState.player1Seeds} - ${newState.player2Seeds}`,
            });
          }
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [mode, gameState, isProcessing]);

  // P2P real-time sync
  useEffect(() => {
    if (mode !== 'p2p' || !gameId) return;

    const channel = supabase
      .channel(`game-${gameId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_sessions',
        filter: `id=eq.${gameId}`,
      }, (payload) => {
        if (payload.new.game_state) {
          setGameState(payload.new.game_state as GameState);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mode, gameId]);

  const resetGame = () => {
    setGameState(MancalaEngine.createInitialState(variant));
    setSessionId(null);
  };

  // Create new game session with betting
  const createGameSession = useCallback(async () => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert([{
          game_type: 'mancala',
          player1_id: userId,
          mode,
          stake_amount: stakeAmount,
          game_state: MancalaEngine.createInitialState(variant) as any,
          status: 'active',
        }])
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
      return data.id;
    } catch (error) {
      console.error('Error creating game session:', error);
      return null;
    }
  }, [userId, mode, stakeAmount, variant]);

  return {
    gameState,
    handlePitClick,
    isProcessing,
    resetGame,
    createGameSession,
    sessionId,
    betting,
  };
};
