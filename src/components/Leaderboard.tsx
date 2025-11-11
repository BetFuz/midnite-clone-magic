import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useUserProfile } from "@/hooks/useUserProfile";

export const Leaderboard = () => {
  const { leaderboard, isLoading } = useLeaderboard();
  const { user } = useUserProfile();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-bold">#{rank}</span>;
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
      <Badge variant="outline" className={tierColors[tier.toLowerCase()] || ""}>
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
            Weekly Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Weekly Leaderboard
          <Badge variant="secondary" className="ml-auto">
            This Week
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No leaderboard entries yet this week.</p>
              <p className="text-sm mt-1">Place bets to start competing!</p>
            </div>
          ) : (
            leaderboard.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  entry.userId === user?.id
                    ? "bg-primary/10 border-primary/50"
                    : "bg-muted/30 border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-center w-10">
                  {getRankIcon(entry.rank)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground truncate">
                      {entry.userFullName || entry.userEmail || "Anonymous"}
                    </p>
                    {entry.rewardTier && getTierBadge(entry.rewardTier)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>{entry.totalBets} bets</span>
                    <span>•</span>
                    <span>{entry.totalWins} wins</span>
                    {entry.winStreak > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-success">
                          🔥 {entry.winStreak} streak
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-bold text-primary">
                    <TrendingUp className="h-4 w-4" />
                    {entry.totalPoints.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
