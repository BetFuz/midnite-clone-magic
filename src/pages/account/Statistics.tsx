import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalStats } from "@/components/stats/PersonalStats";
import { SportStats } from "@/components/stats/SportStats";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { BarChart3, TrendingUp, Trophy, Target } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

const Statistics = () => {
  // Mock data - in production, fetch from Supabase
  const personalStats = {
    totalBets: 127,
    totalWins: 68,
    totalLosses: 45,
    totalPending: 14,
    totalStaked: 1250000,
    totalReturns: 1580000,
    profitLoss: 330000,
    winRate: 53.5,
    roi: 26.4,
    favoriteSport: "Football",
    biggestWin: 185000,
    currentStreak: 3,
    bestStreak: 8,
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
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sports">By Sport</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <PersonalStats stats={personalStats} />

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

              <TabsContent value="sports">
                <SportStats stats={sportStats} />
              </TabsContent>

              <TabsContent value="trends">
                <Card className="p-6 bg-card border-border">
                  <h3 className="text-xl font-bold text-foreground mb-4">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Advanced betting trends and insights will be available here soon.
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Statistics;
