import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp } from 'lucide-react';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { toast } from 'sonner';

interface Market {
  outcome: string;
  odds: number;
}

interface PoliticalMarket {
  id: string;
  title: string;
  category: string;
  deadline: string;
  markets: Market[];
}

interface Props {
  market: PoliticalMarket;
}

const PoliticalMarketCard = ({ market }: Props) => {
  const { addSelection } = useBetSlip();

  const handleAddToBetSlip = (outcome: string, odds: number) => {
    addSelection({
      id: `${market.id}-${outcome}`,
      matchId: market.id,
      sport: 'Politics',
      league: market.category,
      homeTeam: market.title,
      awayTeam: '',
      matchTime: market.deadline,
      selectionType: 'politics',
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Closes: {formatDeadline(market.deadline)}</span>
              {days > 0 && (
                <span className="text-xs">({days} days)</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Markets Available:
          </div>
          <div className="grid gap-2">
            {market.markets.map((m, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <span className="font-medium">{m.outcome}</span>
                <Button
                  size="sm"
                  onClick={() => handleAddToBetSlip(m.outcome, m.odds)}
                  className="min-w-[70px]"
                >
                  {m.odds.toFixed(2)}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PoliticalMarketCard;
