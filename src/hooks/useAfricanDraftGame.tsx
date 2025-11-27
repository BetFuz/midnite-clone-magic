import { useState, useCallback, useEffect } from 'react';
import { BoardState, GameMove } from '@/components/games/AfricanDraftBoard';
import { AfricanDraftEngine } from '@/lib/games/africanDraftEngine';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type GameMode = 'p2p' | 'human-ai' | 'ai-ai' | 'cultural';

interface UseAfricanDraftGameProps {
  mode: GameMode;
  sessionId?: string;
  aiDifficulty?: 'beginner' | 'intermediate' | 'advanced' | 'master';
}

export const useAfricanDraftGame = ({ 
  mode, 
  sessionId,
  aiDifficulty = 'intermediate' 
}: UseAfricanDraftGameProps) => {
  const [boardState, setBoardState] = useState<BoardState>(
    AfricanDraftEngine.createInitialState()
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Get AI difficulty depth
  const getAIDepth = () => {
    switch (aiDifficulty) {
      case 'beginner': return 1;
      case 'intermediate': return 3;
      case 'advanced': return 5;
      case 'master': return 7;
      default: return 3;
    }
  };

  // Make AI move
  const makeAIMove = useCallback(async () => {
    if (boardState.gameOver || isProcessing) return;

    setIsProcessing(true);

    try {
      const aiMove = AfricanDraftEngine.getBestMove(
        boardState.pieces,
        boardState.currentPlayer,
        getAIDepth()
      );

      if (aiMove) {
        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { newBoard, captured } = AfricanDraftEngine.makeMove(
          boardState.pieces,
          aiMove
        );

        const nextPlayer = boardState.currentPlayer === 'red' ? 'black' : 'red';
        const gameStatus = AfricanDraftEngine.checkGameOver(newBoard, nextPlayer);

        setBoardState({
          pieces: newBoard,
          currentPlayer: nextPlayer,
          selectedPosition: null,
          validMoves: [],
          gameOver: gameStatus.gameOver,
          winner: gameStatus.winner
        });

        if (captured) {
          toast({
            title: 'AI Captured!',
            description: `AI captured your piece`,
          });
        }

        if (gameStatus.gameOver) {
          toast({
            title: 'Game Over',
            description: `${gameStatus.winner} wins!`,
          });
        }
      }
    } catch (error) {
      console.error('AI move error:', error);
      toast({
        title: 'Error',
        description: 'AI failed to make a move',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [boardState, isProcessing, aiDifficulty]);

  // Handle move
  const handleMove = useCallback(async (move: GameMove) => {
    if (isProcessing) return;

    // If selecting a piece
    if (move.from.row === move.to.row && move.from.col === move.to.col) {
      const piece = boardState.pieces[move.from.row][move.from.col];
      if (piece && piece.startsWith(boardState.currentPlayer)) {
        const validMoves = AfricanDraftEngine.getValidMoves(
          boardState.pieces,
          move.from,
          piece
        );

        setBoardState(prev => ({
          ...prev,
          selectedPosition: move.from,
          validMoves
        }));
      }
      return;
    }

    // Making a move
    const { newBoard, captured } = AfricanDraftEngine.makeMove(
      boardState.pieces,
      move
    );

    const nextPlayer = boardState.currentPlayer === 'red' ? 'black' : 'red';
    const gameStatus = AfricanDraftEngine.checkGameOver(newBoard, nextPlayer);

    setBoardState({
      pieces: newBoard,
      currentPlayer: nextPlayer,
      selectedPosition: null,
      validMoves: [],
      gameOver: gameStatus.gameOver,
      winner: gameStatus.winner
    });

    if (captured) {
      toast({
        title: 'Captured!',
        description: `You captured opponent's piece`,
      });
    }

    if (gameStatus.gameOver) {
      toast({
        title: 'Game Over!',
        description: `${gameStatus.winner} wins!`,
      });

      // Save game result if session exists
      if (sessionId) {
        await supabase.rpc('update_game_state', {
          p_session_id: sessionId,
          p_game_state: { board: newBoard },
          p_current_player: nextPlayer,
          p_winner: gameStatus.winner
        });
      }
    }

    // If human vs AI mode and it's AI's turn
    if (mode === 'human-ai' && !gameStatus.gameOver && nextPlayer === 'black') {
      setTimeout(() => makeAIMove(), 1000);
    }
  }, [boardState, isProcessing, mode, sessionId, makeAIMove]);

  // Auto-play AI vs AI mode
  useEffect(() => {
    if (mode === 'ai-ai' && !boardState.gameOver && !isProcessing) {
      const timer = setTimeout(() => makeAIMove(), 1500);
      return () => clearTimeout(timer);
    }
  }, [mode, boardState.gameOver, boardState.currentPlayer, isProcessing, makeAIMove]);

  // Real-time sync for P2P mode
  useEffect(() => {
    if (mode !== 'p2p' || !sessionId) return;

    const channel = supabase
      .channel(`game:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload: any) => {
          const newState = payload.new.game_state;
          if (newState?.board) {
            setBoardState(prev => ({
              ...prev,
              pieces: newState.board,
              currentPlayer: payload.new.current_player
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mode, sessionId]);

  const resetGame = () => {
    setBoardState(AfricanDraftEngine.createInitialState());
  };

  return {
    boardState,
    handleMove,
    resetGame,
    isProcessing
  };
};