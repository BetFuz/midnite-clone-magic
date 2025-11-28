import { useEffect, useState, useRef } from 'react';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Horse = {
  id: string;
  name: string;
  color: string;
  distance: number;
  speed: number;
  finished: boolean;
  finalPosition: number | null;
};

const TRACK_LENGTH = 1600;
const TICK_MS = 200;

const HORSES: Horse[] = [
  { id: 'h1', name: 'Pixel Pegasus',  color: 'bg-amber-500', distance: 0, speed: 0, finished: false, finalPosition: null },
  { id: 'h2', name: 'Binary Bolt',    color: 'bg-sky-500',   distance: 0, speed: 0, finished: false, finalPosition: null },
  { id: 'h3', name: 'Circuit Storm',  color: 'bg-emerald-500', distance: 0, speed: 0, finished: false, finalPosition: null },
  { id: 'h4', name: 'Data Dasher',    color: 'bg-violet-500', distance: 0, speed: 0, finished: false, finalPosition: null },
  { id: 'h5', name: 'Giga Gallop',    color: 'bg-rose-500',  distance: 0, speed: 0, finished: false, finalPosition: null },
  { id: 'h6', name: 'Neon Nelly',     color: 'bg-indigo-500', distance: 0, speed: 0, finished: false, finalPosition: null },
  { id: 'h7', name: 'Quantum Quick',  color: 'bg-orange-500', distance: 0, speed: 0, finished: false, finalPosition: null },
  { id: 'h8', name: 'Synth Steed',    color: 'bg-teal-500',  distance: 0, speed: 0, finished: false, finalPosition: null },
];

export default function VirtualHorseRace() {
  const { addSelection } = useBetSlip();
  const [horses, setHorses] = useState<Horse[]>(HORSES);
  const [raceStatus, setRaceStatus] = useState<'waiting' | 'running' | 'finished'>('waiting');
  const [commentary, setCommentary] = useState<string>('Race will start in 5 seconds');
  const [countdown, setCountdown] = useState(5);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (raceStatus !== 'waiting') return;
    const cd = setInterval(() => {
      setCountdown((c) => {
        if (c === 1) {
          clearInterval(cd);
          startRace();
          return 0;
        }
        setCommentary(`Race starts in ${c - 1}`);
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(cd);
  }, [raceStatus]);

  const startRace = () => {
    setRaceStatus('running');
    setCommentary('And they are off!');
    intervalRef.current = window.setInterval(() => {
      setHorses((prev) => {
        const next = prev.map((h) => {
          if (h.finished) return h;
          const burst = 0.8 + Math.random() * 0.4;
          const baseSpeed = 15 + Math.random() * 5;
          const newDist = h.distance + baseSpeed * burst * (TICK_MS / 1000);
          return { ...h, distance: newDist, speed: baseSpeed * burst };
        });

        let finishedCount = 0;
        next.forEach((h) => {
          if (!h.finished && h.distance >= TRACK_LENGTH) {
            h.finished = true;
            h.finalPosition = finishedCount + 1;
            finishedCount++;
          }
        });

        if (next.every((h) => h.finished)) {
          clearInterval(intervalRef.current!);
          setRaceStatus('finished');
          const winner = next.find((h) => h.finalPosition === 1)!;
          setCommentary(`${winner.name} wins the virtual race!`);
        }
        return next;
      });
    }, TICK_MS);
  };

  const resetRace = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setHorses(HORSES.map((h) => ({ ...h, distance: 0, speed: 0, finished: false, finalPosition: null })));
    setRaceStatus('waiting');
    setCountdown(5);
    setCommentary('Race will start in 5 seconds');
  };

  const handleBet = (horse: Horse) => {
    const odds = 2.5 + Math.random() * 5.5;
    addSelection({
      id: `virtual-${horse.id}`,
      matchId: 'virtual-race-001',
      sport: 'Virtual Racing',
      league: 'Virtual Horse Racing',
      homeTeam: horse.name,
      awayTeam: 'Field',
      selectionType: 'home',
      selectionValue: `${horse.name} to Win`,
      odds: odds,
      matchTime: 'Starting Soon'
    });
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-primary/30 rounded-full animate-ping"></div>
            <div className="relative w-3 h-3 bg-primary rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Virtual Horse Race</h2>
          <Badge variant={raceStatus === 'running' ? 'destructive' : 'secondary'} className="animate-pulse">
            {raceStatus === 'running' ? 'LIVE' : raceStatus === 'finished' ? 'FINISHED' : 'STARTING'}
          </Badge>
        </div>
        {raceStatus === 'finished' && (
          <Button onClick={resetRace} variant="default" className="gap-2">
            New Race
          </Button>
        )}
      </div>

      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-center text-foreground font-semibold">{commentary}</p>
      </div>

      <div className="relative h-80 bg-gradient-to-b from-green-700 to-green-900 rounded-lg p-4 overflow-hidden mb-6">
        <div className="absolute inset-0 grid grid-cols-8 gap-px opacity-20">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-r border-white" />
          ))}
        </div>

        {horses.map((h, idx) => {
          const progress = Math.min((h.distance / TRACK_LENGTH) * 100, 100);
          return (
            <div key={h.id} className="relative h-8 mb-2 flex items-center">
              <div className="w-8 text-xs font-bold text-slate-900 bg-white/90 rounded px-1 flex items-center justify-center">
                {idx + 1}
              </div>
              <div
                className={`ml-2 h-7 rounded-full ${h.color} transition-all duration-200 relative flex items-center shadow-lg`}
                style={{ width: `${progress}%` }}
              >
                <span className="absolute left-2 text-xs font-semibold text-white truncate">
                  {h.name}
                </span>
                {h.finished && (
                  <span className="absolute right-2 text-xs font-bold text-white">
                    Finished #{h.finalPosition}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        <div className="absolute right-0 top-0 bottom-0 w-2 bg-yellow-400 shadow-lg" />
      </div>

      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {horses
          .sort((a, b) => b.distance - a.distance)
          .map((h, idx) => (
            <Card key={h.id} className="p-3 flex items-center gap-2 bg-muted/30">
              <Badge variant="outline" className="shrink-0">{idx + 1}</Badge>
              <div className={`w-3 h-3 rounded-full ${h.color} shrink-0`} />
              <div className="min-w-0">
                <div className="font-semibold text-foreground text-sm truncate">{h.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(h.distance / 1000).toFixed(2)} km
                </div>
              </div>
            </Card>
          ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {horses.map((h) => (
          <Button
            key={h.id}
            onClick={() => handleBet(h)}
            className={`font-semibold text-white ${h.color} hover:opacity-90 transition-all h-auto py-3`}
            disabled={raceStatus === 'running' || h.finished}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm">{h.name}</span>
              <Badge variant="secondary" className="text-xs">
                WIN
              </Badge>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
}
