import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { Trophy, Calendar, TrendingUp, Award, BarChart, ArrowLeft } from "lucide-react";

interface HistoricalEntry {
  id: string;
  contest_name: string;
  entry_fee: number;
  prize_won: number;
  current_rank: number;
  current_points: number;
  total_entries: number;
  completed_at: string;
  status: string;
}

export default function ContestHistory() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<HistoricalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalContests: 0,
    totalWinnings: 0,
    averageRank: 0,
    winRate: 0,
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("fantasy_contest_entries")
        .select(`
          *,
          contest:fantasy_contests(name, entry_fee, status, max_entries)
        `)
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedEntries = data?.map((entry: any) => ({
        id: entry.id,
        contest_name: entry.contest?.name || "Unknown Contest",
        entry_fee: entry.contest?.entry_fee || 0,
        prize_won: entry.prize_won || 0,
        current_rank: entry.current_rank || 0,
        current_points: entry.current_points || 0,
        total_entries: entry.contest?.max_entries || 0,
        completed_at: entry.updated_at,
        status: entry.contest?.status || "unknown",
      })) || [];

      setEntries(formattedEntries);

      // Calculate stats
      const completed = formattedEntries.filter((e: HistoricalEntry) => e.status === "completed");
      const totalWinnings = completed.reduce((sum: number, e: HistoricalEntry) => sum + e.prize_won, 0);
      const avgRank = completed.length > 0
        ? completed.reduce((sum: number, e: HistoricalEntry) => sum + e.current_rank, 0) / completed.length
        : 0;
      const wins = completed.filter((e: HistoricalEntry) => e.prize_won > e.entry_fee).length;
      const winRate = completed.length > 0 ? (wins / completed.length) * 100 : 0;

      setStats({
        totalContests: formattedEntries.length,
        totalWinnings,
        averageRank: avgRank,
        winRate,
      });
    } catch (error) {
      console.error("Error loading history:", error);
      toast.error("Failed to load contest history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "completed") return "bg-green-500";
    if (status === "live") return "bg-yellow-500 animate-pulse";
    return "bg-gray-500";
  };

  const getRankColor = (rank: number, total: number) => {
    const percentile = (rank / total) * 100;
    if (percentile <= 10) return "text-yellow-500";
    if (percentile <= 25) return "text-green-500";
    if (percentile <= 50) return "text-blue-500";
    return "text-gray-500";
  };

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-8 text-white shadow-2xl">
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
            <Calendar className="w-10 h-10" />
            Contest History
          </h1>
          <p className="text-white/90 text-lg">Your complete fantasy performance record</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-purple-500/10">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-primary" />
            <div className="text-3xl font-bold">{stats.totalContests}</div>
          </div>
          <div className="text-sm text-muted-foreground">Total Contests</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-green-600" />
            <div className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalWinnings)}</div>
          </div>
          <div className="text-sm text-muted-foreground">Total Winnings</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
          <div className="flex items-center gap-3 mb-2">
            <BarChart className="w-8 h-8 text-blue-600" />
            <div className="text-3xl font-bold text-blue-600">#{stats.averageRank.toFixed(0)}</div>
          </div>
          <div className="text-sm text-muted-foreground">Average Rank</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-yellow-600" />
            <div className="text-3xl font-bold text-yellow-600">{stats.winRate.toFixed(0)}%</div>
          </div>
          <div className="text-sm text-muted-foreground">Win Rate</div>
        </Card>
      </div>

      {/* Contest Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading history...</p>
            </div>
          ) : entries.length === 0 ? (
            <Card className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No contest history yet</p>
              <Button
                onClick={() => navigate("/fantasy-sports/contests")}
                className="mt-4"
              >
                Browse Contests
              </Button>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id} className="p-6 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(entry.status)}>
                        {entry.status.toUpperCase()}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold">{entry.contest_name}</h3>
                    <div className="text-sm text-muted-foreground">
                      {new Date(entry.completed_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-right">
                    {entry.prize_won > 0 ? (
                      <div className="text-2xl font-bold text-green-600">
                        +{formatCurrency(entry.prize_won)}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-red-600">
                        -{formatCurrency(entry.entry_fee)}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {entry.prize_won > entry.entry_fee ? "Profit" : "Loss"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Rank</div>
                    <div className={`text-lg font-bold ${getRankColor(entry.current_rank, entry.total_entries)}`}>
                      #{entry.current_rank} / {entry.total_entries}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Points</div>
                    <div className="text-lg font-bold">{entry.current_points.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Entry Fee</div>
                    <div className="text-lg font-bold">{formatCurrency(entry.entry_fee)}</div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed">
          <p className="text-center py-12 text-muted-foreground">Filter coming soon</p>
        </TabsContent>

        <TabsContent value="live">
          <p className="text-center py-12 text-muted-foreground">Filter coming soon</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
