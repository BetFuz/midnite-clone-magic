import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { Trophy, TrendingUp, Users, ArrowLeft, Medal, Crown } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  user_id: string;
  entry_number: number;
  current_rank: number;
  current_points: number;
  prize_won: number;
  lineup_name: string;
  user_email: string;
}

export default function LiveLeaderboard() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [contestName, setContestName] = useState("");
  const [prizePool, setPrizePool] = useState(0);

  useEffect(() => {
    if (contestId) {
      loadLeaderboard();
      // Real-time subscription
      const subscription = supabase
        .channel(`contest_${contestId}_leaderboard`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "fantasy_contest_entries",
            filter: `contest_id=eq.${contestId}`,
          },
          () => {
            loadLeaderboard();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [contestId]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Get contest details
      const { data: contest } = await supabase
        .from("fantasy_contests")
        .select("name, prize_pool")
        .eq("id", contestId)
        .single();

      if (contest) {
        setContestName(contest.name);
        setPrizePool(contest.prize_pool);
      }

      // Get leaderboard entries with user info
      const { data, error } = await supabase
        .from("fantasy_contest_entries")
        .select(`
          *,
          lineup:fantasy_lineups(lineup_name),
          user:profiles(email)
        `)
        .eq("contest_id", contestId)
        .order("current_rank", { ascending: true });

      if (error) throw error;

      const formattedEntries = data?.map((entry: any) => ({
        id: entry.id,
        user_id: entry.user_id,
        entry_number: entry.entry_number,
        current_rank: entry.current_rank || 999,
        current_points: entry.current_points || 0,
        prize_won: entry.prize_won || 0,
        lineup_name: entry.lineup?.lineup_name || "My Lineup",
        user_email: entry.user?.email || "Anonymous",
      })) || [];

      setEntries(formattedEntries);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-400";
    if (rank === 3) return "bg-gradient-to-r from-orange-400 to-orange-500";
    if (rank <= 10) return "bg-gradient-to-r from-green-500/20 to-emerald-500/20";
    return "bg-card";
  };

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10" />
            Live Leaderboard
          </h1>
          <p className="text-white/90 text-lg mb-4">{contestName}</p>
          
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm text-white/80">Prize Pool</div>
              <div className="text-3xl font-bold">{formatCurrency(prizePool)}</div>
            </div>
            <div>
              <div className="text-sm text-white/80">Entries</div>
              <div className="text-3xl font-bold">{entries.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-purple-500/5">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Rankings
          </h2>
        </div>

        <div className="divide-y">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading rankings...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No entries yet</p>
            </div>
          ) : (
            entries.map((entry, idx) => (
              <div
                key={entry.id}
                className={`p-4 transition-all hover:scale-[1.01] ${getRankColor(entry.current_rank)}`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-16 flex-shrink-0 flex items-center justify-center">
                    {getRankBadge(entry.current_rank) || (
                      <div className="text-3xl font-bold text-muted-foreground">
                        #{entry.current_rank}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">
                      {entry.user_email.split('@')[0]}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {entry.lineup_name}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {entry.current_points.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>

                  {/* Prize */}
                  {entry.prize_won > 0 && (
                    <div className="text-right">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                        {formatCurrency(entry.prize_won)}
                      </Badge>
                    </div>
                  )}

                  {/* Movement Indicator */}
                  <div className="w-8 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Auto-refresh indicator */}
      <div className="text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live updates enabled
        </div>
      </div>
    </div>
  );
}
