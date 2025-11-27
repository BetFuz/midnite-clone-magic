// Universal Casino Game Simulation Engine
// Handles realistic physics and animations for all table games

export interface CardState {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  faceUp: boolean;
  animating: boolean;
  position: { x: number; y: number };
}

export interface DiceState {
  value: number;
  rolling: boolean;
  rotation: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
}

export interface RouletteState {
  ballPosition: number; // 0-360 degrees
  ballSpeed: number;
  wheelSpeed: number;
  spinning: boolean;
  landedNumber: number | null;
}

export interface GamePhysics {
  gravity: number;
  friction: number;
  bounciness: number;
  airResistance: number;
}

export class CasinoSimulationEngine {
  private physics: GamePhysics;
  private updateInterval: number;
  private intervalId: number | null = null;
  private callbacks: ((state: any) => void)[] = [];

  constructor(physics?: Partial<GamePhysics>) {
    this.physics = {
      gravity: physics?.gravity || 9.81,
      friction: physics?.friction || 0.95,
      bounciness: physics?.bounciness || 0.3,
      airResistance: physics?.airResistance || 0.98,
    };
    this.updateInterval = 16; // ~60fps
  }

  // Card Dealing Simulation
  dealCards(count: number, dealSpeed: number = 0.3): CardState[] {
    const suits: CardState['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    const deck: CardState[] = [];
    for (let i = 0; i < count; i++) {
      deck.push({
        suit: suits[Math.floor(Math.random() * suits.length)],
        rank: ranks[Math.floor(Math.random() * ranks.length)],
        faceUp: false,
        animating: true,
        position: { x: 0, y: 0 },
      });
    }

    // Simulate dealing animation
    deck.forEach((card, i) => {
      setTimeout(() => {
        card.animating = false;
        card.position = { x: i * 50, y: 0 };
      }, i * dealSpeed * 1000);
    });

    return deck;
  }

  // Dice Rolling Simulation with Physics
  rollDice(count: number = 2): DiceState[] {
    const dice: DiceState[] = [];
    
    for (let i = 0; i < count; i++) {
      dice.push({
        value: Math.floor(Math.random() * 6) + 1,
        rolling: true,
        rotation: { x: 0, y: 0, z: 0 },
        velocity: {
          x: (Math.random() - 0.5) * 10,
          y: Math.random() * 15 + 10,
          z: (Math.random() - 0.5) * 10,
        },
      });
    }

    // Simulate physics
    const simulateDie = (die: DiceState) => {
      let time = 0;
      const maxTime = 2000; // 2 seconds roll time

      const update = () => {
        if (time >= maxTime) {
          die.rolling = false;
          return;
        }

        // Apply physics
        die.velocity.y -= this.physics.gravity * 0.016; // gravity
        die.velocity.x *= this.physics.airResistance;
        die.velocity.z *= this.physics.airResistance;

        // Bounce on ground
        if (die.velocity.y < 0 && Math.abs(die.velocity.y) < 0.5) {
          die.velocity.y = 0;
          die.velocity.x *= this.physics.friction;
          die.velocity.z *= this.physics.friction;
        } else if (die.velocity.y < 0) {
          die.velocity.y *= -this.physics.bounciness;
        }

        // Update rotation based on velocity
        die.rotation.x += die.velocity.x * 10;
        die.rotation.y += die.velocity.y * 10;
        die.rotation.z += die.velocity.z * 10;

        time += this.updateInterval;
        
        this.callbacks.forEach(cb => cb(dice));
        
        if (die.rolling) {
          setTimeout(update, this.updateInterval);
        }
      };

      update();
    };

    dice.forEach(simulateDie);
    return dice;
  }

  // Roulette Wheel Simulation
  spinRoulette(targetNumber?: number): RouletteState {
    const state: RouletteState = {
      ballPosition: Math.random() * 360,
      ballSpeed: 15 + Math.random() * 5, // Initial speed
      wheelSpeed: -8 - Math.random() * 2, // Opposite direction
      spinning: true,
      landedNumber: null,
    };

    const rouletteNumbers = [
      0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
      5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
    ];

    const target = targetNumber ?? rouletteNumbers[Math.floor(Math.random() * rouletteNumbers.length)];

    const simulate = () => {
      const update = () => {
        if (state.ballSpeed < 0.1 && !state.landedNumber) {
          state.spinning = false;
          state.landedNumber = target;
          this.callbacks.forEach(cb => cb(state));
          return;
        }

        // Apply friction
        state.ballSpeed *= this.physics.airResistance;
        state.wheelSpeed *= this.physics.friction;

        // Update positions
        state.ballPosition = (state.ballPosition + state.ballSpeed) % 360;

        this.callbacks.forEach(cb => cb(state));

        if (state.spinning) {
          setTimeout(update, this.updateInterval);
        }
      };

      update();
    };

    simulate();
    return state;
  }

  // Slot Machine Reel Simulation
  spinReels(reelCount: number = 3, symbols: string[]): string[][] {
    const reels: string[][] = Array(reelCount).fill(null).map(() => []);
    const spinDuration = 2000 + Math.random() * 1000;
    
    for (let i = 0; i < reelCount; i++) {
      const reel: string[] = [];
      const stopDelay = i * 300; // Reels stop sequentially
      
      // Simulate spinning animation
      const spin = () => {
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += this.updateInterval;
          
          // Random symbols during spin
          reel[0] = symbols[Math.floor(Math.random() * symbols.length)];
          reel[1] = symbols[Math.floor(Math.random() * symbols.length)];
          reel[2] = symbols[Math.floor(Math.random() * symbols.length)];
          
          this.callbacks.forEach(cb => cb({ reels, spinning: true }));
          
          if (elapsed >= spinDuration + stopDelay) {
            clearInterval(interval);
            // Final result
            reel[0] = symbols[Math.floor(Math.random() * symbols.length)];
            reel[1] = symbols[Math.floor(Math.random() * symbols.length)];
            reel[2] = symbols[Math.floor(Math.random() * symbols.length)];
            
            if (i === reelCount - 1) {
              this.callbacks.forEach(cb => cb({ reels, spinning: false }));
            }
          }
        }, this.updateInterval);
      };
      
      spin();
      reels[i] = reel;
    }
    
    return reels;
  }

  // Register callback for state updates
  onUpdate(callback: (state: any) => void) {
    this.callbacks.push(callback);
  }

  // Clean up
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.callbacks = [];
  }
}
