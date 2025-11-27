// Mancala (Oware) Game Engine
// Traditional African seed-sowing game

export type Player = 'player1' | 'player2';
export type Variant = 'Oware' | 'Kalah' | 'Bao';

export interface GameState {
  board: number[]; // 14 positions: [player1 pits (0-5), player1 store (6), player2 pits (7-12), player2 store (13)]
  currentPlayer: Player;
  selectedPit: number | null;
  validMoves: number[];
  gameOver: boolean;
  winner: Player | null;
  player1Seeds: number; // Seeds in player1's store
  player2Seeds: number; // Seeds in player2's store
  captureHistory: { player: Player; seeds: number; position: number }[];
  lastMove: { pit: number; seedsDistributed: number } | null;
  variant: Variant;
}

export interface Move {
  pit: number;
}

export class MancalaEngine {
  static createInitialState(variant: Variant = 'Oware'): GameState {
    // Oware: 6 pits per player with 4 seeds each
    // Kalah: 6 pits per player with 4 seeds each (similar but different rules)
    const seedsPerPit = 4;
    
    return {
      board: [
        // Player 1 pits (0-5)
        seedsPerPit, seedsPerPit, seedsPerPit, seedsPerPit, seedsPerPit, seedsPerPit,
        // Player 1 store (6)
        0,
        // Player 2 pits (7-12)
        seedsPerPit, seedsPerPit, seedsPerPit, seedsPerPit, seedsPerPit, seedsPerPit,
        // Player 2 store (13)
        0
      ],
      currentPlayer: 'player1',
      selectedPit: null,
      validMoves: [0, 1, 2, 3, 4, 5], // Player 1 starts
      gameOver: false,
      winner: null,
      player1Seeds: 0,
      player2Seeds: 0,
      captureHistory: [],
      lastMove: null,
      variant,
    };
  }

  static getValidMoves(state: GameState): number[] {
    const isPlayer1 = state.currentPlayer === 'player1';
    const startPit = isPlayer1 ? 0 : 7;
    const endPit = isPlayer1 ? 5 : 12;

    const validMoves: number[] = [];
    
    for (let pit = startPit; pit <= endPit; pit++) {
      if (state.board[pit] > 0) {
        validMoves.push(pit);
      }
    }

    return validMoves;
  }

  static makeMove(state: GameState, move: Move): GameState {
    const newState = { ...state };
    newState.board = [...state.board];
    
    const pit = move.pit;
    let seeds = newState.board[pit];
    newState.board[pit] = 0;

    // Distribute seeds counter-clockwise
    let currentPit = pit;
    const isPlayer1 = state.currentPlayer === 'player1';
    
    while (seeds > 0) {
      currentPit = (currentPit + 1) % 14;
      
      // Skip opponent's store
      if ((isPlayer1 && currentPit === 13) || (!isPlayer1 && currentPit === 6)) {
        continue;
      }
      
      newState.board[currentPit]++;
      seeds--;
    }

    newState.lastMove = { pit, seedsDistributed: state.board[pit] };

    // Oware capture rules: if last seed lands in opponent's pit with 2 or 3 total seeds
    if (state.variant === 'Oware') {
      const capturedSeeds = this.checkOwareCapture(newState, currentPit, isPlayer1);
      if (capturedSeeds > 0) {
        newState.captureHistory.push({
          player: state.currentPlayer,
          seeds: capturedSeeds,
          position: currentPit,
        });
      }
    }
    // Kalah capture rules: if last seed lands in your own empty pit, capture opposite pit
    else if (state.variant === 'Kalah') {
      const capturedSeeds = this.checkKalahCapture(newState, currentPit, isPlayer1);
      if (capturedSeeds > 0) {
        newState.captureHistory.push({
          player: state.currentPlayer,
          seeds: capturedSeeds,
          position: currentPit,
        });
      }
    }

    // Update store counts
    newState.player1Seeds = newState.board[6];
    newState.player2Seeds = newState.board[13];

    // Check for game over
    const gameOver = this.checkGameOver(newState);
    newState.gameOver = gameOver.gameOver;
    newState.winner = gameOver.winner;

    if (newState.gameOver) {
      // Collect remaining seeds
      this.collectRemainingSeeds(newState);
    } else {
      // Switch player (unless extra turn in Kalah)
      const extraTurn = state.variant === 'Kalah' && currentPit === (isPlayer1 ? 6 : 13);
      if (!extraTurn) {
        newState.currentPlayer = isPlayer1 ? 'player2' : 'player1';
      }
    }

    newState.validMoves = this.getValidMoves(newState);
    newState.selectedPit = null;

    return newState;
  }

  private static checkOwareCapture(state: GameState, lastPit: number, isPlayer1: boolean): number {
    // Capture if last seed lands in opponent's pit with 2 or 3 total seeds
    const opponentStart = isPlayer1 ? 7 : 0;
    const opponentEnd = isPlayer1 ? 12 : 5;
    
    if (lastPit < opponentStart || lastPit > opponentEnd) {
      return 0; // Last seed not in opponent's pit
    }

    const seedsInPit = state.board[lastPit];
    if (seedsInPit !== 2 && seedsInPit !== 3) {
      return 0; // Not 2 or 3 seeds
    }

    // Capture this pit and continue backward for consecutive 2s and 3s
    let totalCaptured = 0;
    let currentPit = lastPit;

    while (currentPit >= opponentStart && currentPit <= opponentEnd) {
      const seeds = state.board[currentPit];
      if (seeds === 2 || seeds === 3) {
        totalCaptured += seeds;
        state.board[currentPit] = 0;
        currentPit--;
      } else {
        break;
      }
    }

    // Add captured seeds to player's store
    if (isPlayer1) {
      state.board[6] += totalCaptured;
    } else {
      state.board[13] += totalCaptured;
    }

    return totalCaptured;
  }

  private static checkKalahCapture(state: GameState, lastPit: number, isPlayer1: boolean): number {
    // In Kalah: if last seed lands in your own empty pit, capture opposite pit
    const playerStart = isPlayer1 ? 0 : 7;
    const playerEnd = isPlayer1 ? 5 : 12;
    
    // Check if last pit is player's own pit (not store)
    if (lastPit < playerStart || lastPit > playerEnd) {
      return 0;
    }

    // Check if pit had exactly 1 seed (was empty before last seed)
    if (state.board[lastPit] !== 1) {
      return 0;
    }

    // Calculate opposite pit
    const oppositePit = 12 - lastPit;
    const oppositeSeeds = state.board[oppositePit];

    if (oppositeSeeds === 0) {
      return 0; // No seeds to capture
    }

    // Capture opposite pit and own pit
    const totalCaptured = oppositeSeeds + 1;
    state.board[oppositePit] = 0;
    state.board[lastPit] = 0;

    // Add to player's store
    if (isPlayer1) {
      state.board[6] += totalCaptured;
    } else {
      state.board[13] += totalCaptured;
    }

    return totalCaptured;
  }

  private static collectRemainingSeeds(state: GameState): void {
    // Collect player 1's remaining seeds
    for (let i = 0; i <= 5; i++) {
      state.board[6] += state.board[i];
      state.board[i] = 0;
    }

    // Collect player 2's remaining seeds
    for (let i = 7; i <= 12; i++) {
      state.board[13] += state.board[i];
      state.board[i] = 0;
    }

    state.player1Seeds = state.board[6];
    state.player2Seeds = state.board[13];
  }

  static checkGameOver(state: GameState): {
    gameOver: boolean;
    winner: Player | null;
  } {
    // Game ends when one side has no seeds
    const player1HasSeeds = state.board.slice(0, 6).some(seeds => seeds > 0);
    const player2HasSeeds = state.board.slice(7, 13).some(seeds => seeds > 0);

    if (!player1HasSeeds || !player2HasSeeds) {
      // Collect remaining seeds
      const tempState = { ...state, board: [...state.board] };
      this.collectRemainingSeeds(tempState);

      // Determine winner
      const p1Total = tempState.board[6];
      const p2Total = tempState.board[13];

      let winner: Player | null = null;
      if (p1Total > p2Total) {
        winner = 'player1';
      } else if (p2Total > p1Total) {
        winner = 'player2';
      }

      return { gameOver: true, winner };
    }

    return { gameOver: false, winner: null };
  }

  static evaluateBoard(state: GameState): number {
    // Positive score favors player2, negative favors player1
    let score = state.player2Seeds - state.player1Seeds;

    // Bonus for having more seeds on board (mobility)
    const p1BoardSeeds = state.board.slice(0, 6).reduce((a, b) => a + b, 0);
    const p2BoardSeeds = state.board.slice(7, 13).reduce((a, b) => a + b, 0);
    score += (p2BoardSeeds - p1BoardSeeds) * 0.5;

    return score;
  }

  static getBestMove(
    state: GameState,
    player: Player,
    depth: number = 3
  ): Move | null {
    let bestMove: Move | null = null;
    let bestScore = player === 'player2' ? -Infinity : Infinity;

    const validMoves = this.getValidMoves(state);

    for (const pit of validMoves) {
      const move: Move = { pit };
      const newState = this.makeMove(state, move);
      
      const score = this.minimax(newState, depth - 1, -Infinity, Infinity, player === 'player2');

      if (player === 'player2') {
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
    state: GameState,
    depth: number,
    alpha: number,
    beta: number,
    maximizing: boolean
  ): number {
    if (depth === 0 || state.gameOver) {
      return this.evaluateBoard(state);
    }

    const validMoves = this.getValidMoves(state);
    let bestScore = maximizing ? -Infinity : Infinity;

    for (const pit of validMoves) {
      const move: Move = { pit };
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

    return bestScore;
  }
}
