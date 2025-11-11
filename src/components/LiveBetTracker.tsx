import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Clock, CheckCircle, XCircle } from 'lucide-react';
import CashOutButton from './CashOutButton';

interface LiveBet {
  id: string;
  selections: string[];
  stake: number;
  potentialWin: number;
  currentValue: number;
  status: 'pending' | 'winning' | 'losing';
  timeElapsed: string;
  progress: number;
}

const LiveBetTracker = () => {
  const liveBets: LiveBet[] = [
    {
      id: 'bet1',
      selections: ['Man City Win', 'Over 2.5 Goals', 'Haaland To Score'],
      stake: 1000,
      potentialWin: 5240,
      currentValue: 2800,
      status: 'winning',
      timeElapsed: '45 min',
      progress: 67,
    },
    {
      id: 'bet2',
      selections: ['Barcelona Win', 'BTTS'],
      stake: 500,
      potentialWin: 1850,
      currentValue: 450,
      status: 'losing',
      timeElapsed: '72 min',
      progress: 80,
    },
    {
      id: 'bet3',
      selections: ['Liverpool Win', 'Salah To Score', 'Over 1.5 Goals'],
      stake: 2000,
      potentialWin: 6400,
      currentValue: 3200,
      status: 'winning',
      timeElapsed: '30 min',
      progress: 33,
    },
  ];

  const getStatusColor = (status: LiveBet['status']) => {
    switch (status) {
      case 'winning': return 'bg-green-500';
      case 'losing': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: LiveBet['status']) => {
    switch (status) {
      case 'winning': return <CheckCircle className="h-4 w-4" />;
      case 'losing': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Live Bet Tracker</h2>
        <Badge variant="secondary" className="ml-auto">
          {liveBets.length} Active
        </Badge>
      </div>

      <div className="space-y-3">
        {liveBets.map((bet) => (
          <Card key={bet.id} className="p-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(bet.status)}>
                    {getStatusIcon(bet.status)}
                  </Badge>
                  <span className="text-sm font-semibold capitalize">{bet.status}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{bet.timeElapsed}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Match Progress</span>
                  <span className="font-semibold">{bet.progress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getStatusColor(bet.status)}`}
                    style={{ width: `${bet.progress}%` }}
                  />
                </div>
              </div>

              {/* Selections */}
              <div className="space-y-1">
                {bet.selections.map((selection, idx) => (
                  <div key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                    {selection}
                  </div>
                ))}
              </div>

              {/* Values */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t">
                <div>
                  <div className="text-xs text-muted-foreground">Stake</div>
                  <div className="font-semibold">₦{bet.stake}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Current</div>
                  <div className={`font-semibold ${bet.status === 'winning' ? 'text-green-600' : 'text-red-600'}`}>
                    ₦{bet.currentValue}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Potential</div>
                  <div className="font-semibold text-primary">₦{bet.potentialWin}</div>
                </div>
              </div>

              {/* Cash Out */}
              <CashOutButton
                originalStake={bet.stake}
                currentValue={bet.currentValue}
                potentialWin={bet.potentialWin}
              />
            </div>
          </Card>
        ))}
      </div>

      {liveBets.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No live bets</p>
          <p className="text-xs mt-1">Place a bet to track it in real-time</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Track your active bets with live updates and cash-out options
      </p>
    </div>
  );
};

export default LiveBetTracker;
