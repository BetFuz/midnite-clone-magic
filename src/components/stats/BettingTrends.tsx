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
    <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-card via-card/80 to-card/50 border-border/50 shadow-lg">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground tracking-tight">Betting Trends</h3>
        </div>

        <div className="space-y-6">
          {trends.map((trend, index) => (
            <div key={index} className="group p-5 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-base font-bold text-foreground block">
                      {trend.selectionValue}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {trend.selectionType}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground block mb-1">
                    {trend.betCount.toLocaleString()} bets
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {trend.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Progress value={trend.percentage} className="h-3 bg-muted/50" />
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
          <p className="text-sm text-center text-muted-foreground">
            📊 Based on <span className="font-bold text-foreground">{trends.reduce((sum, t) => sum + t.betCount, 0).toLocaleString()}</span> total bets placed
          </p>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
    </Card>
  );
};
