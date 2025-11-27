import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MorabarabaEngine, GameState, Move, Player } from '@/lib/games/morabarabaEngine';
import { toast } from '@/hooks/use-toast';

interface UseMorabarabaGameProps {
  gameId: string | null;
  mode: 'p2p' | 'human-ai' | 'ai-ai' | 'cultural';
  userId: string | null;
  stakeAmount?: number;
  difficulty?: 'Novice' | 'Skilled' | 'Expert' | 'Master';
  culturalMode?: boolean;
}

export const useMorabarabaGame = ({
  gameId,
  mode,
  userId,
  stakeAmount = 0,
  difficulty = 'Skilled',
  culturalMode = false,
}: UseMorabarabaGameProps) => {
  const [gameState, setGameState] = useState<GameState>(MorabarabaEngine.createInitialState());
  const [isProcessing, setIsProcessing] = useState(false);

  // AI difficulty mapping
  const getDifficulty = () => {
    switch (difficulty) {
      case 'Novice': return 1;
      case 'Skilled': return 2;
      case 'Expert': return 3;
      case 'Master': return 4;
      default: return 2;
    }
  };

  // Handle position click
  const handlePositionClick = useCallback(async (position: number) => {
    if (isProcessing || gameState.gameOver) return;
    setIsProcessing(true);

    try {
      let newState = { ...gameState };

      // Handle capture mode
      if (gameState.mustCapture) {
        const capturablePositions = MorabarabaEngine.getCapturablePositions(gameState);
        if (capturablePositions.includes(position)) {
          newState = MorabarabaEngine.capturePiece(gameState, position);
          setGameState(newState);

          toast({
            title: culturalMode ? 'Cow Captured! 🐄' : 'Piece Captured!',
            description: `${gameState.currentPlayer === 'red' ? 'Red' : 'Black'} captured an opponent piece`,
          });
        } else {
          toast({
            title: 'Invalid Capture',
            description: 'You must capture an opponent piece that is not in a mill',
            variant: 'destructive',
          });
          setIsProcessing(false);
          return;
        }
      }
      // Handle placement phase
      else if (gameState.phase === 'placement') {
        const currentPieces = gameState.currentPlayer === 'red' ? gameState.redPieces : gameState.blackPieces;
        const nextPieceIndex = currentPieces.findIndex(p => p === null);
        
        if (nextPieceIndex !== -1 && gameState.validMoves.includes(position)) {
          const move: Move = {
            pieceIndex: nextPieceIndex,
            from: null,
            to: position,
          };
          
          newState = MorabarabaEngine.makeMove(gameState, move);
          setGameState(newState);

          if (newState.mustCapture) {
            toast({
              title: culturalMode ? 'Kraal Formed! 🐄' : 'Mill Formed!',
              description: 'Select an opponent piece to capture',
            });
          }
        } else {
          setIsProcessing(false);
          return;
        }
      }
      // Handle movement/flying phase
      else {
        // Select piece
        if (gameState.selectedPiece === null) {
          const currentPieces = gameState.currentPlayer === 'red' ? gameState.redPieces : gameState.blackPieces;
          const pieceIndex = currentPieces.indexOf(position);
          
          if (pieceIndex !== -1) {
            const validMoves = MorabarabaEngine.getValidMoves(gameState, pieceIndex);
            setGameState({
              ...gameState,
              selectedPiece: pieceIndex,
              validMoves,
            });
          }
          setIsProcessing(false);
          return;
        }
        // Move selected piece
        else {
          if (gameState.validMoves.includes(position)) {
            const currentPieces = gameState.currentPlayer === 'red' ? gameState.redPieces : gameState.blackPieces;
            const from = currentPieces[gameState.selectedPiece];
            
            const move: Move = {
              pieceIndex: gameState.selectedPiece,
              from,
              to: position,
            };
            
            newState = MorabarabaEngine.makeMove(gameState, move);
            setGameState(newState);

            if (newState.mustCapture) {
              toast({
                title: culturalMode ? 'Kraal Formed! 🐄' : 'Mill Formed!',
                description: 'Select an opponent piece to capture',
              });
            }
          } else {
            // Deselect if clicked invalid position
            const emptyArray: number[] = [];
            setGameState({
              ...gameState,
              selectedPiece: null,
              validMoves: emptyArray,
            });
            setIsProcessing(false);
            return;
          }
        }
      }

      // Update in Supabase if P2P mode
      if (mode === 'p2p' && gameId) {
        await supabase.rpc('update_game_state', {
          p_session_id: gameId,
          p_game_state: newState as any,
          p_current_player: newState.currentPlayer,
          p_winner: newState.winner,
        });
      }

      // Check for game over
      if (newState.gameOver) {
        toast({
          title: 'Game Over!',
          description: `${newState.winner === 'red' ? 'Red' : 'Black'} wins!`,
        });

        if (mode === 'p2p' && gameId) {
          await supabase.rpc('settle_game_bets', {
            p_session_id: gameId,
            p_winner: newState.winner,
          });
        }
      }

      // AI move in human-ai mode
      if (mode === 'human-ai' && !newState.gameOver && newState.currentPlayer === 'black' && !newState.mustCapture) {
        setTimeout(() => makeAIMove(newState), 500);
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
      const aiMove = MorabarabaEngine.getBestMove(currentState, 'black', depth);

      if (aiMove) {
        let newState = MorabarabaEngine.makeMove(currentState, aiMove);
        setGameState(newState);

        // Handle AI capture if mill formed
        if (newState.mustCapture) {
          const capturablePositions = MorabarabaEngine.getCapturablePositions(newState);
          if (capturablePositions.length > 0) {
            // AI captures first available piece
            setTimeout(() => {
              const captureState = MorabarabaEngine.capturePiece(newState, capturablePositions[0]);
              setGameState(captureState);

              if (captureState.gameOver) {
                toast({
                  title: 'Game Over!',
                  description: `${captureState.winner === 'red' ? 'You win!' : 'AI wins!'}`,
                });
              }
            }, 500);
          }
        }

        if (newState.gameOver) {
          toast({
            title: 'Game Over!',
            description: `${newState.winner === 'red' ? 'You win!' : 'AI wins!'}`,
          });
        }
      }
    } catch (error) {
      console.error('Error making AI move:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // AI vs AI automation
  useEffect(() => {
    if (mode === 'ai-ai' && !gameState.gameOver && !isProcessing && !gameState.mustCapture) {
      const timer = setTimeout(() => {
        const depth = 2;
        const aiMove = MorabarabaEngine.getBestMove(gameState, gameState.currentPlayer, depth);

        if (aiMove) {
          let newState = MorabarabaEngine.makeMove(gameState, aiMove);
          setGameState(newState);

          // Handle AI capture if mill formed
          if (newState.mustCapture) {
            const capturablePositions = MorabarabaEngine.getCapturablePositions(newState);
            if (capturablePositions.length > 0) {
              setTimeout(() => {
                const captureState = MorabarabaEngine.capturePiece(newState, capturablePositions[0]);
                setGameState(captureState);
              }, 500);
            }
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
    setGameState(MorabarabaEngine.createInitialState());
  };

  return {
    gameState,
    handlePositionClick,
    isProcessing,
    resetGame,
  };
};
