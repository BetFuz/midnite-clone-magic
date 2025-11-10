import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users } from "lucide-react";

interface BettingTrend {
  selectionType: string;
  selectionValue: string;
  betCount: number;
  percentage: number;
}

interface BettingTrendsProps {
  trends: BettingTrend[];
}

export const BettingTrends = ({ trends }: BettingTrendsProps) => {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Betting Trends</h3>
      </div>

      <div className="space-y-4">
        {trends.map((trend, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">
                  {trend.selectionValue}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({trend.selectionType})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {trend.betCount.toLocaleString()} bets
                </span>
                <span className="text-sm font-bold text-primary">
                  {trend.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress value={trend.percentage} className="h-2" />
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          Based on {trends.reduce((sum, t) => sum + t.betCount, 0).toLocaleString()} total bets placed
        </p>
      </div>
    </Card>
  );
};
