import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Award, Zap, Trophy } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface PersonalStatsProps {
  stats: {
    totalBets: number;
    totalWins: number;
    totalLosses: number;
    totalPending: number;
    totalStaked: number;
    totalReturns: number;
    profitLoss: number;
    winRate: number;
    roi: number;
    favoriteSport?: string;
    biggestWin: number;
    currentStreak: number;
    bestStreak: number;
  };
}

export const PersonalStats = ({ stats }: PersonalStatsProps) => {
  const statCards = [
    {
      icon: Target,
      label: "Total Bets",
      value: stats.totalBets.toString(),
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Trophy,
      label: "Wins",
      value: stats.totalWins.toString(),
      subValue: `${stats.winRate.toFixed(1)}% win rate`,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      icon: stats.profitLoss >= 0 ? TrendingUp : TrendingDown,
      label: "Profit/Loss",
      value: formatCurrency(Math.abs(stats.profitLoss)),
      subValue: `${stats.roi.toFixed(1)}% ROI`,
      color: stats.profitLoss >= 0 ? "text-success" : "text-destructive",
      bgColor: stats.profitLoss >= 0 ? "bg-success/10" : "bg-destructive/10"
    },
    {
      icon: Zap,
      label: "Current Streak",
      value: `${stats.currentStreak} ${stats.currentStreak >= 0 ? 'W' : 'L'}`,
      subValue: `Best: ${stats.bestStreak}`,
      color: stats.currentStreak >= 0 ? "text-success" : "text-destructive",
      bgColor: "bg-accent/10"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6 bg-card border-border hover:border-primary/30 transition-all">
            <div className="flex flex-col">
              <div className={`p-3 ${stat.bgColor} rounded-lg w-fit mb-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              {stat.subValue && (
                <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Stats */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Betting Summary</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Total Staked</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalStaked)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Total Returns</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(stats.totalReturns)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Biggest Win</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(stats.biggestWin)}</p>
          </div>
        </div>

        {stats.favoriteSport && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Favorite Sport</p>
              <Badge variant="secondary" className="text-sm">
                <Award className="h-3 w-3 mr-1" />
                {stats.favoriteSport}
              </Badge>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
