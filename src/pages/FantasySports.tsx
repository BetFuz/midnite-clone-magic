import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Users, TrendingUp, Crown, Plus, Star, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/currency";
import { useFantasySports } from "@/hooks/useFantasySports";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { CreateLeagueDialog } from "@/components/fantasy/CreateLeagueDialog";
import { EmptyLeagueState } from "@/components/fantasy/EmptyLeagueState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const FantasySports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("football");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { leagues, isLoading, joinLeague, refreshLeagues } = useFantasySports();

  // Auto-generate fantasy leagues in background on component mount
  useEffect(() => {
    // Fire and forget - edge function handles background processing
    supabase.functions.invoke('generate-fantasy-leagues', { body: {} })
      .catch(err => console.error('Background generation error:', err));
  }, []);

  const handleGenerateLeagues = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-fantasy-leagues');
      if (error) throw error;
      
      toast({
        title: "Leagues Generated",
        description: `${data.created} new fantasy leagues created for upcoming matches`,
      });
      
      refreshLeagues();
    } catch (error) {
      console.error('Error generating leagues:', error);
      toast({
        title: "Error",
        description: "Failed to generate leagues. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const footballLeagues = leagues.filter(l => l.sport === "Football" || l.sport === "Soccer");
  const basketballLeagues = leagues.filter(l => l.sport === "Basketball");
  const cricketLeagues = leagues.filter(l => l.sport === "Cricket");
  const tennisLeagues = leagues.filter(l => l.sport === "Tennis");
  const rugbyLeagues = leagues.filter(l => l.sport === "Rugby");
  const iceHockeyLeagues = leagues.filter(l => l.sport === "Ice Hockey");
  const baseballLeagues = leagues.filter(l => l.sport === "Baseball");
  const americanFootballLeagues = leagues.filter(l => l.sport === "American Football");
  const volleyballLeagues = leagues.filter(l => l.sport === "Volleyball");

  const topManagers = [
    { rank: 1, name: "Alex Thompson", team: "Thunder Strikers", points: 3456, profit: 12500000 },
    { rank: 2, name: "Sarah Chen", team: "Galaxy Warriors", points: 3421, profit: 8750000 },
    { rank: 3, name: "Michael Brown", team: "Elite Squad", points: 3398, profit: 6250000 },
  ];

  // Render main layout immediately; use inline skeletons instead of blocking whole page
  // This avoids blank pages if loading hangs briefly.

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 md:ml-64 pb-20 md:pb-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 overflow-x-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">Fantasy Sports</h1>
                  <p className="text-sm text-muted-foreground">Build your dream team and compete</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleGenerateLeagues} disabled={generating} className="gap-2">
                  <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Generate Leagues</span>
                </Button>
                <Button size="sm" className="gap-2" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create League</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card className="p-3 md:p-4">
                <p className="text-xs text-muted-foreground mb-1">Active Leagues</p>
                <p className="text-xl md:text-2xl font-bold">{leagues.length}</p>
                <p className="text-xs text-green-500 mt-1 hidden sm:block">All sports covered</p>
              </Card>
              <Card className="p-3 md:p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Players</p>
                <p className="text-xl md:text-2xl font-bold">{leagues.reduce((sum, l) => sum + (l.participants || 0), 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Across all sports</p>
              </Card>
              <Card className="p-3 md:p-4">
                <p className="text-xs text-muted-foreground mb-1">My Teams</p>
                <p className="text-xl md:text-2xl font-bold text-primary">{leagues.filter(l => l.my_team).length}</p>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Active entries</p>
              </Card>
              <Card className="p-3 md:p-4">
                <p className="text-xs text-muted-foreground mb-1 truncate">Prize Pool</p>
                <p className="text-xl md:text-2xl font-bold text-green-500 truncate">{formatCurrency(leagues.reduce((sum, l) => sum + Number(l.prize_pool), 0))}</p>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Up for grabs</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2 space-y-4 md:space-y-6 min-w-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                    <TabsList className="grid w-full min-w-[600px] md:min-w-0 grid-cols-6 mb-4 h-auto">
                      <TabsTrigger value="football" className="text-xs md:text-sm">Football</TabsTrigger>
                      <TabsTrigger value="basketball" className="text-xs md:text-sm">Basketball</TabsTrigger>
                      <TabsTrigger value="cricket" className="text-xs md:text-sm">Cricket</TabsTrigger>
                      <TabsTrigger value="tennis" className="text-xs md:text-sm">Tennis</TabsTrigger>
                      <TabsTrigger value="rugby" className="text-xs md:text-sm">Rugby</TabsTrigger>
                      <TabsTrigger value="ice-hockey" className="text-xs md:text-sm">Ice Hockey</TabsTrigger>
                    </TabsList>
                  </div>
                  <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                    <TabsList className="grid w-full min-w-[450px] md:min-w-0 grid-cols-3 mb-4 md:mb-6 h-auto">
                      <TabsTrigger value="baseball" className="text-xs md:text-sm">Baseball</TabsTrigger>
                      <TabsTrigger value="american-football" className="text-xs md:text-sm">Am. Football</TabsTrigger>
                      <TabsTrigger value="volleyball" className="text-xs md:text-sm">Volleyball</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="football" className="space-y-4">
                    {footballLeagues.length === 0 ? (
                      <Card className="p-8 md:p-12 text-center">
                        <Trophy className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg md:text-xl font-semibold mb-2">Nigerian Fantasy Football is live</h3>
                        <p className="text-sm text-muted-foreground">Build your ₦100M squad with Osimhen, Lookman, Bassey and more.</p>
                        <Button size="sm" className="mt-4" onClick={() => navigate("/fantasy/nigerian")}>
                          Launch Nigerian Fantasy
                        </Button>
                      </Card>
                    ) : (
                      footballLeagues.map(league => (
                        <Card key={league.id} className={`p-4 md:p-6 ${league.my_team ? 'border-primary/50 bg-primary/5' : ''}`}>
                          <div className="flex items-start gap-4 mb-3">

                            {/* League Badge */}
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                              <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge variant="outline">{league.sport}</Badge>
                                <Badge variant="secondary">{league.season}</Badge>
                                {league.my_team && (
                                  <Badge className="bg-primary/10 text-primary border-primary/20">
                                    <Star className="w-3 h-3 mr-1 fill-current" />
                                    My Team
                                  </Badge>
                                )}
                              </div>
                              <h3 className="text-lg md:text-xl font-bold break-words">{league.name}</h3>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Participants</p>
                              <p className="font-bold">{league.participants?.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Prize Pool</p>
                              <p className="font-bold text-green-500 truncate">{formatCurrency(league.prize_pool)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Entry Fee</p>
                              <p className="font-bold truncate">{formatCurrency(league.entry_fee)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Deadline</p>
                              <p className="font-bold text-orange-500 text-sm">{formatDistanceToNow(new Date(league.deadline))}</p>
                            </div>
                          </div>

                          {league.my_team && (
                            <div className="bg-muted/50 rounded-lg p-3 md:p-4 mb-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground">My Rank</p>
                                  <p className="text-lg md:text-xl font-bold text-primary">#{league.my_team.rank || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">My Points</p>
                                  <p className="text-lg md:text-xl font-bold">{league.my_team.total_points}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                            {league.my_team ? (
                              <>
                                <Button className="flex-1" size="sm" onClick={() => navigate(`/fantasy-sports/${league.id}`)}>Manage Team</Button>
                                <Button variant="outline" size="sm" onClick={() => navigate(`/fantasy-sports/${league.id}`)}>Leaderboard</Button>
                              </>
                            ) : (
                              <>
                                <Button className="flex-1" size="sm" onClick={() => navigate(`/fantasy-sports/${league.id}`)}>Join League</Button>
                                <Button variant="outline" size="sm" onClick={() => navigate(`/fantasy-sports/${league.id}`)}>Details</Button>
                              </>
                            )}
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="basketball" className="space-y-4">
                    {basketballLeagues.length === 0 ? (
                      <Card className="p-12 text-center">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No Basketball Leagues</h3>
                        <p className="text-muted-foreground">Check back soon</p>
                      </Card>
                    ) : (
                      basketballLeagues.map(league => (
                        <Card key={league.id} className={`p-6 ${league.my_team ? 'border-primary/50 bg-primary/5' : ''}`}>
                          <div className="flex items-start gap-4 mb-3">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                              <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <Badge variant="outline" className="mb-2">{league.sport}</Badge>
                              <h3 className="text-xl font-bold">{league.name}</h3>
                            </div>
                          </div>
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
                          <Button className="w-full" onClick={() => navigate(`/fantasy-sports/${league.id}`)}>
                            {league.my_team ? 'Manage Team' : 'Join League'}
                          </Button>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="cricket" className="space-y-4">
                    {cricketLeagues.length === 0 ? (
                      <Card className="p-12 text-center">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No Cricket Leagues</h3>
                        <p className="text-muted-foreground">Check back soon</p>
                      </Card>
                    ) : (
                      cricketLeagues.map(league => (
                        <Card key={league.id} className={`p-6 ${league.my_team ? 'border-primary/50 bg-primary/5' : ''}`}>
                          <Badge variant="outline" className="mb-2">{league.sport}</Badge>
                          <h3 className="text-xl font-bold mb-3">{league.name}</h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Prize Pool</p>
                              <p className="font-bold text-green-500">{formatCurrency(league.prize_pool)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Entry Fee</p>
                              <p className="font-bold">{formatCurrency(league.entry_fee)}</p>
                            </div>
                          </div>
                          <Button className="w-full" onClick={() => navigate(`/fantasy-sports/${league.id}`)}>
                            {league.my_team ? 'Manage Team' : 'Join League'}
                          </Button>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="tennis" className="space-y-4">
                    {tennisLeagues.length === 0 ? (
                      <Card className="p-12 text-center">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No Tennis Leagues</h3>
                        <p className="text-muted-foreground">Check back soon</p>
                      </Card>
                    ) : (
                      tennisLeagues.map(league => (
                        <Card key={league.id} className={`p-6 ${league.my_team ? 'border-primary/50 bg-primary/5' : ''}`}>
                          <Badge variant="outline" className="mb-2">{league.sport}</Badge>
                          <h3 className="text-xl font-bold mb-3">{league.name}</h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Prize Pool</p>
                              <p className="font-bold text-green-500">{formatCurrency(league.prize_pool)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Entry Fee</p>
                              <p className="font-bold">{formatCurrency(league.entry_fee)}</p>
                            </div>
                          </div>
                          <Button className="w-full" onClick={() => navigate(`/fantasy-sports/${league.id}`)}>
                            {league.my_team ? 'Manage Team' : 'Join League'}
                          </Button>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="rugby" className="space-y-4">
                    {rugbyLeagues.length === 0 ? (
                      <Card className="p-12 text-center">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No Rugby Leagues</h3>
                        <p className="text-muted-foreground">Check back soon</p>
                      </Card>
                    ) : (
                      rugbyLeagues.map(league => (
                        <Card key={league.id} className={`p-6 ${league.my_team ? 'border-primary/50 bg-primary/5' : ''}`}>
                          <Badge variant="outline" className="mb-2">{league.sport}</Badge>
                          <h3 className="text-xl font-bold mb-3">{league.name}</h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Prize Pool</p>
                              <p className="font-bold text-green-500">{formatCurrency(league.prize_pool)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Entry Fee</p>
                              <p className="font-bold">{formatCurrency(league.entry_fee)}</p>
                            </div>
                          </div>
                          <Button className="w-full" onClick={() => navigate(`/fantasy-sports/${league.id}`)}>
                            {league.my_team ? 'Manage Team' : 'Join League'}
                          </Button>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="ice-hockey" className="space-y-4">
                    {iceHockeyLeagues.length === 0 ? (
                      <Card className="p-12 text-center">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No Ice Hockey Leagues</h3>
                        <p className="text-muted-foreground">Check back soon</p>
                      </Card>
                    ) : (
                      iceHockeyLeagues.map(league => (
                        <Card key={league.id} className={`p-6 ${league.my_team ? 'border-primary/50 bg-primary/5' : ''}`}>
                          <Badge variant="outline" className="mb-2">{league.sport}</Badge>
                          <h3 className="text-xl font-bold mb-3">{league.name}</h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Prize Pool</p>
                              <p className="font-bold text-green-500">{formatCurrency(league.prize_pool)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Entry Fee</p>
                              <p className="font-bold">{formatCurrency(league.entry_fee)}</p>
                            </div>
                          </div>
                          <Button className="w-full" onClick={() => navigate(`/fantasy-sports/${league.id}`)}>
                            {league.my_team ? 'Manage Team' : 'Join League'}
                          </Button>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="baseball" className="space-y-4">
                    {baseballLeagues.length === 0 ? (
                      <Card className="p-12 text-center">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No Baseball Leagues</h3>
                        <p className="text-muted-foreground">Check back soon</p>
                      </Card>
                    ) : (
                      baseballLeagues.map(league => (
                        <Card key={league.id} className={`p-6 ${league.my_team ? 'border-primary/50 bg-primary/5' : ''}`}>
                          <Badge variant="outline" className="mb-2">{league.sport}</Badge>
                          <h3 className="text-xl font-bold mb-3">{league.name}</h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Prize Pool</p>
                              <p className="font-bold text-green-500">{formatCurrency(league.prize_pool)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Entry Fee</p>
                              <p className="font-bold">{formatCurrency(league.entry_fee)}</p>
                            </div>
                          </div>
                          <Button className="w-full" onClick={() => navigate(`/fantasy-sports/${league.id}`)}>
                            {league.my_team ? 'Manage Team' : 'Join League'}
                          </Button>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="american-football" className="space-y-4">
                    {americanFootballLeagues.length === 0 ? (
                      <Card className="p-12 text-center">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No American Football Leagues</h3>
                        <p className="text-muted-foreground">Check back soon</p>
                      </Card>
                    ) : (
                      americanFootballLeagues.map(league => (
                        <Card key={league.id} className={`p-6 ${league.my_team ? 'border-primary/50 bg-primary/5' : ''}`}>
                          <Badge variant="outline" className="mb-2">{league.sport}</Badge>
                          <h3 className="text-xl font-bold mb-3">{league.name}</h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Prize Pool</p>
                              <p className="font-bold text-green-500">{formatCurrency(league.prize_pool)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Entry Fee</p>
                              <p className="font-bold">{formatCurrency(league.entry_fee)}</p>
                            </div>
                          </div>
                          <Button className="w-full" onClick={() => navigate(`/fantasy-sports/${league.id}`)}>
                            {league.my_team ? 'Manage Team' : 'Join League'}
                          </Button>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="volleyball" className="space-y-4">
                    {volleyballLeagues.length === 0 ? (
                      <Card className="p-12 text-center">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No Volleyball Leagues</h3>
                        <p className="text-muted-foreground">Check back soon</p>
                      </Card>
                    ) : (
                      volleyballLeagues.map(league => (
                        <Card key={league.id} className={`p-6 ${league.my_team ? 'border-primary/50 bg-primary/5' : ''}`}>
                          <Badge variant="outline" className="mb-2">{league.sport}</Badge>
                          <h3 className="text-xl font-bold mb-3">{league.name}</h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Prize Pool</p>
                              <p className="font-bold text-green-500">{formatCurrency(league.prize_pool)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Entry Fee</p>
                              <p className="font-bold">{formatCurrency(league.entry_fee)}</p>
                            </div>
                          </div>
                          <Button className="w-full" onClick={() => navigate(`/fantasy-sports/${league.id}`)}>
                            {league.my_team ? 'Manage Team' : 'Join League'}
                          </Button>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-4 md:space-y-6 min-w-0">
                <Card className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-bold text-base md:text-lg">Top Managers</h3>
                  </div>
                  <div className="space-y-3">
                    {topManagers.map(manager => (
                      <div key={manager.rank} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          manager.rank === 1 ? 'bg-yellow-500 text-white' :
                          manager.rank === 2 ? 'bg-gray-400 text-white' :
                          'bg-orange-500 text-white'
                        }`}>
                          {manager.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{manager.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{manager.team}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-sm">{manager.points}</p>
                          <p className="text-xs text-green-500 truncate">{formatCurrency(manager.profit)}</p>
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

      <CreateLeagueDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onLeagueCreated={refreshLeagues}
      />
    </div>
  );
};

export default FantasySports;
