import React from 'react';
import { cn } from '@/lib/utils';
import { Player, GameState } from '@/lib/games/mancalaEngine';
import { Sprout } from 'lucide-react';

interface MancalaBoardProps {
  gameState: GameState;
  onPitClick: (pit: number) => void;
  culturalMode?: boolean;
}

export const MancalaBoard: React.FC<MancalaBoardProps> = ({
  gameState,
  onPitClick,
  culturalMode = false,
}) => {
  const isValidMove = (pit: number): boolean => {
    return gameState.validMoves.includes(pit);
  };

  const renderSeeds = (count: number, pitSize: 'small' | 'large' = 'small') => {
    if (culturalMode) {
      // Show seed emoji representations
      const maxVisible = pitSize === 'large' ? 12 : 8;
      const visibleSeeds = Math.min(count, maxVisible);
      
      return (
        <div className="flex flex-wrap gap-0.5 items-center justify-center">
          {Array.from({ length: visibleSeeds }).map((_, i) => (
            <span key={i} className="text-xs">🌱</span>
          ))}
          {count > maxVisible && (
            <span className="text-xs font-bold ml-1">+{count - maxVisible}</span>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-1">
        <Sprout className="h-4 w-4 text-primary" />
        <span className="text-lg font-bold">{count}</span>
      </div>
    );
  };

  const renderPit = (pit: number, size: 'small' | 'large' = 'small') => {
    const seeds = gameState.board[pit];
    const validMove = isValidMove(pit);
    const isStore = pit === 6 || pit === 13;
    const isPlayer1Pit = pit >= 0 && pit <= 6;

    return (
      <button
        key={pit}
        onClick={() => onPitClick(pit)}
        disabled={gameState.gameOver || !validMove}
        className={cn(
          'relative rounded-lg transition-all',
          'border-2 flex items-center justify-center',
          size === 'large' ? 'h-32 w-20' : 'h-20 w-20',
          isStore && 'rounded-xl',
          isPlayer1Pit ? 'bg-destructive/10 border-destructive/30' : 'bg-primary/10 border-primary/30',
          validMove && !isStore && 'ring-2 ring-accent hover:ring-4 cursor-pointer hover:scale-105',
          !validMove && !isStore && 'opacity-50 cursor-not-allowed',
          gameState.lastMove?.pit === pit && 'ring-4 ring-amber-500',
          gameState.gameOver && 'cursor-not-allowed'
        )}
      >
        {renderSeeds(seeds, size)}
        {!isStore && (
          <span className="absolute -top-2 -left-2 text-xs bg-muted px-1.5 py-0.5 rounded-full font-medium">
            {pit < 7 ? pit + 1 : pit - 6}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-muted/20 rounded-xl">
      {/* Player 2 side (top) - pits 7-12 */}
      <div className="flex items-center gap-3">
        {/* Player 2 store (right side from their perspective) */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-primary">P2 Store</span>
          {renderPit(13, 'large')}
        </div>

        {/* Player 2 pits (reversed for counter-clockwise flow) */}
        <div className="flex gap-3">
          {[12, 11, 10, 9, 8, 7].map(pit => renderPit(pit))}
        </div>

        {/* Empty space for alignment */}
        <div className="w-20" />
      </div>

      {/* Direction indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>←</span>
        <span>Counter-clockwise sowing</span>
        <span>→</span>
      </div>

      {/* Player 1 side (bottom) - pits 0-5 */}
      <div className="flex items-center gap-3">
        {/* Empty space for alignment */}
        <div className="w-20" />

        {/* Player 1 pits */}
        <div className="flex gap-3">
          {[0, 1, 2, 3, 4, 5].map(pit => renderPit(pit))}
        </div>

        {/* Player 1 store (right side from their perspective) */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-destructive">P1 Store</span>
          {renderPit(6, 'large')}
        </div>
      </div>

      {/* Game info */}
      <div className="flex items-center justify-between w-full mt-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="font-medium">Player 1: {gameState.player1Seeds} seeds</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="font-medium">Player 2: {gameState.player2Seeds} seeds</span>
        </div>
      </div>

      {/* Last move indicator */}
      {gameState.lastMove && (
        <div className="text-xs text-muted-foreground text-center">
          Last move: Pit {gameState.lastMove.pit < 7 ? gameState.lastMove.pit + 1 : gameState.lastMove.pit - 6} 
          ({gameState.lastMove.seedsDistributed} seeds distributed)
        </div>
      )}
    </div>
  );
};
