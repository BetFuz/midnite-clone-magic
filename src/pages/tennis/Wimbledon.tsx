import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { LeagueMatchSchedule } from "@/components/LeagueMatchSchedule";
import BracketView from "@/components/BracketView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, BarChart3 } from "lucide-react";

const Wimbledon = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24">
          <h1 className="text-3xl font-bold text-foreground mb-2">Wimbledon</h1>
          <p className="text-muted-foreground mb-6">The Championships - Grass Court</p>
          
          <Tabs defaultValue="schedule" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="schedule" className="gap-2">
                <Calendar className="h-4 w-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="bracket" className="gap-2">
                <Trophy className="h-4 w-4" />
                Bracket
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedule">
              <LeagueMatchSchedule leagueName="Wimbledon" daysAhead={14} />
            </TabsContent>

            <TabsContent value="bracket">
              <div className="space-y-6">
                <BracketView tournamentName="Men's Singles" />
                <BracketView tournamentName="Women's Singles" />
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <div className="grid gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Most Aces</h3>
                  <p className="text-2xl font-bold">J. Isner - 156</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Longest Match</h3>
                  <p className="text-2xl font-bold">4h 32min</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Wimbledon;
