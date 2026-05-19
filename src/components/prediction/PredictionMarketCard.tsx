import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Outcome {
  id: string;
  name: string;
  odds: number;
}

interface PredictionMarketCardProps {
  market: {
    id: string;
    title: string;
    description?: string;
    type?: string;
    closeDate: string | Date;
    outcomes: Outcome[];
  };
  categoryColor?: string;
  categoryLabel?: string;
  onPlaceBet: (outcomeId: string, outcomeName: string, odds: number, stake: number) => Promise<void>;
  isPlacing?: boolean;
}

export function PredictionMarketCard({
  market,
  categoryColor = 'blue',
  categoryLabel,
  onPlaceBet,
  isPlacing = false,
}: PredictionMarketCardProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | null>(null);
  const [stake, setStake] = useState('');
  const [expanded, setExpanded] = useState(false);

  const closeDate = new Date(market.closeDate);
  const isClosed = closeDate < new Date();
  const timeLeft = formatDistanceToNow(closeDate, { addSuffix: true });
  const stakeNum = parseFloat(stake) || 0;
  const potential = selectedOutcome ? (stakeNum * selectedOutcome.odds).toFixed(2) : '0.00';

  const colorMap: Record<string, string> = {
    blue:   'bg-blue-500/10 text-blue-500 border-blue-500/20',
    green:  'bg-green-500/10 text-green-500 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  };

  const buttonColorMap: Record<string, string> = {
    blue:   'ring-blue-500 border-blue-500 bg-blue-500/10',
    green:  'ring-green-500 border-green-500 bg-green-500/10',
    purple: 'ring-purple-500 border-purple-500 bg-purple-500/10',
    orange: 'ring-orange-500 border-orange-500 bg-orange-500/10',
    yellow: 'ring-yellow-500 border-yellow-500 bg-yellow-500/10',
  };

  const handleBet = async () => {
    if (!selectedOutcome || stakeNum <= 0) return;
    await onPlaceBet(selectedOutcome.id, selectedOutcome.name, selectedOutcome.odds, stakeNum);
    setSelectedOutcome(null);
    setStake('');
    setExpanded(false);
  };

  return (
    <Card className={cn(
      'hover:border-primary/30 transition-colors',
      isClosed && 'opacity-60'
    )}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {categoryLabel && (
              <Badge variant="outline" className={cn('text-[10px] mb-1', colorMap[categoryColor] || colorMap.blue)}>
                {categoryLabel}
              </Badge>
            )}
            <h3 className="text-sm font-semibold leading-snug">{market.title}</h3>
            {market.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{market.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {isClosed ? 'Closed' : `Closes ${timeLeft}`}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        {/* Outcome buttons */}
        <div className={cn(
          'grid gap-2',
          market.outcomes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
        )}>
          {market.outcomes.map((outcome) => (
            <button
              key={outcome.id}
              disabled={isClosed}
              onClick={() => {
                setSelectedOutcome(outcome.id === selectedOutcome?.id ? null : outcome);
                setExpanded(true);
              }}
              className={cn(
                'flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium',
                'transition-all hover:border-primary/50',
                selectedOutcome?.id === outcome.id
                  ? cn('border-2', buttonColorMap[categoryColor] || buttonColorMap.blue)
                  : 'border-border bg-muted/30 hover:bg-muted/60',
                isClosed && 'cursor-not-allowed'
              )}
            >
              <span className="text-muted-foreground text-[11px] leading-none mb-0.5">{outcome.name}</span>
              <span className="text-base font-bold">{outcome.odds.toFixed(2)}</span>
            </button>
          ))}
        </div>

        {/* Bet slip — shown when outcome selected */}
        {selectedOutcome && expanded && !isClosed && (
          <div className="mt-3 p-3 rounded-lg border border-border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Selected: <strong className="text-foreground">{selectedOutcome.name}</strong> @ <strong>{selectedOutcome.odds.toFixed(2)}</strong></span>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Stake (₦)"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                min={100}
                className="h-8 text-xs"
              />
              <Button
                size="sm"
                className="h-8 px-3 text-xs whitespace-nowrap"
                disabled={stakeNum <= 0 || isPlacing}
                onClick={handleBet}
              >
                {isPlacing ? '...' : `Win ₦${Number(potential).toLocaleString()}`}
              </Button>
            </div>
            {stakeNum > 0 && (
              <p className="text-[11px] text-muted-foreground">
                Stake ₦{stakeNum.toLocaleString()} · Potential win ₦{Number(potential).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
