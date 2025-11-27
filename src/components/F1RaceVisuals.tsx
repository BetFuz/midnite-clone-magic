import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface F1Driver {
  id: string;
  name: string;
  team: string;
  color: string;
  position: number;
}

interface F1RaceVisualsProps {
  currentLap: number;
  totalLaps: number;
  drivers: F1Driver[];
  isRacing: boolean;
}

const F1RaceVisuals = ({ currentLap, totalLaps, drivers, isRacing }: F1RaceVisualsProps) => {
  const [carPositions, setCarPositions] = useState<Record<string, number>>({});
  const [engineSound, setEngineSound] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize car positions
    const initialPositions: Record<string, number> = {};
    drivers.forEach((driver, idx) => {
      initialPositions[driver.id] = idx * 15; // Stagger starting positions
    });
    setCarPositions(initialPositions);
  }, [drivers]);

  useEffect(() => {
    if (isRacing) {
      // Create engine sound loop
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSSFz/DQbTYHHXfK8N+TOAoVX7Tp66lWFApBnODuuGsfBSCBzO/PZy4HH3fH7t6PQQAOE3fH7+COUhELSKDa7d+FQAMUcLng6a5cEQdFmNjv0YJHCxx+xOrduG0dBCmI0erGdCAEGl+k5uWgVRMJOXvC4NyCPQUUbKbW7dqCRQkceLjf6KBjGwQ/jNLu1nlDBylrp+Pkn1wVCTJ4weLajUcJGHGz3eeQWhELPn/J5N2FSxQMYKTT6qVeGA';
      audio.loop = true;
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio autoplay blocked:', e));
      setEngineSound(audio);

      // Animate car positions
      const interval = setInterval(() => {
        setCarPositions(prev => {
          const updated = { ...prev };
          drivers.forEach(driver => {
            // Move cars forward with slight randomization for realism
            const speed = 2 + Math.random() * 1;
            updated[driver.id] = ((updated[driver.id] || 0) + speed) % 100;
          });
          return updated;
        });
      }, 50);

      return () => {
        clearInterval(interval);
        audio?.pause();
      };
    } else {
      engineSound?.pause();
    }
  }, [isRacing, drivers, engineSound]);

  const teamColors: Record<string, string> = {
    'Red Bull Racing': '#1E40AF',
    'Mercedes': '#06B6D4',
    'Ferrari': '#DC2626',
    'McLaren': '#EA580C',
    'Aston Martin': '#059669',
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-primary/20">
      <div className="space-y-6">
        {/* Race Track Visualization */}
        <div className="relative h-64 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-lg overflow-hidden border-2 border-slate-500">
          {/* Track Surface */}
          <div className="absolute inset-0 opacity-30">
            <div className="h-full w-full" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.1) 50px, rgba(255,255,255,0.1) 100px)'
            }} />
          </div>

          {/* Center Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 transform -translate-y-1/2">
            <div className="h-full w-full" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, white 0px, white 20px, transparent 20px, transparent 40px)'
            }} />
          </div>

          {/* Cars */}
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="absolute transition-all duration-100 ease-linear"
              style={{
                left: `${carPositions[driver.id] || 0}%`,
                top: `${30 + driver.position * 30}px`,
                transform: 'translateX(-50%)',
              }}
            >
              {/* Car Body */}
              <div className="relative">
                <div 
                  className="w-12 h-6 rounded-full shadow-lg transform scale-x-150"
                  style={{
                    backgroundColor: teamColors[driver.team] || '#6B7280',
                    boxShadow: `0 0 10px ${teamColors[driver.team] || '#6B7280'}`,
                  }}
                >
                  {/* Car Details */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full opacity-70" />
                  </div>
                </div>
                
                {/* Driver Name Tag */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs font-bold text-white bg-black/70 px-2 py-1 rounded">
                    {driver.name.split(' ')[1] || driver.name}
                  </span>
                </div>

                {/* Speed Lines */}
                {isRacing && (
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 flex gap-1 mr-2">
                    <div className="w-2 h-0.5 bg-white/50 animate-pulse" />
                    <div className="w-1 h-0.5 bg-white/30 animate-pulse delay-75" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Finish Line */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-white/40 flex items-center justify-center">
            <div className="text-4xl">🏁</div>
          </div>
        </div>

        {/* Lap Counter Display */}
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-primary">
              LAP {currentLap}/{totalLaps}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Race Progress</span>
              <Progress value={(currentLap / totalLaps) * 100} className="w-48" />
            </div>
          </div>

          {isRacing && (
            <div className="flex items-center gap-2 animate-pulse">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm font-semibold text-red-500">LIVE</span>
            </div>
          )}
        </div>

        {/* Position Board */}
        <div className="grid grid-cols-5 gap-2">
          {drivers.map((driver, idx) => (
            <div 
              key={driver.id}
              className="flex items-center gap-2 bg-slate-800/50 rounded px-2 py-1"
            >
              <div className="text-sm font-bold text-primary">
                P{idx + 1}
              </div>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: teamColors[driver.team] || '#6B7280' }}
              />
              <div className="text-xs truncate">
                {driver.name.split(' ')[1] || driver.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default F1RaceVisuals;
