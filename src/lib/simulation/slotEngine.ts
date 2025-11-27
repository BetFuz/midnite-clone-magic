// Universal Slot Machine Simulation Engine
// Handles reel spinning, symbol generation, and win detection

export interface SlotSymbol {
  id: string;
  value: string;
  multiplier: number;
  rarity: number; // 0-1, lower is rarer
  visual: string; // emoji or icon
}

export interface ReelState {
  symbols: SlotSymbol[];
  spinning: boolean;
  velocity: number;
  position: number; // Current scroll position
}

export interface SlotGameState {
  reels: ReelState[];
  spinning: boolean;
  result: SlotSymbol[][];
  winLines: number[];
  totalWin: number;
  bonusTriggered: boolean;
}

export class SlotSimulationEngine {
  private reelCount: number;
  private symbolsPerReel: number;
  private updateInterval: number = 16; // ~60fps
  private callbacks: ((state: SlotGameState) => void)[] = [];
  
  private symbols: SlotSymbol[] = [
    { id: 'cherry', value: '🍒', multiplier: 2, rarity: 0.3, visual: '🍒' },
    { id: 'lemon', value: '🍋', multiplier: 3, rarity: 0.25, visual: '🍋' },
    { id: 'orange', value: '🍊', multiplier: 4, rarity: 0.2, visual: '🍊' },
    { id: 'plum', value: '🍇', multiplier: 5, rarity: 0.15, visual: '🍇' },
    { id: 'watermelon', value: '🍉', multiplier: 8, rarity: 0.1, visual: '🍉' },
    { id: 'bar', value: 'BAR', multiplier: 10, rarity: 0.08, visual: '💎' },
    { id: 'seven', value: '7️⃣', multiplier: 20, rarity: 0.05, visual: '7️⃣' },
    { id: 'jackpot', value: '💰', multiplier: 100, rarity: 0.02, visual: '💰' },
  ];

  constructor(reelCount: number = 5, symbolsPerReel: number = 3) {
    this.reelCount = reelCount;
    this.symbolsPerReel = symbolsPerReel;
  }

  // Initialize slot game
  initializeGame(): SlotGameState {
    const reels: ReelState[] = [];
    
    for (let i = 0; i < this.reelCount; i++) {
      reels.push({
        symbols: this.generateReelStrip(),
        spinning: false,
        velocity: 0,
        position: 0,
      });
    }

    return {
      reels,
      spinning: false,
      result: [],
      winLines: [],
      totalWin: 0,
      bonusTriggered: false,
    };
  }

  // Generate a reel strip (infinite loop of symbols)
  private generateReelStrip(): SlotSymbol[] {
    const strip: SlotSymbol[] = [];
    const stripLength = 50; // Total symbols in the reel
    
    for (let i = 0; i < stripLength; i++) {
      const symbol = this.weightedRandomSymbol();
      strip.push(symbol);
    }
    
    return strip;
  }

  // Select symbol based on rarity weights
  private weightedRandomSymbol(): SlotSymbol {
    const random = Math.random();
    let cumulative = 0;
    
    for (const symbol of this.symbols) {
      cumulative += symbol.rarity;
      if (random <= cumulative) {
        return symbol;
      }
    }
    
    return this.symbols[0]; // Fallback
  }

  // Spin the reels
  spin(state: SlotGameState): SlotGameState {
    state.spinning = true;
    state.winLines = [];
    state.totalWin = 0;
    state.bonusTriggered = false;

    // Initialize each reel with different velocities
    state.reels.forEach((reel, index) => {
      reel.spinning = true;
      reel.velocity = 20 + Math.random() * 5; // Initial velocity
      
      const stopDelay = index * 400 + 1500; // Sequential stopping

      const animate = () => {
        const update = () => {
          if (reel.velocity < 0.1) {
            reel.spinning = false;
            reel.velocity = 0;
            
            // Check if all reels stopped
            const allStopped = state.reels.every(r => !r.spinning);
            if (allStopped) {
              state.spinning = false;
              this.evaluateWin(state);
            }
            return;
          }

          // Apply friction
          reel.velocity *= 0.97;
          
          // Update position
          reel.position = (reel.position + reel.velocity) % reel.symbols.length;

          this.callbacks.forEach(cb => cb(state));

          if (reel.spinning) {
            setTimeout(update, this.updateInterval);
          }
        };

        setTimeout(update, stopDelay);
      };

      animate();
    });

    this.callbacks.forEach(cb => cb(state));
    return state;
  }

  // Evaluate winning combinations
  private evaluateWin(state: SlotGameState) {
    // Extract visible symbols from each reel
    const visibleSymbols: SlotSymbol[][] = [];
    
    state.reels.forEach(reel => {
      const position = Math.floor(reel.position);
      const visible: SlotSymbol[] = [];
      
      for (let i = 0; i < this.symbolsPerReel; i++) {
        const index = (position + i) % reel.symbols.length;
        visible.push(reel.symbols[index]);
      }
      
      visibleSymbols.push(visible);
    });

    state.result = visibleSymbols;

    // Check win lines (horizontal, diagonal, etc.)
    const winLines: number[] = [];
    let totalWin = 0;

    // Check middle horizontal line
    const middleLine = visibleSymbols.map(col => col[1]);
    if (this.isWinningLine(middleLine)) {
      winLines.push(1);
      totalWin += this.calculateWin(middleLine);
    }

    // Check top horizontal line
    const topLine = visibleSymbols.map(col => col[0]);
    if (this.isWinningLine(topLine)) {
      winLines.push(0);
      totalWin += this.calculateWin(topLine);
    }

    // Check bottom horizontal line
    const bottomLine = visibleSymbols.map(col => col[2]);
    if (this.isWinningLine(bottomLine)) {
      winLines.push(2);
      totalWin += this.calculateWin(bottomLine);
    }

    // Check for bonus symbols
    const bonusCount = visibleSymbols.flat().filter(s => s.id === 'jackpot').length;
    if (bonusCount >= 3) {
      state.bonusTriggered = true;
      totalWin += 50; // Bonus round
    }

    state.winLines = winLines;
    state.totalWin = totalWin;

    this.callbacks.forEach(cb => cb(state));
  }

  // Check if a line has winning symbols
  private isWinningLine(line: SlotSymbol[]): boolean {
    if (line.length < 3) return false;
    
    const firstSymbol = line[0].id;
    let consecutiveCount = 1;
    
    for (let i = 1; i < line.length; i++) {
      if (line[i].id === firstSymbol) {
        consecutiveCount++;
      } else {
        break;
      }
    }
    
    return consecutiveCount >= 3;
  }

  // Calculate win amount for a line
  private calculateWin(line: SlotSymbol[]): number {
    const symbol = line[0];
    let matchCount = 1;
    
    for (let i = 1; i < line.length; i++) {
      if (line[i].id === symbol.id) {
        matchCount++;
      } else {
        break;
      }
    }
    
    return symbol.multiplier * matchCount;
  }

  // Register callback for state updates
  onUpdate(callback: (state: SlotGameState) => void) {
    this.callbacks.push(callback);
  }

  // Clean up
  destroy() {
    this.callbacks = [];
  }
}
