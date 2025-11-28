import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { Trophy, Users, Clock, TrendingUp, Filter, Search, Star } from "lucide-react";

interface Contest {
  id: string;
  name: string;
  entry_fee: number;
  prize_pool: number;
  max_entries: number;
  current_entries: number;
  allows_multi_entry: boolean;
  max_entries_per_user: number;
  is_beginner_only: boolean;
  starts_at: string;
  contest_type_id: string;
}

export default function ContestLobby() {
  const navigate = useNavigate();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "low" | "high">("all");
  const [sizeFilter, setSizeFilter] = useState<"all" | "h2h" | "small" | "large">("all");
  const [showBeginner, setShowBeginner] = useState(false);

  useEffect(() => {
    loadContests();
  }, []);

  const loadContests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("fantasy_contests")
        .select("*")
        .eq("status", "open")
        .order("starts_at", { ascending: true });

      if (error) throw error;
      setContests(data || []);
    } catch (error) {
      console.error("Error loading contests:", error);
      toast.error("Failed to load contests");
    } finally {
      setLoading(false);
    }
  };

  const filteredContests = contests.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = 
      priceFilter === "all" ||
      (priceFilter === "free" && c.entry_fee === 0) ||
      (priceFilter === "low" && c.entry_fee > 0 && c.entry_fee <= 5000) ||
      (priceFilter === "high" && c.entry_fee > 5000);
    const matchesSize =
      sizeFilter === "all" ||
      (sizeFilter === "h2h" && c.max_entries === 2) ||
      (sizeFilter === "small" && c.max_entries > 2 && c.max_entries <= 100) ||
      (sizeFilter === "large" && c.max_entries > 100);
    const matchesBeginner = !showBeginner || c.is_beginner_only;

    return matchesSearch && matchesPrice && matchesSize && matchesBeginner;
  });

  const getFillPercentage = (contest: Contest) => {
    return (contest.current_entries / contest.max_entries) * 100;
  };

  const getContestBadge = (contest: Contest) => {
    if (contest.is_beginner_only) return <Badge className="bg-green-500">Beginner</Badge>;
    if (contest.max_entries === 2) return <Badge variant="outline">H2H</Badge>;
    if (contest.max_entries >= 1000) return <Badge className="bg-purple-500">GPP</Badge>;
    return <Badge variant="secondary">50/50</Badge>;
  };

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10" />
            Contest Lobby
          </h1>
          <p className="text-white/80 text-lg">Find your perfect contest and compete for prizes</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold">
            <Filter className="w-5 h-5" />
            Filters
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search contests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as any)}
              className="px-3 py-2 rounded-md border bg-background"
            >
              <option value="all">All Entry Fees</option>
              <option value="free">Free</option>
              <option value="low">Low (≤₦5,000)</option>
              <option value="high">High (&gt;₦5,000)</option>
            </select>

            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value as any)}
              className="px-3 py-2 rounded-md border bg-background"
            >
              <option value="all">All Sizes</option>
              <option value="h2h">Head-to-Head</option>
              <option value="small">Small (≤100)</option>
              <option value="large">Large (&gt;100)</option>
            </select>

            <Button
              variant={showBeginner ? "default" : "outline"}
              onClick={() => setShowBeginner(!showBeginner)}
              className="gap-2"
            >
              <Star className="w-4 h-4" />
              Beginner Only
            </Button>
          </div>
        </div>
      </Card>

      {/* Contest Tabs */}
      <Tabs defaultValue="featured" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="beginner">Beginner</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading contests...</p>
            </div>
          ) : filteredContests.length === 0 ? (
            <Card className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No contests match your filters</p>
            </Card>
          ) : (
            filteredContests.map((contest) => (
              <Card
                key={contest.id}
                className="p-6 hover:shadow-xl transition-all cursor-pointer group hover:scale-[1.01]"
                onClick={() => navigate(`/fantasy-sports/contests/${contest.id}/enter`)}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getContestBadge(contest)}
                        {contest.allows_multi_entry && (
                          <Badge variant="outline">Multi-Entry</Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {contest.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(contest.prize_pool)}
                      </div>
                      <div className="text-sm text-muted-foreground">Prize Pool</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{formatCurrency(contest.entry_fee)}</div>
                        <div className="text-xs text-muted-foreground">Entry Fee</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{contest.current_entries}/{contest.max_entries}</div>
                        <div className="text-xs text-muted-foreground">Entries</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {new Date(contest.starts_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                        </div>
                        <div className="text-xs text-muted-foreground">Starts</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {contest.allows_multi_entry ? contest.max_entries_per_user : 1}
                        </div>
                        <div className="text-xs text-muted-foreground">Max Entries</div>
                      </div>
                    </div>
                  </div>

                  {/* Fill Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{getFillPercentage(contest).toFixed(0)}% Full</span>
                      <span>{contest.max_entries - contest.current_entries} spots left</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all"
                        style={{ width: `${getFillPercentage(contest)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          <p className="text-center py-12 text-muted-foreground">Upcoming contests coming soon</p>
        </TabsContent>

        <TabsContent value="beginner">
          <p className="text-center py-12 text-muted-foreground">Beginner contests coming soon</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
