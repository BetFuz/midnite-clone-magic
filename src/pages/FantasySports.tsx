import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Users, TrendingUp, Crown, Plus, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/currency";
import { useFantasySports } from "@/hooks/useFantasySports";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const FantasySports = () => {
  const [activeTab, setActiveTab] = useState("football");
  const { leagues, isLoading, joinLeague } = useFantasySports();

  const footballLeagues = leagues.filter(l => l.sport === "Football");
  const basketballLeagues = leagues.filter(l => l.sport === "Basketball");
  const cricketLeagues = leagues.filter(l => l.sport === "Cricket");

  const topManagers = [
    { rank: 1, name: "Alex Thompson", team: "Thunder Strikers", points: 3456, profit: 12500000 },
    { rank: 2, name: "Sarah Chen", team: "Galaxy Warriors", points: 3421, profit: 8750000 },
    { rank: 3, name: "Michael Brown", team: "Elite Squad", points: 3398, profit: 6250000 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MobileNav />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto p-4 md:p-6">
              <Skeleton className="h-12 w-64 mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 md:ml-64 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Fantasy Sports</h1>
                  <p className="text-muted-foreground">Build your dream team and compete</p>
                </div>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create League
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Active Leagues</p>
                <p className="text-2xl font-bold">{leagues.length}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Players</p>
                <p className="text-2xl font-bold">{leagues.reduce((sum, l) => sum + (l.participants || 0), 0).toLocaleString()}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">My Teams</p>
                <p className="text-2xl font-bold text-primary">{leagues.filter(l => l.my_team).length}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Prize Pool</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(leagues.reduce((sum, l) => sum + Number(l.prize_pool), 0))}</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="football">Football</TabsTrigger>
                    <TabsTrigger value="basketball">Basketball</TabsTrigger>
                    <TabsTrigger value="cricket">Cricket</TabsTrigger>
                  </TabsList>

                  <TabsContent value="football" className="space-y-4">
                    {footballLeagues.length === 0 ? (
                      <Card className="p-12 text-center">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No Football Leagues</h3>
                        <p className="text-muted-foreground">Check back soon</p>
                      </Card>
                    ) : (
                      footballLeagues.map(league => (
                        <Card key={league.id} className={`p-6 ${league.my_team ? 'border-primary/50 bg-primary/5' : ''}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{league.sport}</Badge>
                            <Badge variant="secondary">{league.season}</Badge>
                            {league.my_team && (
                              <Badge className="bg-primary/10 text-primary border-primary/20">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                My Team
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-bold mb-3">{league.name}</h3>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Participants</p>
                              <p className="font-bold">{league.participants?.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Prize Pool</p>
                              <p className="font-bold text-green-500">{formatCurrency(league.prize_pool)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Entry Fee</p>
                              <p className="font-bold">{formatCurrency(league.entry_fee)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Deadline</p>
                              <p className="font-bold text-orange-500">{formatDistanceToNow(new Date(league.deadline))}</p>
                            </div>
                          </div>

                          {league.my_team && (
                            <div className="bg-muted/50 rounded-lg p-4 mb-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground">My Rank</p>
                                  <p className="text-xl font-bold text-primary">#{league.my_team.rank || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">My Points</p>
                                  <p className="text-xl font-bold">{league.my_team.total_points}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-3">
                            {league.my_team ? (
                              <>
                                <Button className="flex-1">Manage Team</Button>
                                <Button variant="outline">View Leaderboard</Button>
                              </>
                            ) : (
                              <>
                                <Button className="flex-1" onClick={() => joinLeague(league.id, "My Team")}>Join League</Button>
                                <Button variant="outline">View Details</Button>
                              </>
                            )}
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="basketball" className="space-y-4">
                    {basketballLeagues.map(league => (
                      <Card key={league.id} className={`p-6 ${league.my_team ? 'border-primary/50 bg-primary/5' : ''}`}>
                        <Badge variant="outline" className="mb-2">{league.sport}</Badge>
                        <h3 className="text-xl font-bold mb-3">{league.name}</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Prize Pool</p>
                            <p className="font-bold text-green-500">{formatCurrency(league.prize_pool)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Participants</p>
                            <p className="font-bold">{league.participants?.toLocaleString()}</p>
                          </div>
                        </div>
                        <Button className="w-full">{league.my_team ? 'Manage Team' : 'Join League'}</Button>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="cricket" className="space-y-4">
                    {cricketLeagues.map(league => (
                      <Card key={league.id} className="p-6">
                        <Badge variant="outline" className="mb-2">{league.sport}</Badge>
                        <h3 className="text-xl font-bold mb-3">{league.name}</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Prize Pool</p>
                            <p className="font-bold text-green-500">{formatCurrency(league.prize_pool)}</p>
                          </div>
                        </div>
                        <Button className="w-full">Join League</Button>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-bold text-lg">Top Managers</h3>
                  </div>
                  <div className="space-y-3">
                    {topManagers.map(manager => (
                      <div key={manager.rank} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          manager.rank === 1 ? 'bg-yellow-500 text-white' :
                          manager.rank === 2 ? 'bg-gray-400 text-white' :
                          'bg-orange-500 text-white'
                        }`}>
                          {manager.rank}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{manager.name}</p>
                          <p className="text-xs text-muted-foreground">{manager.team}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{manager.points}</p>
                          <p className="text-xs text-green-500">{formatCurrency(manager.profit)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FantasySports;
