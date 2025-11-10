import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SportStat {
  sport: string;
  betsPlaced: number;
  betsWon: number;
  totalStaked: number;
  totalReturns: number;
  profitLoss: number;
  winRate: number;
}

interface SportStatsProps {
  stats: SportStat[];
}

export const SportStats = ({ stats }: SportStatsProps) => {
  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-xl font-bold text-foreground mb-6">Performance by Sport</h3>
      <div className="space-y-6">
        {stats.map((sport, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-foreground">{sport.sport}</h4>
                <p className="text-sm text-muted-foreground">
                  {sport.betsPlaced} bets • {sport.betsWon} wins
                </p>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 font-bold ${
                  sport.profitLoss >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {sport.profitLoss >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {formatCurrency(Math.abs(sport.profitLoss))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {sport.winRate.toFixed(1)}% win rate
                </p>
              </div>
            </div>
            <Progress value={sport.winRate} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Staked: {formatCurrency(sport.totalStaked)}</span>
              <span>Returns: {formatCurrency(sport.totalReturns)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
