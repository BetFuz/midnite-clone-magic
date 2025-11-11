import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface OddsHistory {
  timestamp: string;
  odds: number;
}

interface OddsMovement {
  selection: string;
  currentOdds: number;
  openingOdds: number;
  trend: 'up' | 'down' | 'stable';
  history: OddsHistory[];
}

const OddsMovementTracker = () => {
  const movements: OddsMovement[] = [
    {
      selection: 'Man City Win',
      currentOdds: 2.10,
      openingOdds: 2.35,
      trend: 'down',
      history: [
        { timestamp: '08:00', odds: 2.35 },
        { timestamp: '10:00', odds: 2.30 },
        { timestamp: '12:00', odds: 2.25 },
        { timestamp: '14:00', odds: 2.10 },
      ],
    },
    {
      selection: 'Arsenal Win',
      currentOdds: 3.60,
      openingOdds: 3.20,
      trend: 'up',
      history: [
        { timestamp: '08:00', odds: 3.20 },
        { timestamp: '10:00', odds: 3.30 },
        { timestamp: '12:00', odds: 3.50 },
        { timestamp: '14:00', odds: 3.60 },
      ],
    },
    {
      selection: 'Draw',
      currentOdds: 3.30,
      openingOdds: 3.40,
      trend: 'down',
      history: [
        { timestamp: '08:00', odds: 3.40 },
        { timestamp: '10:00', odds: 3.35 },
        { timestamp: '12:00', odds: 3.32 },
        { timestamp: '14:00', odds: 3.30 },
      ],
    },
  ];

  const getTrendIcon = (trend: OddsMovement['trend']) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getTrendColor = (trend: OddsMovement['trend']) => {
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getChangePercentage = (current: number, opening: number) => {
    const change = ((current - opening) / opening) * 100;
    return change.toFixed(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Odds Movement</h2>
        <Badge variant="secondary" className="ml-auto">Live Tracking</Badge>
      </div>

      <div className="space-y-3">
        {movements.map((movement) => (
          <Card key={movement.selection} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-1">
                <h3 className="font-semibold">{movement.selection}</h3>
                <div className="flex items-center gap-2">
                  {getTrendIcon(movement.trend)}
                  <span className={`text-xs font-semibold ${getTrendColor(movement.trend)}`}>
                    {movement.trend === 'up' ? '+' : ''}{getChangePercentage(movement.currentOdds, movement.openingOdds)}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{movement.currentOdds}</div>
                <div className="text-xs text-muted-foreground line-through">
                  {movement.openingOdds}
                </div>
              </div>
            </div>

            {/* Simple chart visualization */}
            <div className="relative h-16 flex items-end gap-1">
              {movement.history.map((point, idx) => {
                const maxOdds = Math.max(...movement.history.map(h => h.odds));
                const minOdds = Math.min(...movement.history.map(h => h.odds));
                const range = maxOdds - minOdds;
                const height = range === 0 ? 50 : ((point.odds - minOdds) / range) * 100;
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className={`w-full rounded-t transition-all ${
                        movement.trend === 'up' ? 'bg-green-500/30' : 
                        movement.trend === 'down' ? 'bg-red-500/30' : 
                        'bg-muted'
                      }`}
                      style={{ height: `${height}%`, minHeight: '8px' }}
                    />
                    <span className="text-[10px] text-muted-foreground">{point.timestamp}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Track how odds change over time • Opening odds vs current
      </p>
    </div>
  );
};

export default OddsMovementTracker;
