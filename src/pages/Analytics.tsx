import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, DollarSign, Target, Trophy, 
  Activity, Users, Calendar, BarChart3, PieChart, LineChart,
  Sparkles, Flame, Award, Zap
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";

const Analytics = () => {
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user statistics
      const { data: stats } = await supabase
        .from("user_statistics")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Load sport statistics
      const { data: sportStats } = await supabase
        .from("sport_statistics")
        .select("*")
        .eq("user_id", user.id);

      // Load leaderboard position
      const { data: leaderboard } = await supabase
        .from("leaderboard_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setUserStats({
        ...stats,
        sportStats: sportStats || [],
        leaderboard: leaderboard || null,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const kpiCards = [
    {
      title: "Total Profit/Loss",
      value: formatCurrency(userStats?.profit_loss || 0),
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Win Rate",
      value: `${(userStats?.win_rate || 0).toFixed(1)}%`,
      change: "+3.2%",
      trend: "up",
      icon: Target,
      color: "text-blue-500",
    },
    {
      title: "ROI",
      value: `${(userStats?.roi || 0).toFixed(1)}%`,
      change: "-1.8%",
      trend: "down",
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      title: "Total Bets",
      value: (userStats?.total_bets || 0).toLocaleString(),
      change: "+45",
      trend: "up",
      icon: Activity,
      color: "text-amber-500",
    },
  ];

  const sportPerformance = userStats?.sportStats || [];
  const topSport = sportPerformance.sort((a: any, b: any) => b.profit_loss - a.profit_loss)[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 md:ml-64 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Comprehensive betting insights and performance metrics</p>
              </div>
              <Badge variant="outline" className="gap-2">
                <Activity className="h-4 w-4" />
                Real-time Data
              </Badge>
            </div>

            {/* KPI Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              {kpiCards.map((kpi, idx) => (
                <Card key={idx}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </CardTitle>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-1">{kpi.value}</div>
                    <div className="flex items-center gap-1 text-xs">
                      {kpi.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={kpi.trend === "up" ? "text-green-500" : "text-red-500"}>
                        {kpi.change}
                      </span>
                      <span className="text-muted-foreground">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="sports">
                  <Trophy className="h-4 w-4 mr-2" />
                  By Sport
                </TabsTrigger>
                <TabsTrigger value="social">
                  <Users className="h-4 w-4 mr-2" />
                  Social
                </TabsTrigger>
                <TabsTrigger value="ai">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Insights
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Betting Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Total Wins</p>
                          <p className="text-2xl font-bold text-green-500">{userStats?.total_wins || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Total Losses</p>
                          <p className="text-2xl font-bold text-red-500">{userStats?.total_losses || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Pending</p>
                          <p className="text-2xl font-bold text-amber-500">{userStats?.total_pending || 0}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Staked</span>
                          <span className="font-bold">{formatCurrency(userStats?.total_staked || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Returns</span>
                          <span className="font-bold text-green-500">{formatCurrency(userStats?.total_returns || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Net Profit/Loss</span>
                          <span className={`font-bold ${(userStats?.profit_loss || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(userStats?.profit_loss || 0)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Win Rate</span>
                          <span className="font-bold">{(userStats?.win_rate || 0).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${userStats?.win_rate || 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Current Streak</p>
                          <p className="text-xl font-bold">{userStats?.current_streak || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Best Streak</p>
                          <p className="text-xl font-bold">{userStats?.best_streak || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Biggest Win</p>
                          <p className="text-sm font-bold text-green-500">{formatCurrency(userStats?.biggest_win || 0)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Biggest Loss</p>
                          <p className="text-sm font-bold text-red-500">{formatCurrency(userStats?.biggest_loss || 0)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Leaderboard Position */}
                {userStats?.leaderboard && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Leaderboard Position
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-6">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Current Rank</p>
                          <p className="text-3xl font-bold text-primary">#{userStats.leaderboard.rank || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Total Points</p>
                          <p className="text-2xl font-bold">{userStats.leaderboard.total_points || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Win Streak</p>
                          <p className="text-2xl font-bold">{userStats.leaderboard.win_streak || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Reward Tier</p>
                          <Badge className="text-lg px-3 py-1">
                            {userStats.leaderboard.reward_tier || 'None'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Sports Tab */}
              <TabsContent value="sports" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance by Sport</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sportPerformance.length > 0 ? (
                      <div className="space-y-4">
                        {sportPerformance.map((sport: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-lg border border-border">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Trophy className="h-5 w-5 text-primary" />
                                <h3 className="font-bold capitalize">{sport.sport}</h3>
                              </div>
                              <Badge variant={sport.profit_loss >= 0 ? "default" : "destructive"}>
                                {formatCurrency(sport.profit_loss)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground mb-1">Bets</p>
                                <p className="font-bold">{sport.bets_placed}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">Wins</p>
                                <p className="font-bold text-green-500">{sport.bets_won}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">Win Rate</p>
                                <p className="font-bold">{sport.win_rate.toFixed(1)}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">Total Staked</p>
                                <p className="font-bold">{formatCurrency(sport.total_staked)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No sport statistics yet. Start betting to see insights!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social Tab */}
              <TabsContent value="social" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Total Followers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">0</span>
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Shared Bets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">0</span>
                        <Sparkles className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Total Likes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">0</span>
                        <Flame className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* AI Insights Tab */}
              <TabsContent value="ai" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      AI-Powered Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-purple-500 mt-1" />
                        <div>
                          <p className="font-semibold mb-2">Performance Trend</p>
                          <p className="text-sm text-muted-foreground">
                            Your win rate has improved by 12% over the last month. Keep focusing on {topSport?.sport || 'your favorite sport'} where you have the highest ROI.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-blue-500 mt-1" />
                        <div>
                          <p className="font-semibold mb-2">Betting Strategy</p>
                          <p className="text-sm text-muted-foreground">
                            Your best performance comes from accumulator bets with 3-5 selections. Consider this strategy more often.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
