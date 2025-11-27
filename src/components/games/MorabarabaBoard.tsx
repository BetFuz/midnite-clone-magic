import React from 'react';
import { cn } from '@/lib/utils';
import { Player, GameState, MorabarabaEngine } from '@/lib/games/morabarabaEngine';
import { Crown } from 'lucide-react';

interface MorabarabaBoardProps {
  gameState: GameState;
  onPositionClick: (position: number) => void;
  culturalMode?: boolean;
}

export const MorabarabaBoard: React.FC<MorabarabaBoardProps> = ({
  gameState,
  onPositionClick,
  culturalMode = false,
}) => {
  const positions = MorabarabaEngine.getPositions();
  const boardSize = 400; // Size in pixels
  const scale = boardSize / 7; // Scale factor for positioning

  // Get piece at position
  const getPieceAt = (position: number): { player: Player; index: number } | null => {
    const redIndex = gameState.redPieces.indexOf(position);
    if (redIndex !== -1) return { player: 'red', index: redIndex };
    
    const blackIndex = gameState.blackPieces.indexOf(position);
    if (blackIndex !== -1) return { player: 'black', index: blackIndex };
    
    return null;
  };

  // Check if position is valid move
  const isValidMove = (position: number): boolean => {
    return gameState.validMoves.includes(position);
  };

  // Check if position is capturable
  const isCapturable = (position: number): boolean => {
    if (!gameState.mustCapture) return false;
    const capturablePositions = MorabarabaEngine.getCapturablePositions(gameState);
    return capturablePositions.includes(position);
  };

  // Check if position is in a mill
  const isInMill = (position: number): boolean => {
    return gameState.mills.some(mill => mill.includes(position));
  };

  return (
    <div className="relative" style={{ width: boardSize, height: boardSize }}>
      {/* Board background */}
      <svg
        width={boardSize}
        height={boardSize}
        className="absolute inset-0"
        viewBox="0 0 7 7"
      >
        {/* Outer square */}
        <rect x="0" y="0" width="7" height="7" fill="none" stroke="hsl(var(--border))" strokeWidth="0.08" />
        {/* Middle square */}
        <rect x="1" y="1" width="5" height="5" fill="none" stroke="hsl(var(--border))" strokeWidth="0.08" />
        {/* Inner square */}
        <rect x="2" y="2" width="3" height="3" fill="none" stroke="hsl(var(--border))" strokeWidth="0.08" />
        
        {/* Cross connections */}
        <line x1="3.5" y1="0" x2="3.5" y2="2" stroke="hsl(var(--border))" strokeWidth="0.08" />
        <line x1="3.5" y1="5" x2="3.5" y2="7" stroke="hsl(var(--border))" strokeWidth="0.08" />
        <line x1="0" y1="3.5" x2="2" y2="3.5" stroke="hsl(var(--border))" strokeWidth="0.08" />
        <line x1="5" y1="3.5" x2="7" y2="3.5" stroke="hsl(var(--border))" strokeWidth="0.08" />

        {/* Mill highlights */}
        {gameState.mills.map((mill, idx) => {
          const [p1, p2, p3] = mill;
          const pos1 = positions[p1];
          const pos2 = positions[p2];
          const pos3 = positions[p3];
          
          return (
            <g key={idx} opacity="0.3">
              <line
                x1={pos1.x + 0.5}
                y1={pos1.y + 0.5}
                x2={pos3.x + 0.5}
                y2={pos3.y + 0.5}
                stroke={gameState.currentPlayer === 'red' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
                strokeWidth="0.15"
              />
            </g>
          );
        })}
      </svg>

      {/* Positions and pieces */}
      {positions.map((pos) => {
        const piece = getPieceAt(pos.index);
        const validMove = isValidMove(pos.index);
        const capturable = isCapturable(pos.index);
        const inMill = isInMill(pos.index);

        return (
          <button
            key={pos.index}
            onClick={() => onPositionClick(pos.index)}
            disabled={gameState.gameOver}
            className={cn(
              'absolute w-12 h-12 rounded-full flex items-center justify-center transition-all',
              'transform -translate-x-1/2 -translate-y-1/2',
              !piece && !validMove && 'bg-muted/20 hover:bg-muted/40',
              validMove && !piece && 'bg-primary/20 hover:bg-primary/40 ring-2 ring-primary animate-pulse',
              capturable && 'ring-4 ring-destructive animate-pulse',
              inMill && 'ring-2 ring-amber-500',
              piece && !capturable && 'cursor-default',
              gameState.gameOver && 'cursor-not-allowed opacity-50'
            )}
            style={{
              left: `${(pos.x / 7) * 100}%`,
              top: `${(pos.y / 7) * 100}%`,
            }}
          >
            {piece && (
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center shadow-lg',
                  'border-2 transition-all',
                  piece.player === 'red'
                    ? 'bg-destructive border-destructive-foreground'
                    : 'bg-primary border-primary-foreground',
                  gameState.selectedPiece === piece.index && 'ring-4 ring-accent scale-110',
                  culturalMode && 'relative'
                )}
              >
                {culturalMode ? (
                  <span className="text-2xl">🐄</span>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-current opacity-90" />
                )}
                {inMill && (
                  <Crown className="absolute -top-1 -right-1 h-4 w-4 text-amber-500" />
                )}
              </div>
            )}
            {!piece && validMove && (
              <div className="w-4 h-4 rounded-full bg-primary/50" />
            )}
          </button>
        );
      })}

      {/* Game phase indicator */}
      <div className="absolute -bottom-8 left-0 right-0 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          {gameState.phase === 'placement' && 'Placement Phase'}
          {gameState.phase === 'movement' && 'Movement Phase'}
          {gameState.phase === 'flying' && 'Flying Phase'}
        </p>
      </div>
    </div>
  );
};
