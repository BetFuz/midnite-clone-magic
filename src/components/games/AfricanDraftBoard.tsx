import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

export type PieceType = 'red' | 'black' | 'red-king' | 'black-king' | null;

export interface Position {
  row: number;
  col: number;
}

export interface GameMove {
  from: Position;
  to: Position;
  captured?: Position;
}

export interface BoardState {
  pieces: PieceType[][];
  currentPlayer: 'red' | 'black';
  selectedPosition: Position | null;
  validMoves: Position[];
  gameOver: boolean;
  winner: 'red' | 'black' | 'draw' | null;
}

interface AfricanDraftBoardProps {
  boardState: BoardState;
  onMove: (move: GameMove) => void;
  disabled?: boolean;
}

export default function AfricanDraftBoard({ boardState, onMove, disabled }: AfricanDraftBoardProps) {
  const { pieces, currentPlayer, selectedPosition, validMoves } = boardState;

  const handleSquareClick = (row: number, col: number) => {
    if (disabled) return;

    const piece = pieces[row][col];
    
    // If a piece is already selected
    if (selectedPosition) {
      // Check if this is a valid move
      const isValidMove = validMoves.some(
        move => move.row === row && move.col === col
      );

      if (isValidMove) {
        // Make the move
        onMove({
          from: selectedPosition,
          to: { row, col }
        });
      }
    } else {
      // Select piece if it belongs to current player
      if (piece && piece.startsWith(currentPlayer)) {
        onMove({
          from: { row, col },
          to: { row, col } // This signals piece selection
        });
      }
    }
  };

  const isValidMoveSquare = (row: number, col: number) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const isSelected = (row: number, col: number) => {
    return selectedPosition?.row === row && selectedPosition?.col === col;
  };

  const isDarkSquare = (row: number, col: number) => {
    return (row + col) % 2 === 1;
  };

  const renderPiece = (piece: PieceType) => {
    if (!piece) return null;

    const isRed = piece.startsWith('red');
    const isKing = piece.includes('king');

    return (
      <div
        className={cn(
          "w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all",
          "shadow-lg hover:scale-110 cursor-pointer",
          isRed
            ? "bg-red-500 border-red-700"
            : "bg-slate-800 border-slate-950"
        )}
      >
        {isKing && <Crown className="h-5 w-5 text-amber-300" />}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-4 py-2 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-950" />
          <span className="text-sm font-medium">Black</span>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-sm font-bold",
          currentPlayer === 'black' ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {currentPlayer === 'black' ? 'Your Turn' : 'Waiting'}
        </div>
      </div>

      <div className="bg-amber-900 p-4 rounded-lg shadow-2xl">
        <div className="grid grid-cols-8 gap-0 border-4 border-amber-950">
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 8 }, (_, col) => {
              const piece = pieces[row][col];
              const isValid = isValidMoveSquare(row, col);
              const selected = isSelected(row, col);
              const dark = isDarkSquare(row, col);

              return (
                <div
                  key={`${row}-${col}`}
                  onClick={() => handleSquareClick(row, col)}
                  className={cn(
                    "aspect-square flex items-center justify-center relative",
                    "transition-all duration-200",
                    dark ? "bg-amber-800" : "bg-amber-100",
                    !disabled && "hover:brightness-110 cursor-pointer",
                    selected && "ring-4 ring-primary ring-inset",
                    isValid && "ring-4 ring-green-500 ring-inset animate-pulse"
                  )}
                >
                  {piece && renderPiece(piece)}
                  {isValid && !piece && (
                    <div className="w-4 h-4 rounded-full bg-green-500/50 animate-pulse" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex justify-between items-center px-4 py-2 bg-muted/50 rounded-lg">
        <div className={cn(
          "px-3 py-1 rounded-full text-sm font-bold",
          currentPlayer === 'red' ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {currentPlayer === 'red' ? 'Your Turn' : 'Waiting'}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Red</span>
          <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-700" />
        </div>
      </div>
    </div>
  );
}