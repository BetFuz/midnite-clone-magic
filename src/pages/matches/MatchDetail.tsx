import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import { MatchStats } from "@/components/stats/MatchStats";
import { Play } from "lucide-react";

const MatchDetail = () => {
  const { id } = useParams();

  const toTitle = (str: string) =>
    str
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const slug = id || "manchester-united-vs-liverpool";
  const [leftSlug = "manchester-united", rightSlug = "liverpool"] = slug.split("-vs-");
  const leftTeam = toTitle(leftSlug);
  const rightTeam = toTitle(rightSlug);

  const matchStats = {
    homeTeam: leftTeam,
    awayTeam: rightTeam,
    homeFormPercent: 80,
    awayFormPercent: 33,
    homePosition: 15,
    awayPosition: 10,
    h2hHomeWins: 30,
    h2hDraws: 12,
    h2hAwayWins: 21,
    league: "Premier League",
    matchday: 8,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          {/* Match Header */}
          <Card className="p-4 bg-card border-border mb-4">
            <Badge className="bg-success text-white mb-2">BEST ODDS</Badge>
            <p className="text-muted-foreground text-sm mb-2">
              Football · England - Premier League
            </p>
            
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{leftTeam.substring(0, 3).toUpperCase()}</span>
                </div>
                <span className="font-bold text-foreground">{leftTeam.substring(0, 3).toUpperCase()}</span>
              </div>
              <span className="text-muted-foreground">VS</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-destructive">{rightTeam.substring(0, 3).toUpperCase()}</span>
                </div>
                <span className="font-bold text-foreground">{rightTeam.substring(0, 3).toUpperCase()}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>19/10 Saturday 17:00</span>
              <div className="flex items-center gap-1">
                <Play className="h-4 w-4 text-primary" />
                <span>Live in: Play Available</span>
              </div>
              <span>ID 33179</span>
            </div>
          </Card>

          {/* Main Tabs */}
          <Tabs defaultValue="stats" className="mb-6">
            <TabsList className="w-full grid grid-cols-3 bg-muted/50">
              <TabsTrigger value="markets" className="data-[state=active]:bg-card">
                Markets
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Stats
              </TabsTrigger>
              <TabsTrigger value="comments" className="data-[state=active]:bg-card">
                Comments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="markets" className="mt-4">
              {/* Betting Odds */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Button className="h-20 flex flex-col bg-card hover:bg-primary/20 border border-border">
                  <span className="text-xs text-muted-foreground">Home</span>
                  <span className="text-2xl font-bold text-odds">3.60</span>
                </Button>
                <Button className="h-20 flex flex-col bg-card hover:bg-primary/20 border border-border">
                  <span className="text-xs text-muted-foreground">Draw</span>
                  <span className="text-2xl font-bold text-odds">3.30</span>
                </Button>
                <Button className="h-20 flex flex-col bg-card hover:bg-primary/20 border border-border">
                  <span className="text-xs text-muted-foreground">Away</span>
                  <span className="text-2xl font-bold text-odds">2.00</span>
                </Button>
              </div>

              {/* More Markets */}
              <Card className="p-5 bg-card border-border">
                <h3 className="font-bold text-foreground mb-4">More Markets</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-between">
                    <span>Both Teams To Score</span>
                    <span className="text-odds font-bold">1.85</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    <span>Over 2.5 Goals</span>
                    <span className="text-odds font-bold">1.75</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    <span>First Goal Scorer</span>
                    <span className="text-primary">View</span>
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="mt-4">
              <MatchStats matchStats={matchStats} />
            </TabsContent>

            <TabsContent value="comments" className="mt-4">
              <Card className="p-6 bg-card border-border">
                <p className="text-center text-muted-foreground">
                  No comments yet. Be the first to comment!
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default MatchDetail;
