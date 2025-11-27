// Universal Racing Simulation Engine
// Handles all racing types with realistic competition dynamics

export interface RacerState {
  id: string;
  name: string;
  position: number;
  speed: number; // Current speed (0-100)
  distance: number; // Distance covered (0-100%)
  lapTime: number;
  totalTime: number;
  isPitting: boolean;
  hasCrashed: boolean;
  tireWear: number; // 0-100
  fuel: number; // 0-100
  form: number; // Race form/performance (0-100)
}

export interface RaceEvent {
  lap: number;
  time: number;
  type: 'overtake' | 'pitstop' | 'crash' | 'safety-car' | 'fastest-lap' | 'position-change';
  description: string;
  racers: string[];
}

export interface RaceConfig {
  totalLaps: number;
  lapDistance: number; // meters
  updateInterval: number; // ms between updates
  crashProbability: number; // 0-1
  overtakeDifficulty: number; // 0-1, higher = harder to overtake
}

export class RacingEngine {
  private racers: Map<string, RacerState>;
  private events: RaceEvent[];
  private currentLap: number;
  private raceTime: number;
  private config: RaceConfig;
  private updateCallbacks: ((racers: RacerState[], events: RaceEvent[]) => void)[];
  private intervalId: number | null = null;
  private isRunning: boolean = false;

  constructor(
    initialRacers: Array<{id: string, name: string, baseSpeed: number}>,
    config: Partial<RaceConfig> = {}
  ) {
    this.racers = new Map();
    this.events = [];
    this.currentLap = 1;
    this.raceTime = 0;
    this.updateCallbacks = [];
    
    this.config = {
      totalLaps: config.totalLaps || 50,
      lapDistance: config.lapDistance || 5000,
      updateInterval: config.updateInterval || 100,
      crashProbability: config.crashProbability || 0.001,
      overtakeDifficulty: config.overtakeDifficulty || 0.3,
    };

    // Initialize racers
    initialRacers.forEach((racer, index) => {
      this.racers.set(racer.id, {
        id: racer.id,
        name: racer.name,
        position: index + 1,
        speed: racer.baseSpeed + Math.random() * 10, // Add variance
        distance: 0,
        lapTime: 0,
        totalTime: 0,
        isPitting: false,
        hasCrashed: false,
        tireWear: 0,
        fuel: 100,
        form: 80 + Math.random() * 20, // Random starting form
      });
    });
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.intervalId = window.setInterval(() => {
      this.update();
    }, this.config.updateInterval);
  }

  stop() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  onUpdate(callback: (racers: RacerState[], events: RaceEvent[]) => void) {
    this.updateCallbacks.push(callback);
  }

  private update() {
    this.raceTime += this.config.updateInterval;

    // Update each racer
    this.racers.forEach((racer) => {
      if (racer.hasCrashed || racer.isPitting) {
        // Handle pit stop
        if (racer.isPitting) {
          racer.speed = 0;
          racer.lapTime += this.config.updateInterval;
          // Exit pit after 3 seconds
          if (racer.lapTime % 3000 < this.config.updateInterval) {
            racer.isPitting = false;
            racer.tireWear = 0;
            racer.fuel = 100;
            this.addEvent('pitstop', `${racer.name} completes pit stop`, [racer.id]);
          }
        }
        return;
      }

      // Calculate speed based on tire wear, fuel, and form
      const tireEffect = 1 - (racer.tireWear / 200); // Lose up to 50% speed
      const fuelEffect = 0.95 + (racer.fuel / 1000); // Slight weight effect
      const formEffect = racer.form / 100;
      
      const effectiveSpeed = racer.speed * tireEffect * fuelEffect * formEffect;
      
      // Add random variance for exciting racing
      const variance = 0.95 + Math.random() * 0.1;
      const currentSpeed = effectiveSpeed * variance;

      // Update distance (speed is in arbitrary units, normalize to percentage)
      const distanceIncrement = (currentSpeed / 100) * (this.config.updateInterval / 1000);
      racer.distance += distanceIncrement;
      racer.lapTime += this.config.updateInterval;
      racer.totalTime += this.config.updateInterval;

      // Update tire wear and fuel
      racer.tireWear += distanceIncrement * 0.5;
      racer.fuel = Math.max(0, racer.fuel - distanceIncrement * 0.1);

      // Check for lap completion
      if (racer.distance >= 100) {
        racer.distance = racer.distance - 100;
        
        // Check if need pit stop
        if (racer.tireWear > 70 || racer.fuel < 20) {
          racer.isPitting = true;
          this.addEvent('pitstop', `${racer.name} enters pit lane`, [racer.id]);
        }

        // Random crash chance
        if (Math.random() < this.config.crashProbability) {
          racer.hasCrashed = true;
          this.addEvent('crash', `${racer.name} has crashed out!`, [racer.id]);
        }
      }
    });

    // Update positions based on progress (distance + current lap)
    const racerArray = Array.from(this.racers.values());
    racerArray.sort((a, b) => {
      const aProgress = Math.floor(a.totalTime / (this.config.lapDistance * 10)) * 100 + a.distance;
      const bProgress = Math.floor(b.totalTime / (this.config.lapDistance * 10)) * 100 + b.distance;
      return bProgress - aProgress; // Higher progress = better position
    });

    // Check for position changes and overtakes
    racerArray.forEach((racer, index) => {
      const newPosition = index + 1;
      if (newPosition !== racer.position && !racer.hasCrashed) {
        const oldPosition = racer.position;
        
        if (newPosition < oldPosition) {
          // Overtake!
          const overtakenRacer = racerArray.find(r => r.position === newPosition);
          if (overtakenRacer) {
            this.addEvent('overtake', `${racer.name} overtakes ${overtakenRacer.name}!`, [racer.id, overtakenRacer.id]);
          }
        }
        
        racer.position = newPosition;
      }
    });

    // Update current lap (based on leader)
    const leader = racerArray[0];
    const newLap = Math.floor(leader.totalTime / (this.config.lapDistance * 10)) + 1;
    if (newLap > this.currentLap) {
      this.currentLap = newLap;
    }

    // Notify callbacks
    this.notifyUpdate();

    // Check for race completion
    if (this.currentLap > this.config.totalLaps) {
      this.stop();
      this.addEvent('position-change', `Race finished! ${leader.name} wins!`, [leader.id]);
    }
  }

  private addEvent(type: RaceEvent['type'], description: string, racers: string[]) {
    this.events.push({
      lap: this.currentLap,
      time: this.raceTime,
      type,
      description,
      racers,
    });

    // Keep only last 10 events
    if (this.events.length > 10) {
      this.events.shift();
    }
  }

  private notifyUpdate() {
    const racerArray = Array.from(this.racers.values());
    this.updateCallbacks.forEach(callback => {
      callback(racerArray, this.events);
    });
  }

  getCurrentState() {
    return {
      racers: Array.from(this.racers.values()),
      events: this.events,
      currentLap: this.currentLap,
      totalLaps: this.config.totalLaps,
      isRunning: this.isRunning,
    };
  }

  getWinner() {
    if (this.currentLap <= this.config.totalLaps) return null;
    
    const racerArray = Array.from(this.racers.values());
    racerArray.sort((a, b) => a.position - b.position);
    return racerArray[0];
  }
}
