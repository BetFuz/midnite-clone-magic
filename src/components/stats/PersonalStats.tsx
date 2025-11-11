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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card 
            key={index} 
            className="relative overflow-hidden p-6 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/30 hover:shadow-lg transition-all group"
          >
            <div className="relative z-10 flex flex-col">
              <div className={`p-3 ${stat.bgColor} rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-7 w-7 ${stat.color}`} />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide uppercase">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
              {stat.subValue && (
                <p className="text-xs text-muted-foreground">{stat.subValue}</p>
              )}
            </div>
            <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${stat.bgColor} rounded-full blur-2xl opacity-20`} />
          </Card>
        ))}
      </div>

      {/* Detailed Stats */}
      <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-card via-card/80 to-card/50 border-border/50 shadow-lg">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-foreground mb-8 tracking-tight">Betting Summary</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Staked</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.totalStaked)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Returns</p>
              <p className="text-3xl font-bold text-success">{formatCurrency(stats.totalReturns)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Biggest Win</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(stats.biggestWin)}</p>
            </div>
          </div>

          {stats.favoriteSport && (
            <div className="mt-8 pt-8 border-t border-border/50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Favorite Sport</p>
                <Badge variant="secondary" className="text-sm py-2 px-4 bg-primary/10 text-primary border-primary/20">
                  <Award className="h-4 w-4 mr-2" />
                  {stats.favoriteSport}
                </Badge>
              </div>
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </Card>
    </div>
  );
};
