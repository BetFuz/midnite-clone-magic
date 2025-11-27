import { PieceType, Position, GameMove, BoardState } from '@/components/games/AfricanDraftBoard';

export class AfricanDraftEngine {
  static initializeBoard(): PieceType[][] {
    const board: PieceType[][] = Array(8).fill(null).map(() => Array(8).fill(null));

    // Place black pieces (top)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = 'black';
        }
      }
    }

    // Place red pieces (bottom)
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = 'red';
        }
      }
    }

    return board;
  }

  static createInitialState(): BoardState {
    return {
      pieces: this.initializeBoard(),
      currentPlayer: 'red',
      selectedPosition: null,
      validMoves: [],
      gameOver: false,
      winner: null
    };
  }

  static getValidMoves(
    board: PieceType[][],
    position: Position,
    piece: PieceType
  ): Position[] {
    if (!piece) return [];

    const moves: Position[] = [];
    const { row, col } = position;
    const isKing = piece.includes('king');
    const isRed = piece.startsWith('red');

    // Direction multipliers
    const directions = isKing
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] // Kings move in all directions
      : isRed
      ? [[-1, -1], [-1, 1]] // Red moves up
      : [[1, -1], [1, 1]]; // Black moves down

    // Check normal moves
    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;

      if (this.isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
        moves.push({ row: newRow, col: newCol });
      }
    }

    // Check jump moves (captures)
    const jumpMoves = this.getJumpMoves(board, position, piece);
    moves.push(...jumpMoves);

    return moves;
  }

  static getJumpMoves(
    board: PieceType[][],
    position: Position,
    piece: PieceType
  ): Position[] {
    const moves: Position[] = [];
    const { row, col } = position;
    const isKing = piece.includes('king');
    const isRed = piece.startsWith('red');

    const directions = isKing
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : isRed
      ? [[-1, -1], [-1, 1]]
      : [[1, -1], [1, 1]];

    for (const [dRow, dCol] of directions) {
      const jumpRow = row + dRow;
      const jumpCol = col + dCol;
      const landRow = row + dRow * 2;
      const landCol = col + dCol * 2;

      if (
        this.isValidPosition(jumpRow, jumpCol) &&
        this.isValidPosition(landRow, landCol)
      ) {
        const jumpPiece = board[jumpRow][jumpCol];
        const landPiece = board[landRow][landCol];

        // Can jump over opponent piece to empty square
        if (
          jumpPiece &&
          !landPiece &&
          this.isOpponentPiece(piece, jumpPiece)
        ) {
          moves.push({ row: landRow, col: landCol });
        }
      }
    }

    return moves;
  }

  static isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  static isOpponentPiece(piece1: PieceType, piece2: PieceType): boolean {
    if (!piece1 || !piece2) return false;
    return (
      (piece1.startsWith('red') && piece2.startsWith('black')) ||
      (piece1.startsWith('black') && piece2.startsWith('red'))
    );
  }

  static makeMove(
    board: PieceType[][],
    move: GameMove
  ): { newBoard: PieceType[][]; captured?: Position } {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[move.from.row][move.from.col];

    // Move piece
    newBoard[move.to.row][move.to.col] = piece;
    newBoard[move.from.row][move.from.col] = null;

    // Check for capture (jump)
    const rowDiff = Math.abs(move.to.row - move.from.row);
    const colDiff = Math.abs(move.to.col - move.from.col);
    
    let captured: Position | undefined;
    if (rowDiff === 2 && colDiff === 2) {
      const capturedRow = (move.from.row + move.to.row) / 2;
      const capturedCol = (move.from.col + move.to.col) / 2;
      newBoard[capturedRow][capturedCol] = null;
      captured = { row: capturedRow, col: capturedCol };
    }

    // Promote to king if reached opposite end
    if (piece === 'red' && move.to.row === 0) {
      newBoard[move.to.row][move.to.col] = 'red-king';
    } else if (piece === 'black' && move.to.row === 7) {
      newBoard[move.to.row][move.to.col] = 'black-king';
    }

    return { newBoard, captured };
  }

  static checkGameOver(board: PieceType[][], currentPlayer: 'red' | 'black'): {
    gameOver: boolean;
    winner: 'red' | 'black' | 'draw' | null;
  } {
    // Count pieces
    let redPieces = 0;
    let blackPieces = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece?.startsWith('red')) redPieces++;
        if (piece?.startsWith('black')) blackPieces++;
      }
    }

    // Check for no pieces
    if (redPieces === 0) {
      return { gameOver: true, winner: 'black' };
    }
    if (blackPieces === 0) {
      return { gameOver: true, winner: 'red' };
    }

    // Check for no valid moves
    const hasValidMoves = this.hasAnyValidMoves(board, currentPlayer);
    if (!hasValidMoves) {
      return { 
        gameOver: true, 
        winner: currentPlayer === 'red' ? 'black' : 'red' 
      };
    }

    return { gameOver: false, winner: null };
  }

  static hasAnyValidMoves(board: PieceType[][], player: 'red' | 'black'): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.startsWith(player)) {
          const moves = this.getValidMoves(board, { row, col }, piece);
          if (moves.length > 0) return true;
        }
      }
    }
    return false;
  }

  static evaluateBoard(board: PieceType[][]): number {
    let score = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const value = piece.includes('king') ? 3 : 1;
          const positionBonus = this.getPositionBonus(row, col, piece);
          
          if (piece.startsWith('red')) {
            score -= (value + positionBonus);
          } else {
            score += (value + positionBonus);
          }
        }
      }
    }

    return score;
  }

  static getPositionBonus(row: number, col: number, piece: PieceType): number {
    // Center control bonus
    const centerDistance = Math.abs(row - 3.5) + Math.abs(col - 3.5);
    const centerBonus = (7 - centerDistance) * 0.1;

    // Edge penalty
    const edgePenalty = (row === 0 || row === 7 || col === 0 || col === 7) ? -0.2 : 0;

    return centerBonus + edgePenalty;
  }

  static getBestMove(
    board: PieceType[][],
    player: 'red' | 'black',
    depth: number = 3
  ): GameMove | null {
    let bestMove: GameMove | null = null;
    let bestScore = player === 'black' ? -Infinity : Infinity;

    // Get all possible moves
    const allMoves: GameMove[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.startsWith(player)) {
          const validMoves = this.getValidMoves(board, { row, col }, piece);
          for (const move of validMoves) {
            allMoves.push({ from: { row, col }, to: move });
          }
        }
      }
    }

    // Evaluate each move using minimax
    for (const move of allMoves) {
      const { newBoard } = this.makeMove(board, move);
      const score = this.minimax(
        newBoard,
        depth - 1,
        player === 'red' ? 'black' : 'red',
        -Infinity,
        Infinity,
        player === 'black'
      );

      if (player === 'black') {
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }

    return bestMove;
  }

  static minimax(
    board: PieceType[][],
    depth: number,
    player: 'red' | 'black',
    alpha: number,
    beta: number,
    maximizing: boolean
  ): number {
    if (depth === 0) {
      return this.evaluateBoard(board);
    }

    const gameOver = this.checkGameOver(board, player);
    if (gameOver.gameOver) {
      if (gameOver.winner === 'black') return 1000;
      if (gameOver.winner === 'red') return -1000;
      return 0;
    }

    let bestScore = maximizing ? -Infinity : Infinity;

    // Get all possible moves
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.startsWith(player)) {
          const validMoves = this.getValidMoves(board, { row, col }, piece);
          
          for (const move of validMoves) {
            const { newBoard } = this.makeMove(board, { from: { row, col }, to: move });
            const score = this.minimax(
              newBoard,
              depth - 1,
              player === 'red' ? 'black' : 'red',
              alpha,
              beta,
              !maximizing
            );

            if (maximizing) {
              bestScore = Math.max(bestScore, score);
              alpha = Math.max(alpha, score);
            } else {
              bestScore = Math.min(bestScore, score);
              beta = Math.min(beta, score);
            }

            if (beta <= alpha) break;
          }
        }
      }
    }

    return bestScore;
  }
}