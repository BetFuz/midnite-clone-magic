import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalStats } from "@/components/stats/PersonalStats";
import { SportStats } from "@/components/stats/SportStats";
import { BettingTrends } from "@/components/stats/BettingTrends";
import AIRecommendations from "@/components/AIRecommendations";
import { Leaderboard } from "@/components/Leaderboard";
import { AchievementBadges } from "@/components/AchievementBadges";
import { WeeklyChallenges } from "@/components/WeeklyChallenges";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { BarChart3, TrendingUp, Trophy, Target } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useUserStatistics } from "@/hooks/useUserStatistics";

const Statistics = () => {
  const { statistics, isLoading } = useUserStatistics();

  // Use real data or defaults
  const personalStats = statistics || {
    totalBets: 0,
    totalWins: 0,
    totalLosses: 0,
    totalPending: 0,
    totalStaked: 0,
    totalReturns: 0,
    profitLoss: 0,
    winRate: 0,
    roi: 0,
    favoriteSport: "Football",
    biggestWin: 0,
    biggestLoss: 0,
    currentStreak: 0,
    bestStreak: 0,
  };

  const sportStats = [
    { sport: "Football", betsPlaced: 75, betsWon: 42, totalStaked: 750000, totalReturns: 950000, profitLoss: 200000, winRate: 56.0 },
    { sport: "Basketball", betsPlaced: 28, betsWon: 15, totalStaked: 280000, totalReturns: 350000, profitLoss: 70000, winRate: 53.6 },
    { sport: "Tennis", betsPlaced: 18, betsWon: 9, totalStaked: 180000, totalReturns: 225000, profitLoss: 45000, winRate: 50.0 },
    { sport: "Cricket", betsPlaced: 6, betsWon: 2, totalStaked: 40000, totalReturns: 55000, profitLoss: 15000, winRate: 33.3 },
  ];

  const monthlyData = [
    { month: "Jan", bets: 15, wins: 8, profit: 45000 },
    { month: "Feb", bets: 22, wins: 12, profit: 68000 },
    { month: "Mar", bets: 28, wins: 16, profit: 92000 },
    { month: "Apr", bets: 25, wins: 14, profit: 55000 },
    { month: "May", bets: 37, wins: 18, profit: 70000 },
  ];

  const betTypeData = [
    { name: "Single", value: 45, color: "#00D9FF" },
    { name: "Accumulator", value: 35, color: "#10B981" },
    { name: "System", value: 20, color: "#F59E0B" },
  ];

  const bettingTrends = [
    { selectionType: "Match Winner", selectionValue: "Manchester City", betCount: 2847, percentage: 68.5 },
    { selectionType: "Over/Under", selectionValue: "Over 2.5 Goals", betCount: 1923, percentage: 58.2 },
    { selectionType: "Both Teams Score", selectionValue: "Yes", betCount: 1654, percentage: 52.7 },
    { selectionType: "Match Winner", selectionValue: "Liverpool", betCount: 1432, percentage: 48.3 },
    { selectionType: "Correct Score", selectionValue: "2-1", betCount: 987, percentage: 35.6 },
    { selectionType: "Double Chance", selectionValue: "Home/Draw", betCount: 876, percentage: 32.1 },
  ];

  const COLORS = betTypeData.map(item => item.color);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Your Statistics</h1>
                <p className="text-muted-foreground">Track your betting performance and trends</p>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full max-w-3xl grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ai">AI Tips</TabsTrigger>
                <TabsTrigger value="compete">Compete</TabsTrigger>
                <TabsTrigger value="sports">By Sport</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {isLoading ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Loading statistics...</p>
                  </Card>
                ) : (
                  <PersonalStats stats={personalStats} />
                )}

                {/* Charts Grid */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Monthly Performance */}
                  <Card className="p-6 bg-card border-border">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-bold text-foreground">Monthly Performance</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Line type="monotone" dataKey="profit" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Bet Types Distribution */}
                  <Card className="p-6 bg-card border-border">
                    <div className="flex items-center gap-2 mb-6">
                      <Target className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-bold text-foreground">Bet Types</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <ResponsiveContainer width="60%" height={250}>
                        <PieChart>
                          <Pie
                            data={betTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {betTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-3">
                        {betTypeData.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                            <div>
                              <p className="text-sm font-semibold text-foreground">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.value}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Wins vs Losses Chart */}
                <Card className="p-6 bg-card border-border">
                  <div className="flex items-center gap-2 mb-6">
                    <Trophy className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Wins vs Losses by Month</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="bets" fill="hsl(var(--primary))" name="Total Bets" />
                      <Bar dataKey="wins" fill="hsl(var(--success))" name="Wins" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </TabsContent>

              <TabsContent value="ai">
                <AIRecommendations />
              </TabsContent>

              <TabsContent value="compete" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Leaderboard />
                  <div className="space-y-6">
                    <WeeklyChallenges />
                    <AchievementBadges />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sports">
                <SportStats stats={sportStats} />
              </TabsContent>

              <TabsContent value="trends">
                <BettingTrends trends={bettingTrends} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Statistics;
