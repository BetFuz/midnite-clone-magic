import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Clock } from 'lucide-react';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { toast } from 'sonner';

interface PopularBet {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  selection: string;
  odds: number;
  percentage: number;
  betCount: number;
  timeRemaining: string;
}

const popularBets: PopularBet[] = [
  {
    id: 'pb1',
    homeTeam: 'Man City',
    awayTeam: 'Arsenal',
    league: 'Premier League',
    selection: 'Home Win',
    odds: 2.10,
    percentage: 78,
    betCount: 12453,
    timeRemaining: '2h 15m',
  },
  {
    id: 'pb2',
    homeTeam: 'Barcelona',
    awayTeam: 'Real Madrid',
    league: 'La Liga',
    selection: 'BTTS',
    odds: 1.70,
    percentage: 85,
    betCount: 18721,
    timeRemaining: '5h 30m',
  },
  {
    id: 'pb3',
    homeTeam: 'Liverpool',
    awayTeam: 'Chelsea',
    league: 'Premier League',
    selection: 'Over 2.5',
    odds: 1.85,
    percentage: 72,
    betCount: 9842,
    timeRemaining: '1h 45m',
  },
  {
    id: 'pb4',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Dortmund',
    league: 'Bundesliga',
    selection: 'Home Win',
    odds: 1.65,
    percentage: 81,
    betCount: 14235,
    timeRemaining: '3h 20m',
  },
];

const PopularBetsWidget = () => {
  const { addSelection } = useBetSlip();

  const handleAddBet = (bet: PopularBet) => {
    const selectionType = bet.selection.includes('Home') ? 'home' : 
                         bet.selection.includes('Away') ? 'away' : 
                         bet.selection.includes('Draw') ? 'draw' : 'home';
    
    addSelection({
      id: `${Date.now()}-${Math.random()}`,
      matchId: bet.id,
      homeTeam: bet.homeTeam,
      awayTeam: bet.awayTeam,
      sport: 'Football',
      league: bet.league,
      selectionType: selectionType,
      selectionValue: bet.selection,
      odds: bet.odds,
      matchTime: new Date(Date.now() + Math.random() * 86400000).toISOString(),
    });

    toast.success('Added to Bet Slip!', {
      description: `${bet.homeTeam} vs ${bet.awayTeam} - ${bet.selection}`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Trending Bets</h2>
        <Badge variant="secondary" className="ml-auto">Live</Badge>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {popularBets.map((bet) => (
          <Card key={bet.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">
                      {bet.homeTeam} vs {bet.awayTeam}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {bet.league}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {bet.timeRemaining}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {bet.betCount.toLocaleString()} bets
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{bet.selection}</span>
                    <span className="text-xs text-muted-foreground">
                      {bet.percentage}% backing this
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${bet.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{bet.odds}</div>
                  <div className="text-xs text-muted-foreground">odds</div>
                </div>
                <Button 
                  size="sm"
                  onClick={() => handleAddBet(bet)}
                  className="min-w-[80px]"
                >
                  Add
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        See what other bettors are backing right now • Updated live
      </p>
    </div>
  );
};

export default PopularBetsWidget;
