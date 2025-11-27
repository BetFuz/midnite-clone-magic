// Morabaraba (Twelve Men's Morris) Game Engine
// Traditional Southern African strategy game

export type Player = 'red' | 'black';
export type PiecePosition = number | null; // 0-23 are board positions, null means not placed
export type GamePhase = 'placement' | 'movement' | 'flying';

export interface Position {
  index: number;
  x: number;
  y: number;
  connections: number[]; // Adjacent positions
}

export interface GameState {
  redPieces: PiecePosition[]; // 12 pieces
  blackPieces: PiecePosition[]; // 12 pieces
  currentPlayer: Player;
  phase: GamePhase;
  selectedPiece: number | null; // Index in pieces array
  validMoves: number[]; // Valid board positions
  mills: number[][]; // Formed mills
  gameOver: boolean;
  winner: Player | null;
  redPiecesOnBoard: number;
  blackPiecesOnBoard: number;
  redPiecesRemaining: number;
  blackPiecesRemaining: number;
  mustCapture: boolean;
  captureHistory: { player: Player; position: number }[];
}

export interface Move {
  pieceIndex: number;
  from: number | null;
  to: number;
}

// Board positions (24 positions in concentric squares)
// Layout: 3 concentric squares, each with 8 positions
const BOARD_POSITIONS: Position[] = [
  // Outer square (0-7)
  { index: 0, x: 0, y: 0, connections: [1, 9] },
  { index: 1, x: 3, y: 0, connections: [0, 2, 4] },
  { index: 2, x: 6, y: 0, connections: [1, 14] },
  { index: 3, x: 6, y: 3, connections: [2, 4, 7] },
  { index: 4, x: 6, y: 6, connections: [3, 5] },
  { index: 5, x: 3, y: 6, connections: [4, 6, 7] },
  { index: 6, x: 0, y: 6, connections: [5, 11] },
  { index: 7, x: 0, y: 3, connections: [0, 6, 9] },
  
  // Middle square (8-15)
  { index: 8, x: 1, y: 1, connections: [9, 16] },
  { index: 9, x: 3, y: 1, connections: [8, 10, 1] },
  { index: 10, x: 5, y: 1, connections: [9, 18] },
  { index: 11, x: 5, y: 3, connections: [10, 12, 3] },
  { index: 12, x: 5, y: 5, connections: [11, 13] },
  { index: 13, x: 3, y: 5, connections: [12, 14, 5] },
  { index: 14, x: 1, y: 5, connections: [13, 22] },
  { index: 15, x: 1, y: 3, connections: [8, 14, 7] },
  
  // Inner square (16-23)
  { index: 16, x: 2, y: 2, connections: [17, 8] },
  { index: 17, x: 3, y: 2, connections: [16, 18, 9] },
  { index: 18, x: 4, y: 2, connections: [17, 10] },
  { index: 19, x: 4, y: 3, connections: [18, 20, 11] },
  { index: 20, x: 4, y: 4, connections: [19, 21] },
  { index: 21, x: 3, y: 4, connections: [20, 22, 13] },
  { index: 22, x: 2, y: 4, connections: [21, 14] },
  { index: 23, x: 2, y: 3, connections: [16, 22, 15] },
];

// All possible mills (three in a row)
const MILL_PATTERNS = [
  // Outer square
  [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0],
  // Middle square
  [8, 9, 10], [10, 11, 12], [12, 13, 14], [14, 15, 8],
  // Inner square
  [16, 17, 18], [18, 19, 20], [20, 21, 22], [22, 23, 16],
  // Cross connections
  [1, 9, 17], [3, 11, 19], [5, 13, 21], [7, 15, 23],
];

export class MorabarabaEngine {
  static createInitialState(): GameState {
    return {
      redPieces: Array(12).fill(null),
      blackPieces: Array(12).fill(null),
      currentPlayer: 'red',
      phase: 'placement',
      selectedPiece: null,
      validMoves: Array.from({ length: 24 }, (_, i) => i), // All positions valid initially
      mills: [],
      gameOver: false,
      winner: null,
      redPiecesOnBoard: 0,
      blackPiecesOnBoard: 0,
      redPiecesRemaining: 12,
      blackPiecesRemaining: 12,
      mustCapture: false,
      captureHistory: [],
    };
  }

  static getPositions(): Position[] {
    return BOARD_POSITIONS;
  }

  static getValidMoves(state: GameState, pieceIndex?: number): number[] {
    const currentPieces = state.currentPlayer === 'red' ? state.redPieces : state.blackPieces;
    
    // Placement phase: any empty position
    if (state.phase === 'placement') {
      const occupied = [...state.redPieces, ...state.blackPieces]
        .filter(p => p !== null) as number[];
      return Array.from({ length: 24 }, (_, i) => i)
        .filter(i => !occupied.includes(i));
    }

    // Movement/Flying phase: need selected piece
    if (pieceIndex === undefined || pieceIndex === null) return [];

    const fromPosition = currentPieces[pieceIndex];
    if (fromPosition === null) return [];

    const occupied = [...state.redPieces, ...state.blackPieces]
      .filter(p => p !== null) as number[];

    // Flying phase: can move to any empty position
    if (state.phase === 'flying') {
      return Array.from({ length: 24 }, (_, i) => i)
        .filter(i => !occupied.includes(i));
    }

    // Movement phase: only adjacent positions
    const position = BOARD_POSITIONS[fromPosition];
    return position.connections.filter(c => !occupied.includes(c));
  }

  static checkMill(state: GameState, position: number, player: Player): boolean {
    const playerPieces = player === 'red' ? state.redPieces : state.blackPieces;
    const occupiedPositions = playerPieces.filter(p => p !== null) as number[];

    return MILL_PATTERNS.some(pattern => 
      pattern.includes(position) && 
      pattern.every(p => occupiedPositions.includes(p))
    );
  }

  static getAllMills(state: GameState, player: Player): number[][] {
    const playerPieces = player === 'red' ? state.redPieces : state.blackPieces;
    const occupiedPositions = playerPieces.filter(p => p !== null) as number[];

    return MILL_PATTERNS.filter(pattern => 
      pattern.every(p => occupiedPositions.includes(p))
    );
  }

  static makeMove(state: GameState, move: Move): GameState {
    const newState = { ...state };
    const isRed = state.currentPlayer === 'red';
    const currentPieces = isRed ? [...state.redPieces] : [...state.blackPieces];
    
    // Update piece position
    currentPieces[move.pieceIndex] = move.to;
    
    if (isRed) {
      newState.redPieces = currentPieces;
      if (move.from === null) newState.redPiecesOnBoard++;
    } else {
      newState.blackPieces = currentPieces;
      if (move.from === null) newState.blackPiecesOnBoard++;
    }

    // Check if mill formed
    const millFormed = this.checkMill(newState, move.to, state.currentPlayer);
    
    if (millFormed) {
      newState.mustCapture = true;
      newState.mills = this.getAllMills(newState, state.currentPlayer);
    } else {
      // Switch player if no mill
      newState.currentPlayer = isRed ? 'black' : 'red';
      newState.mustCapture = false;
      newState.selectedPiece = null;
    }

    // Update phase
    if (state.phase === 'placement') {
      const allPlaced = newState.redPiecesOnBoard === 12 && newState.blackPiecesOnBoard === 12;
      if (allPlaced) {
        newState.phase = 'movement';
      }
    } else if (state.phase === 'movement') {
      const piecesCount = isRed ? newState.redPiecesRemaining : newState.blackPiecesRemaining;
      if (piecesCount === 3) {
        newState.phase = 'flying';
      }
    }

    // Check game over
    const gameOver = this.checkGameOver(newState);
    newState.gameOver = gameOver.gameOver;
    newState.winner = gameOver.winner;

    return newState;
  }

  static capturePiece(state: GameState, position: number): GameState {
    const newState = { ...state };
    const opponentPieces = state.currentPlayer === 'red' ? [...state.blackPieces] : [...state.redPieces];
    
    // Find and remove the piece
    const pieceIndex = opponentPieces.findIndex(p => p === position);
    if (pieceIndex !== -1) {
      opponentPieces[pieceIndex] = null;
      
      if (state.currentPlayer === 'red') {
        newState.blackPieces = opponentPieces;
        newState.blackPiecesRemaining--;
      } else {
        newState.redPieces = opponentPieces;
        newState.redPiecesRemaining--;
      }

      newState.captureHistory.push({ player: state.currentPlayer, position });
    }

    // Switch player after capture
    newState.currentPlayer = state.currentPlayer === 'red' ? 'black' : 'red';
    newState.mustCapture = false;
    newState.selectedPiece = null;

    // Check game over
    const gameOver = this.checkGameOver(newState);
    newState.gameOver = gameOver.gameOver;
    newState.winner = gameOver.winner;

    return newState;
  }

  static getCapturablePositions(state: GameState): number[] {
    const opponentPlayer = state.currentPlayer === 'red' ? 'black' : 'red';
    const opponentPieces = opponentPlayer === 'red' ? state.redPieces : state.blackPieces;
    const opponentPositions = opponentPieces.filter(p => p !== null) as number[];

    // Check if opponent has pieces not in mills
    const piecesNotInMills = opponentPositions.filter(pos => 
      !this.checkMill(state, pos, opponentPlayer)
    );

    // If opponent has pieces not in mills, only those can be captured
    if (piecesNotInMills.length > 0) {
      return piecesNotInMills;
    }

    // Otherwise, any opponent piece can be captured
    return opponentPositions;
  }

  static checkGameOver(state: GameState): {
    gameOver: boolean;
    winner: Player | null;
  } {
    // Win by reducing opponent to 2 pieces
    if (state.redPiecesRemaining < 3 && state.phase !== 'placement') {
      return { gameOver: true, winner: 'black' };
    }
    if (state.blackPiecesRemaining < 3 && state.phase !== 'placement') {
      return { gameOver: true, winner: 'red' };
    }

    // Win by blocking all opponent moves (only in movement phase)
    if (state.phase === 'movement' || state.phase === 'flying') {
      const hasValidMoves = this.hasAnyValidMoves(state, state.currentPlayer);
      if (!hasValidMoves) {
        return { 
          gameOver: true, 
          winner: state.currentPlayer === 'red' ? 'black' : 'red' 
        };
      }
    }

    return { gameOver: false, winner: null };
  }

  static hasAnyValidMoves(state: GameState, player: Player): boolean {
    const playerPieces = player === 'red' ? state.redPieces : state.blackPieces;
    
    for (let i = 0; i < playerPieces.length; i++) {
      if (playerPieces[i] !== null) {
        const moves = this.getValidMoves(state, i);
        if (moves.length > 0) return true;
      }
    }
    
    return false;
  }

  static evaluateBoard(state: GameState): number {
    let score = 0;

    // Piece count advantage
    score += (state.blackPiecesRemaining - state.redPiecesRemaining) * 10;

    // Mills advantage
    const blackMills = this.getAllMills(state, 'black').length;
    const redMills = this.getAllMills(state, 'red').length;
    score += (blackMills - redMills) * 5;

    // Mobility advantage
    const blackMobility = this.countMobility(state, 'black');
    const redMobility = this.countMobility(state, 'red');
    score += (blackMobility - redMobility) * 2;

    return score;
  }

  static countMobility(state: GameState, player: Player): number {
    const playerPieces = player === 'red' ? state.redPieces : state.blackPieces;
    let mobility = 0;

    for (let i = 0; i < playerPieces.length; i++) {
      if (playerPieces[i] !== null) {
        mobility += this.getValidMoves(state, i).length;
      }
    }

    return mobility;
  }

  static getBestMove(
    state: GameState,
    player: Player,
    depth: number = 3
  ): Move | null {
    let bestMove: Move | null = null;
    let bestScore = player === 'black' ? -Infinity : Infinity;

    const playerPieces = player === 'red' ? state.redPieces : state.blackPieces;
    
    // Get all possible moves
    for (let i = 0; i < playerPieces.length; i++) {
      const from = playerPieces[i];
      
      // Skip if piece already placed in placement phase
      if (state.phase === 'placement' && from !== null) continue;
      // Skip if piece not on board in movement/flying phase
      if (state.phase !== 'placement' && from === null) continue;

      const validMoves = this.getValidMoves(state, i);
      
      for (const to of validMoves) {
        const move: Move = { pieceIndex: i, from, to };
        const newState = this.makeMove(state, move);
        
        const score = this.minimax(
          newState,
          depth - 1,
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
    }

    return bestMove;
  }

  static minimax(
    state: GameState,
    depth: number,
    alpha: number,
    beta: number,
    maximizing: boolean
  ): number {
    if (depth === 0 || state.gameOver) {
      return this.evaluateBoard(state);
    }

    const player = state.currentPlayer;
    const playerPieces = player === 'red' ? state.redPieces : state.blackPieces;
    let bestScore = maximizing ? -Infinity : Infinity;

    for (let i = 0; i < playerPieces.length; i++) {
      const from = playerPieces[i];
      
      if (state.phase === 'placement' && from !== null) continue;
      if (state.phase !== 'placement' && from === null) continue;

      const validMoves = this.getValidMoves(state, i);
      
      for (const to of validMoves) {
        const move: Move = { pieceIndex: i, from, to };
        const newState = this.makeMove(state, move);
        
        const score = this.minimax(newState, depth - 1, alpha, beta, !maximizing);

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

    return bestScore;
  }
}
