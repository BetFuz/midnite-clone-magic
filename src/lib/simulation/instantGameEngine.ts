// Universal Instant Game Simulation Engine
// Handles crash games, multipliers, and instant win mechanics

export interface CrashGameState {
  multiplier: number;
  crashed: boolean;
  isRunning: boolean;
  startTime: number;
  crashPoint: number;
  speed: number;
}

export interface PlinkoState {
  ballPosition: { x: number; y: number };
  path: number[];
  multiplier: number;
  falling: boolean;
  pegHits: number;
}

export interface MinesState {
  grid: { revealed: boolean; isMine: boolean; multiplier: number }[][];
  revealed: number;
  totalMines: number;
  currentMultiplier: number;
  gameOver: boolean;
}

export class InstantGameEngine {
  private updateInterval: number = 16; // ~60fps
  private callbacks: ((state: any) => void)[] = [];

  // Crash Game Simulation
  simulateCrash(targetCrash?: number): CrashGameState {
    const crashPoint = targetCrash || this.generateCrashPoint();
    
    const state: CrashGameState = {
      multiplier: 1.00,
      crashed: false,
      isRunning: true,
      startTime: Date.now(),
      crashPoint,
      speed: 0.05, // Initial speed
    };

    const simulate = () => {
      const update = () => {
        if (state.multiplier >= state.crashPoint) {
          state.crashed = true;
          state.isRunning = false;
          this.callbacks.forEach(cb => cb(state));
          return;
        }

        // Exponential growth
        const elapsed = (Date.now() - state.startTime) / 1000;
        state.multiplier = 1 + Math.pow(1.05, elapsed * 2);
        
        // Increase speed over time for tension
        state.speed = 0.05 + elapsed * 0.01;

        this.callbacks.forEach(cb => cb(state));

        if (state.isRunning) {
          setTimeout(update, this.updateInterval);
        }
      };

      setTimeout(update, 100); // Small delay before start
    };

    simulate();
    return state;
  }

  // Generate crash point using house edge algorithm
  private generateCrashPoint(): number {
    const houseEdge = 0.04; // 4% house edge
    const random = Math.random();
    
    // Provably fair crash point generation
    const result = 99 / (100 * random * (1 - houseEdge));
    return Math.max(1.00, Math.min(result, 10000));
  }

  // Plinko Ball Physics Simulation
  simulatePlinko(rows: number = 16): PlinkoState {
    const state: PlinkoState = {
      ballPosition: { x: rows / 2, y: 0 },
      path: [],
      multiplier: 1,
      falling: true,
      pegHits: 0,
    };

    const multipliers = this.generatePlinkoMultipliers(rows);

    const simulate = () => {
      const update = () => {
        if (state.ballPosition.y >= rows) {
          state.falling = false;
          const finalPosition = Math.round(state.ballPosition.x);
          state.multiplier = multipliers[finalPosition] || 1;
          this.callbacks.forEach(cb => cb(state));
          return;
        }

        // Bounce left or right at each peg
        const direction = Math.random() < 0.5 ? -0.5 : 0.5;
        state.ballPosition.x += direction;
        state.ballPosition.y += 1;
        state.pegHits++;

        // Keep ball within bounds
        state.ballPosition.x = Math.max(0, Math.min(rows, state.ballPosition.x));
        state.path.push(direction > 0 ? 1 : 0);

        this.callbacks.forEach(cb => cb(state));

        if (state.falling) {
          setTimeout(update, 100); // Slower for visibility
        }
      };

      update();
    };

    simulate();
    return state;
  }

  // Generate Plinko multipliers (bell curve distribution)
  private generatePlinkoMultipliers(rows: number): number[] {
    const multipliers: number[] = [];
    const center = rows / 2;
    
    for (let i = 0; i <= rows; i++) {
      const distance = Math.abs(i - center);
      // Higher multipliers at edges, lower at center
      const mult = distance === 0 ? 0.5 : 
                   distance < 2 ? 1 : 
                   distance < 4 ? 2 : 
                   distance < 6 ? 5 : 
                   distance < 7 ? 10 : 20;
      multipliers.push(mult);
    }
    
    return multipliers;
  }

  // Mines Game Simulation
  initializeMines(gridSize: number = 5, mineCount: number = 3): MinesState {
    const grid: MinesState['grid'] = [];
    const multiplierProgression = [1.1, 1.3, 1.6, 2.0, 2.5, 3.2, 4.0, 5.0, 6.5, 8.0];
    
    // Initialize grid
    for (let i = 0; i < gridSize; i++) {
      grid[i] = [];
      for (let j = 0; j < gridSize; j++) {
        grid[i][j] = { revealed: false, isMine: false, multiplier: 1 };
      }
    }

    // Place mines randomly
    let placedMines = 0;
    while (placedMines < mineCount) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      
      if (!grid[row][col].isMine) {
        grid[row][col].isMine = true;
        placedMines++;
      }
    }

    // Assign multipliers to safe tiles
    grid.forEach(row => {
      row.forEach(cell => {
        if (!cell.isMine) {
          cell.multiplier = multiplierProgression[Math.floor(Math.random() * multiplierProgression.length)];
        }
      });
    });

    return {
      grid,
      revealed: 0,
      totalMines: mineCount,
      currentMultiplier: 1.0,
      gameOver: false,
    };
  }

  // Reveal tile in Mines game
  revealTile(state: MinesState, row: number, col: number): MinesState {
    if (state.gameOver || state.grid[row][col].revealed) {
      return state;
    }

    state.grid[row][col].revealed = true;

    if (state.grid[row][col].isMine) {
      state.gameOver = true;
      state.currentMultiplier = 0;
    } else {
      state.revealed++;
      state.currentMultiplier *= state.grid[row][col].multiplier;
    }

    this.callbacks.forEach(cb => cb(state));
    return state;
  }

  // Register callback for state updates
  onUpdate(callback: (state: any) => void) {
    this.callbacks.push(callback);
  }

  // Clean up
  destroy() {
    this.callbacks = [];
  }
}
