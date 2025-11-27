import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface F1Driver {
  id: string;
  name: string;
  team: string;
  color: string;
  position: number;
  progress?: number; // 0-100 percentage through current lap
}

interface F1RaceVisualsProps {
  currentLap: number;
  totalLaps: number;
  drivers: F1Driver[];
  isRacing: boolean;
}

const F1RaceVisuals = ({ currentLap, totalLaps, drivers, isRacing }: F1RaceVisualsProps) => {
  const [engineSound, setEngineSound] = useState<HTMLAudioElement | null>(null);

  // Sort drivers by position for display
  const sortedDrivers = [...drivers].sort((a, b) => a.position - b.position);

  useEffect(() => {
    if (isRacing) {
      // Create engine sound loop
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSSFz/DQbTYHHXfK8N+TOAoVX7Tp66lWFApBnODuuGsfBSCBzO/PZy4HH3fH7t6PQQAOE3fH7+COUhELSKDa7d+FQAMUcLng6a5cEQdFmNjv0YJHCxx+xOrduG0dBCmI0erGdCAEGl+k5uWgVRMJOXvC4NyCPQUUbKbW7dqCRQkceLjf6KBjGwQ/jNLu1nlDBylrp+Pkn1wVCTJ4weLajUcJGHGz3eeQWhELPn/J5N2FSxQMYKTT6qVeGA';
      audio.loop = true;
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio autoplay blocked:', e));
      setEngineSound(audio);

      return () => {
        audio?.pause();
      };
    } else {
      engineSound?.pause();
    }
  }, [isRacing, engineSound]);

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
          {sortedDrivers.map((driver) => (
            <div
              key={driver.id}
              className="absolute transition-all duration-200 ease-linear"
              style={{
                left: `${driver.progress || 0}%`,
                top: `${30 + driver.position * 30}px`,
                transform: 'translateX(-50%)',
              }}
            >
              {/* F1 Car Shape */}
              <div className="relative">
                {/* Car Body - F1 Shape */}
                <div className="relative" style={{ width: '60px', height: '28px' }}>
                  {/* Front Wing */}
                  <div 
                    className="absolute left-0 top-1/2 transform -translate-y-1/2"
                    style={{
                      width: '8px',
                      height: '24px',
                      backgroundColor: teamColors[driver.team] || '#6B7280',
                      borderRadius: '2px 0 0 2px',
                    }}
                  />
                  
                  {/* Main Body */}
                  <div 
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 shadow-xl"
                    style={{
                      width: '42px',
                      height: '20px',
                      backgroundColor: teamColors[driver.team] || '#6B7280',
                      borderRadius: '8px',
                      boxShadow: `0 4px 12px ${teamColors[driver.team] || '#6B7280'}`,
                    }}
                  >
                    {/* Cockpit */}
                    <div 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900/50 rounded"
                      style={{ width: '12px', height: '10px' }}
                    />
                    
                    {/* Driver Number */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white">
                        {parseInt(driver.id)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Rear Wing */}
                  <div 
                    className="absolute right-0 top-1/2 transform -translate-y-1/2"
                    style={{
                      width: '6px',
                      height: '18px',
                      backgroundColor: teamColors[driver.team] || '#6B7280',
                      borderRadius: '0 3px 3px 0',
                    }}
                  />
                  
                  {/* Wheels */}
                  <div className="absolute top-1 left-3 w-2 h-2 bg-slate-900 rounded-full border border-slate-700" />
                  <div className="absolute top-1 right-8 w-2 h-2 bg-slate-900 rounded-full border border-slate-700" />
                  <div className="absolute bottom-1 left-3 w-2 h-2 bg-slate-900 rounded-full border border-slate-700" />
                  <div className="absolute bottom-1 right-8 w-2 h-2 bg-slate-900 rounded-full border border-slate-700" />
                </div>
                
                {/* Driver Name Tag */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs font-bold text-white bg-black/80 px-2 py-1 rounded shadow-lg">
                    {driver.name.split(' ')[1] || driver.name}
                  </span>
                </div>

                {/* Speed Lines & Exhaust */}
                {isRacing && (
                  <>
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 flex gap-1 mr-2">
                      <div className="w-3 h-0.5 bg-white/60 animate-pulse" />
                      <div className="w-2 h-0.5 bg-white/40 animate-pulse" style={{ animationDelay: '100ms' }} />
                      <div className="w-1 h-0.5 bg-white/20 animate-pulse" style={{ animationDelay: '200ms' }} />
                    </div>
                    {/* Exhaust flames */}
                    <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 flex gap-0.5">
                      <div className="w-1 h-1 bg-orange-500/70 rounded-full animate-pulse" />
                      <div className="w-0.5 h-0.5 bg-yellow-400/60 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                    </div>
                  </>
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
          {sortedDrivers.map((driver, idx) => (
            <div 
              key={driver.id}
              className="flex items-center gap-2 bg-slate-800/50 rounded px-2 py-1"
            >
              <div className="text-sm font-bold text-primary">
                P{driver.position + 1}
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
