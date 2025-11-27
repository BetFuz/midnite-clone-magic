import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Shield } from 'lucide-react';

interface EnhancedGameStatsProps {
  balance: number;
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  biggestWin: number;
  winStreak: number;
  fairnessScore?: number;
}

export const EnhancedGameStats = ({
  balance,
  totalGames,
  gamesWon,
  gamesLost,
  biggestWin,
  winStreak,
  fairnessScore = 0.95
}: EnhancedGameStatsProps) => {
  const winRate = totalGames > 0 ? ((gamesWon / totalGames) * 100).toFixed(1) : '0.0';

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-4 hover:shadow-xl transition-all duration-300 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="text-2xl font-bold text-primary animate-scale-in">₦{balance.toLocaleString()}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Win Rate</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-emerald-500">{winRate}%</p>
            {parseFloat(winRate) > 50 ? (
              <TrendingUp className="w-5 h-5 text-emerald-500 animate-pulse" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Biggest Win</p>
          <p className="text-2xl font-bold text-yellow-500">₦{biggestWin.toLocaleString()}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Fairness
            <Shield className="w-3 h-3" />
          </p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-emerald-500">{(fairnessScore * 100).toFixed(0)}%</p>
            <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500">
              Verified
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total Games</p>
          <p className="text-lg font-semibold text-foreground">{totalGames}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Wins</p>
          <p className="text-lg font-semibold text-emerald-500">{gamesWon}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Win Streak</p>
          <p className="text-lg font-semibold text-yellow-500">🔥 {winStreak}</p>
        </div>
      </div>
    </Card>
  );
};
