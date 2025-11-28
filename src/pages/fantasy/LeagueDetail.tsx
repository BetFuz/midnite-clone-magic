import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Crown, TrendingUp, Activity, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { formatDistanceToNow } from "date-fns";
import { PlayerDraftInterface } from "@/components/fantasy/PlayerDraftInterface";
import { SalaryCapDraftInterface } from "@/components/fantasy/SalaryCapDraftInterface";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeagueDetail() {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const [league, setLeague] = useState<any>(null);
  const [myTeam, setMyTeam] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDraft, setShowDraft] = useState(false);

  useEffect(() => {
    loadLeagueData();
  }, [leagueId]);

  const loadLeagueData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Load league details
      const { data: leagueData, error: leagueError } = await supabase
        .from('fantasy_leagues')
        .select('*')
        .eq('id', leagueId)
        .single();

      if (leagueError) throw leagueError;
      setLeague(leagueData);

      // Check if user has a team
      if (user) {
        const { data: teamData } = await supabase
          .from('fantasy_teams')
          .select('*')
          .eq('league_id', leagueId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        setMyTeam(teamData);
      }

      // Load leaderboard
      const { data: leaderboardData } = await supabase
        .from('fantasy_teams')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .eq('league_id', leagueId)
        .order('total_points', { ascending: false })
        .limit(50);

      setLeaderboard(leaderboardData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading league:', error);
      toast({
        title: "Error",
        description: "Failed to load league details",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleTeamComplete = async (payload: { players: any[]; totalSalary: number; totalProjected: number }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please login to create a team",
          variant: "destructive",
        });
        return;
      }

      // Create team
      const { data: team, error: teamError } = await supabase
        .from('fantasy_teams')
        .insert({
          league_id: leagueId,
          user_id: user.id,
          team_name: `${user.email?.split('@')[0]}'s Team`,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Save lineup with all selected players
      const { error: lineupError } = await supabase
        .from('fantasy_lineups')
        .insert({
          league_id: leagueId,
          team_id: team.id,
          user_id: user.id,
          lineup_name: `${team.team_name} Lineup 1`,
          salary_cap: 60000,
          total_salary: payload.totalSalary,
          projected_points: payload.totalProjected,
          roster: payload.players.map((p) => ({
            id: p.id,
            full_name: p.full_name,
            team: p.team,
            position: p.position,
            salary: p.salary,
            projected_points: p.projected_points,
          })),
        });

      if (lineupError) {
        console.error('Error saving lineup:', lineupError);
      }

      toast({
        title: "Team Created!",
        description: "Your fantasy team has been successfully created",
      });

      setShowDraft(false);
      loadLeagueData();
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MobileNav />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto p-4 md:p-6">
              <Skeleton className="h-12 w-full mb-6" />
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MobileNav />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto p-4 md:p-6 text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">League Not Found</h2>
              <Button onClick={() => navigate('/fantasy-sports')}>
                Back to Fantasy Sports
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (showDraft) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MobileNav />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
              <Button
                variant="outline"
                onClick={() => setShowDraft(false)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to League
              </Button>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold">{league.name}</h1>
                    <p className="text-muted-foreground">Build Your Squad</p>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Budget: {formatCurrency(100000)}
                  </Badge>
                </div>

                <SalaryCapDraftInterface
                  leagueId={league.id}
                  sport={league.sport}
                  onLineupComplete={handleTeamComplete}
                />
              </Card>
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
            <Button
              variant="outline"
              onClick={() => navigate('/fantasy-sports')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Leagues
            </Button>

            {/* League Header */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* League Badge */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-2xl">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{league.sport}</Badge>
                      <Badge variant="secondary">{league.season}</Badge>
                      <Badge variant={league.status === 'open' ? 'default' : 'secondary'}>
                        {league.status}
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{league.name}</h1>
                    <p className="text-muted-foreground">
                      Deadline: {formatDistanceToNow(new Date(league.deadline), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {!myTeam && (
                  <Button size="lg" onClick={() => setShowDraft(true)}>
                    Join League
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Participants</p>
                  <p className="text-2xl font-bold">{leaderboard.length}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Prize Pool</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(league.prize_pool)}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Entry Fee</p>
                  <p className="text-2xl font-bold">{formatCurrency(league.entry_fee)}</p>
                </div>
                {myTeam && (
                  <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary">
                    <p className="text-sm text-muted-foreground mb-1">My Rank</p>
                    <p className="text-2xl font-bold text-primary">#{myTeam.rank || 'N/A'}</p>
                  </div>
                )}
              </div>
            </Card>

            {myTeam && (
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  {/* Team Badge */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 shadow-xl">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{myTeam.team_name}</h3>
                    <p className="text-sm text-muted-foreground">Your Fantasy Squad</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                    <p className="text-2xl font-bold">{myTeam.total_points}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rank</p>
                    <p className="text-2xl font-bold text-primary">#{myTeam.rank || 'N/A'}</p>
                  </div>
                  <div>
                    <Button className="w-full" onClick={() => setShowDraft(true)}>
                      Manage Squad
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Leaderboard */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="h-6 w-6 text-yellow-500" />
                <h3 className="text-2xl font-bold">Leaderboard</h3>
              </div>

              <div className="space-y-2">
                {leaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No teams yet. Be the first to join!
                  </p>
                ) : (
                  leaderboard.map((team, index) => (
                    <Card
                      key={team.id}
                      className={`p-4 ${team.id === myTeam?.id ? 'border-primary bg-primary/5' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-semibold">{team.team_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {team.profiles?.full_name || team.profiles?.email}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold">{team.total_points}</p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
