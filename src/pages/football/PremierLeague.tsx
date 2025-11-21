import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { LeagueMatchSchedule } from "@/components/LeagueMatchSchedule";
import LeagueTable from "@/components/LeagueTable";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, BarChart3 } from "lucide-react";

const PremierLeague = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24">
          <h1 className="text-3xl font-bold text-foreground mb-2">Premier League</h1>
          <p className="text-muted-foreground mb-6">England's top football division</p>
          
          <Card className="p-4 bg-gradient-card border-border mb-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">Current Leader</div>
                <div className="text-2xl font-bold text-foreground">Manchester City</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Top Scorer</div>
                <div className="text-2xl font-bold text-foreground">E. Haaland (25)</div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="fixtures" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fixtures" className="gap-2">
                <Calendar className="h-4 w-4" />
                Fixtures
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-2">
                <Trophy className="h-4 w-4" />
                Table
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fixtures">
              <LeagueMatchSchedule leagueName="Premier League" daysAhead={14} />
            </TabsContent>

            <TabsContent value="table">
              <LeagueTable leagueName="Premier League" />
            </TabsContent>

            <TabsContent value="stats">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">League Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Goals</p>
                    <p className="text-2xl font-bold">842</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Goals/Game</p>
                    <p className="text-2xl font-bold">3.01</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Clean Sheets</p>
                    <p className="text-2xl font-bold">127</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Penalties</p>
                    <p className="text-2xl font-bold">56</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default PremierLeague;
