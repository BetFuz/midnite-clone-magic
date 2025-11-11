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
    <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-card via-card/80 to-card/50 border-border/50 shadow-lg">
      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-foreground mb-8 tracking-tight">Performance by Sport</h3>
        <div className="space-y-8">
          {stats.map((sport, index) => (
            <div key={index} className="group p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-foreground mb-1">{sport.sport}</h4>
                  <p className="text-sm text-muted-foreground">
                    {sport.betsPlaced} bets • {sport.betsWon} wins
                  </p>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-2 text-xl font-bold ${
                    sport.profitLoss >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {sport.profitLoss >= 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    {formatCurrency(Math.abs(sport.profitLoss))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {sport.winRate.toFixed(1)}% win rate
                  </p>
                </div>
              </div>
              <Progress value={sport.winRate} className="h-3 bg-muted/50" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Staked: <span className="font-semibold text-foreground">{formatCurrency(sport.totalStaked)}</span>
                </span>
                <span className="text-muted-foreground">
                  Returns: <span className="font-semibold text-success">{formatCurrency(sport.totalReturns)}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
    </Card>
  );
};
