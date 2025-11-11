import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock } from 'lucide-react';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { toast } from 'sonner';

interface FlashOdd {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  selection: string;
  normalOdds: number;
  flashOdds: number;
  expiresAt: Date;
}

const flashOdds: FlashOdd[] = [
  {
    id: 'flash1',
    homeTeam: 'Man City',
    awayTeam: 'Arsenal',
    league: 'Premier League',
    selection: 'Home Win',
    normalOdds: 2.10,
    flashOdds: 2.80,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  },
  {
    id: 'flash2',
    homeTeam: 'Barcelona',
    awayTeam: 'Real Madrid',
    league: 'La Liga',
    selection: 'Over 2.5',
    normalOdds: 1.75,
    flashOdds: 2.20,
    expiresAt: new Date(Date.now() + 8 * 60 * 1000), // 8 minutes
  },
  {
    id: 'flash3',
    homeTeam: 'Liverpool',
    awayTeam: 'Chelsea',
    league: 'Premier League',
    selection: 'BTTS',
    normalOdds: 1.85,
    flashOdds: 2.40,
    expiresAt: new Date(Date.now() + 22 * 60 * 1000), // 22 minutes
  },
];

const FlashOdds = () => {
  const [timeRemaining, setTimeRemaining] = useState<Record<string, number>>({});
  const { addSelection } = useBetSlip();

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimes: Record<string, number> = {};
      flashOdds.forEach(odd => {
        const diff = odd.expiresAt.getTime() - Date.now();
        newTimes[odd.id] = Math.max(0, Math.floor(diff / 1000));
      });
      setTimeRemaining(newTimes);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddFlash = (odd: FlashOdd) => {
    const remaining = timeRemaining[odd.id] || 0;
    if (remaining <= 0) {
      toast.error('Flash Odds Expired', {
        description: 'This offer has expired. Check out other flash deals!',
      });
      return;
    }

    const selectionType = odd.selection.includes('Home') ? 'home' : 
                         odd.selection.includes('Away') ? 'away' : 'home';

    addSelection({
      id: `${Date.now()}-${Math.random()}`,
      matchId: odd.id,
      homeTeam: odd.homeTeam,
      awayTeam: odd.awayTeam,
      sport: 'Football',
      league: odd.league,
      selectionType: selectionType,
      selectionValue: odd.selection,
      odds: odd.flashOdds,
      matchTime: new Date(Date.now() + Math.random() * 86400000).toISOString(),
    });

    toast.success('Flash Odds Added! ⚡', {
      description: `${odd.flashOdds} odds locked in before expiry`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 p-1.5">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-xl font-bold">Flash Odds</h2>
        <Badge variant="destructive" className="ml-auto animate-pulse">Limited Time</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {flashOdds.map((odd) => {
          const remaining = timeRemaining[odd.id] || 0;
          const isExpired = remaining <= 0;
          const isUrgent = remaining < 300; // Less than 5 minutes

          return (
            <Card 
              key={odd.id} 
              className={`p-4 relative overflow-hidden ${
                isExpired ? 'opacity-50 grayscale' : 
                isUrgent ? 'border-destructive border-2 animate-pulse' : ''
              }`}
            >
              {!isExpired && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500/20 to-transparent w-32 h-32 -mr-8 -mt-8 rotate-45" />
              )}

              <div className="relative space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className={`h-4 w-4 ${isUrgent ? 'text-destructive' : 'text-primary'}`} />
                  <span className={`text-sm font-bold ${isUrgent ? 'text-destructive' : 'text-primary'}`}>
                    {isExpired ? 'EXPIRED' : formatTime(remaining)}
                  </span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {odd.league}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-sm">
                    {odd.homeTeam} vs {odd.awayTeam}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{odd.selection}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground line-through">
                      {odd.normalOdds}
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {odd.flashOdds}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                      +{Math.round((odd.flashOdds - odd.normalOdds) / odd.normalOdds * 100)}% Boost
                    </Badge>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  className="w-full"
                  disabled={isExpired}
                  onClick={() => handleAddFlash(odd)}
                >
                  {isExpired ? 'Expired' : 'Grab Flash Odds'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Flash odds refresh every hour • Limited quantities available
      </p>
    </div>
  );
};

export default FlashOdds;
