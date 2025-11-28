import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Plus, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/currency";
import { useFantasySports } from "@/hooks/useFantasySports";
import { formatDistanceToNow } from "date-fns";
import { EmptyLeagueState } from "@/components/fantasy/EmptyLeagueState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FantasySports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("football");
  const [generatingLeagues, setGeneratingLeagues] = useState<Record<string, boolean>>({});
  const { leagues, isLoading, refreshLeagues } = useFantasySports();

  const handleGenerateLeagues = async (sport: string) => {
    setGeneratingLeagues(prev => ({ ...prev, [sport]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-fantasy-leagues', {
        body: { sport }
      });

      if (error) throw error;

      toast.success(`Generated ${data.count} ${sport} fantasy leagues`);
      await refreshLeagues();
    } catch (error: any) {
      console.error('Error generating leagues:', error);
      toast.error(error.message || "Failed to generate leagues");
    } finally {
      setGeneratingLeagues(prev => ({ ...prev, [sport]: false }));
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

  const renderLeagueCard = (league: any) => (
    <Card key={league.id} className={`p-4 md:p-6 ${league.my_team ? 'border-primary/50 bg-primary/5' : ''}`}>
      <div className="flex items-start gap-4 mb-3">
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
          <p className="text-xs text-muted-foreground">Entry Fee</p>
          <p className="font-bold truncate">{formatCurrency(league.entry_fee)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Prize Pool</p>
          <p className="font-bold text-green-500 truncate">{formatCurrency(league.prize_pool)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Max Players</p>
          <p className="font-bold">{league.max_participants?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Deadline</p>
          <p className="font-bold text-orange-500 text-sm">{formatDistanceToNow(new Date(league.deadline), { addSuffix: true })}</p>
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
  );

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
              <Button size="sm" className="gap-2" onClick={() => navigate('/fantasy/nigerian')}>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nigerian Fantasy</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card className="p-3 md:p-4">
                <p className="text-xs text-muted-foreground mb-1">Active Leagues</p>
                <p className="text-xl md:text-2xl font-bold">{leagues.length}</p>
                <p className="text-xs text-green-500 mt-1 hidden sm:block">All sports</p>
              </Card>
              <Card className="p-3 md:p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Prize Pool</p>
                <p className="text-xl md:text-2xl font-bold text-green-500 truncate">{formatCurrency(leagues.reduce((sum, l) => sum + Number(l.prize_pool), 0))}</p>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Available</p>
              </Card>
              <Card className="p-3 md:p-4">
                <p className="text-xs text-muted-foreground mb-1">My Teams</p>
                <p className="text-xl md:text-2xl font-bold text-primary">{leagues.filter(l => l.my_team).length}</p>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Active</p>
              </Card>
              <Card className="p-3 md:p-4">
                <p className="text-xs text-muted-foreground mb-1 truncate">Sports</p>
                <p className="text-xl md:text-2xl font-bold">9</p>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Covered</p>
              </Card>
            </div>

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
                {footballLeagues.length === 0 && !isLoading ? (
                  <EmptyLeagueState 
                    sport="Football"
                    description="Premier League, Champions League, AFCON, La Liga, Serie A, Bundesliga, and African leagues"
                    generating={generatingLeagues.football || false}
                    onGenerate={() => handleGenerateLeagues('football')}
                  />
                ) : (
                  footballLeagues.map(renderLeagueCard)
                )}
              </TabsContent>

              <TabsContent value="basketball" className="space-y-4">
                {basketballLeagues.length === 0 && !isLoading ? (
                  <EmptyLeagueState 
                    sport="Basketball"
                    description="NBA, WNBA, EuroLeague, NCAA, and international basketball leagues"
                    generating={generatingLeagues.basketball || false}
                    onGenerate={() => handleGenerateLeagues('basketball')}
                  />
                ) : (
                  basketballLeagues.map(renderLeagueCard)
                )}
              </TabsContent>

              <TabsContent value="cricket" className="space-y-4">
                {cricketLeagues.length === 0 && !isLoading ? (
                  <EmptyLeagueState 
                    sport="Cricket"
                    description="IPL, T20 World Cup, The Ashes, and international cricket leagues"
                    generating={generatingLeagues.cricket || false}
                    onGenerate={() => handleGenerateLeagues('cricket')}
                  />
                ) : (
                  cricketLeagues.map(renderLeagueCard)
                )}
              </TabsContent>

              <TabsContent value="tennis" className="space-y-4">
                {tennisLeagues.length === 0 && !isLoading ? (
                  <EmptyLeagueState 
                    sport="Tennis"
                    description="Grand Slam tournaments, ATP Masters, and WTA Premier events"
                    generating={generatingLeagues.tennis || false}
                    onGenerate={() => handleGenerateLeagues('tennis')}
                  />
                ) : (
                  tennisLeagues.map(renderLeagueCard)
                )}
              </TabsContent>

              <TabsContent value="rugby" className="space-y-4">
                {rugbyLeagues.length === 0 && !isLoading ? (
                  <EmptyLeagueState 
                    sport="Rugby"
                    description="Six Nations, Rugby Championship, and Super Rugby competitions"
                    generating={generatingLeagues.rugby || false}
                    onGenerate={() => handleGenerateLeagues('rugby')}
                  />
                ) : (
                  rugbyLeagues.map(renderLeagueCard)
                )}
              </TabsContent>

              <TabsContent value="ice-hockey" className="space-y-4">
                {iceHockeyLeagues.length === 0 && !isLoading ? (
                  <EmptyLeagueState 
                    sport="Ice Hockey"
                    description="NHL, KHL, and international ice hockey leagues"
                    generating={generatingLeagues['ice-hockey'] || false}
                    onGenerate={() => handleGenerateLeagues('ice-hockey')}
                  />
                ) : (
                  iceHockeyLeagues.map(renderLeagueCard)
                )}
              </TabsContent>

              <TabsContent value="baseball" className="space-y-4">
                {baseballLeagues.length === 0 && !isLoading ? (
                  <EmptyLeagueState 
                    sport="Baseball"
                    description="MLB, World Series, and international baseball competitions"
                    generating={generatingLeagues.baseball || false}
                    onGenerate={() => handleGenerateLeagues('baseball')}
                  />
                ) : (
                  baseballLeagues.map(renderLeagueCard)
                )}
              </TabsContent>

              <TabsContent value="american-football" className="space-y-4">
                {americanFootballLeagues.length === 0 && !isLoading ? (
                  <EmptyLeagueState 
                    sport="American Football"
                    description="NFL, Super Bowl, and College Football leagues"
                    generating={generatingLeagues['american-football'] || false}
                    onGenerate={() => handleGenerateLeagues('american-football')}
                  />
                ) : (
                  americanFootballLeagues.map(renderLeagueCard)
                )}
              </TabsContent>

              <TabsContent value="volleyball" className="space-y-4">
                {volleyballLeagues.length === 0 && !isLoading ? (
                  <EmptyLeagueState 
                    sport="Volleyball"
                    description="FIVB World Championship and European Volleyball leagues"
                    generating={generatingLeagues.volleyball || false}
                    onGenerate={() => handleGenerateLeagues('volleyball')}
                  />
                ) : (
                  volleyballLeagues.map(renderLeagueCard)
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FantasySports;
