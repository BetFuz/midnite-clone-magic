import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Trophy, Medal, Award, TrendingUp, Flame, Sparkles } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

export const Leaderboard = () => {
  const { leaderboard, isLoading } = useLeaderboard();
  const { user } = useUserProfile();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return (
      <div className="relative">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
      </div>
    );
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return "bg-primary/10 border-primary/50 ring-2 ring-primary/20";
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-yellow-500/30";
    if (rank === 2) return "bg-gradient-to-r from-gray-400/10 to-gray-500/5 border-gray-400/30";
    if (rank === 3) return "bg-gradient-to-r from-amber-600/10 to-amber-700/5 border-amber-600/30";
    return "bg-muted/30 border-border hover:bg-muted/50";
  };

  const getTierBadge = (tier: string | null) => {
    if (!tier) return null;
    
    const tierColors: Record<string, string> = {
      diamond: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      platinum: "bg-gray-400/20 text-gray-300 border-gray-400/50",
      gold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      silver: "bg-gray-300/20 text-gray-200 border-gray-300/50",
      bronze: "bg-amber-700/20 text-amber-600 border-amber-700/50",
    };

    return (
      <Badge variant="outline" className={`text-xs ${tierColors[tier.toLowerCase()] || ""}`}>
        {tier}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span>Top Rankings</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {leaderboard.length} Players
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="font-semibold mb-1">No rankings yet</p>
              <p className="text-sm">Place bets to start competing!</p>
            </div>
          ) : (
            leaderboard.map((entry, index) => {
              const isCurrentUser = entry.userId === user?.id;
              const isTopThree = entry.rank <= 3;
              
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 p-3 md:p-4 rounded-lg border transition-all ${getRankBg(entry.rank, isCurrentUser)} ${
                    isTopThree ? "shadow-sm" : ""
                  }`}
                >
                  {/* Rank Icon/Number */}
                  <div className="flex items-center justify-center w-10 shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-semibold truncate ${isTopThree ? "text-foreground" : "text-foreground"}`}>
                        {entry.userFullName || entry.userEmail?.split('@')[0] || "Player"}
                      </p>
                      {isCurrentUser && (
                        <Badge variant="default" className="text-xs">You</Badge>
                      )}
                      {entry.rewardTier && getTierBadge(entry.rewardTier)}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-2 md:gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="hidden sm:inline">Bets:</span>
                        <span className="font-medium text-foreground">{entry.totalBets}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="hidden sm:inline">Wins:</span>
                        <span className="font-medium text-success">{entry.totalWins}</span>
                      </span>
                      {entry.winStreak > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-orange-500">
                            <Flame className="h-3 w-3" />
                            <span className="font-medium">{entry.winStreak}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right shrink-0">
                    <div className={`flex items-center gap-1 font-bold ${
                      isTopThree ? "text-primary text-lg" : "text-primary"
                    }`}>
                      <TrendingUp className="h-4 w-4" />
                      <span>{entry.totalPoints.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
