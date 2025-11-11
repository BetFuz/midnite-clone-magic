import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, TrendingUp } from 'lucide-react';

interface MultiBetBonusProps {
  selectionCount: number;
  originalOdds: number;
  stake: number;
}

const MultiBetBonus = ({ selectionCount, originalOdds, stake }: MultiBetBonusProps) => {
  const getBonusPercentage = (count: number): number => {
    if (count >= 20) return 100;
    if (count >= 15) return 60;
    if (count >= 10) return 35;
    if (count >= 8) return 25;
    if (count >= 6) return 15;
    if (count >= 5) return 10;
    if (count >= 4) return 5;
    return 0;
  };

  const bonusPercentage = getBonusPercentage(selectionCount);
  
  if (bonusPercentage === 0) return null;

  const boostedOdds = originalOdds * (1 + bonusPercentage / 100);
  const bonusAmount = (boostedOdds * stake) - (originalOdds * stake);

  return (
    <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 p-1.5">
            <Gift className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold">Multi-Bet Bonus</h3>
          <Badge className="ml-auto bg-gradient-to-r from-green-500 to-emerald-500">
            +{bonusPercentage}%
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Original Odds</span>
            <span className="font-semibold line-through">{originalOdds.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Boosted Odds</span>
            <span className="text-xl font-bold text-green-600">{boostedOdds.toFixed(2)}</span>
          </div>

          <div className="pt-2 border-t border-green-500/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-green-600">Extra Winnings</span>
              <span className="text-lg font-bold text-green-600">₦{bonusAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span>Add more selections to increase your bonus up to 100%!</span>
        </div>

        {/* Bonus Scale */}
        <div className="space-y-1">
          <div className="text-xs font-semibold mb-2">Bonus Scale</div>
          <div className="grid grid-cols-4 gap-1 text-[10px]">
            <div className={`p-1 rounded text-center ${selectionCount >= 5 ? 'bg-green-500/20 text-green-600 font-semibold' : 'bg-muted text-muted-foreground'}`}>
              5+ • 10%
            </div>
            <div className={`p-1 rounded text-center ${selectionCount >= 8 ? 'bg-green-500/20 text-green-600 font-semibold' : 'bg-muted text-muted-foreground'}`}>
              8+ • 25%
            </div>
            <div className={`p-1 rounded text-center ${selectionCount >= 10 ? 'bg-green-500/20 text-green-600 font-semibold' : 'bg-muted text-muted-foreground'}`}>
              10+ • 35%
            </div>
            <div className={`p-1 rounded text-center ${selectionCount >= 15 ? 'bg-green-500/20 text-green-600 font-semibold' : 'bg-muted text-muted-foreground'}`}>
              15+ • 60%
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MultiBetBonus;
