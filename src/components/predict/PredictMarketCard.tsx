import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, Users } from 'lucide-react';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { toast } from 'sonner';

interface Market {
  outcome: string;
  odds: number;
  votes: number;
}

interface PredictMarket {
  id: string;
  title: string;
  category: string;
  deadline: string;
  totalVotes: number;
  markets: Market[];
}

interface Props {
  market: PredictMarket;
}

const PredictMarketCard = ({ market }: Props) => {
  const { addSelection } = useBetSlip();

  const handleAddToBetSlip = (outcome: string, odds: number) => {
    addSelection({
      id: `${market.id}-${outcome}`,
      matchId: market.id,
      sport: 'Predict',
      league: market.category,
      homeTeam: market.title,
      awayTeam: '',
      matchTime: market.deadline,
      selectionType: 'other',
      selectionValue: outcome,
      odds: odds,
    });

    toast.success('Added to Bet Slip!', {
      description: `${outcome} @ ${odds.toFixed(2)}`,
    });
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const daysUntilDeadline = () => {
    const now = new Date();
    const deadline = new Date(market.deadline);
    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const days = daysUntilDeadline();

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {market.category}
              </Badge>
              {days > 0 && days <= 30 && (
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Closing Soon
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg mb-2">{market.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{formatNumber(market.totalVotes)} votes</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Closes: {formatDeadline(market.deadline)}</span>
              </div>
              {days > 0 && (
                <span className="text-xs">({days} days)</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Prediction Options:
          </div>
          <div className="grid gap-3">
            {market.markets.map((m, index) => {
              const percentage = ((m.votes / market.totalVotes) * 100).toFixed(1);
              
              return (
                <div
                  key={index}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{m.outcome}</span>
                        <Button
                          size="sm"
                          onClick={() => handleAddToBetSlip(m.outcome, m.odds)}
                          className="min-w-[70px]"
                        >
                          {m.odds.toFixed(2)}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <span>{percentage}% of votes</span>
                        <span>•</span>
                        <span>{formatNumber(m.votes)} votes</span>
                      </div>
                      <Progress value={parseFloat(percentage)} className="h-1.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PredictMarketCard;
