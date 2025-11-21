import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { LeagueMatchSchedule } from "@/components/LeagueMatchSchedule";
import LeagueTable from "@/components/LeagueTable";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, BarChart3 } from "lucide-react";

const NBA = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24">
          <h1 className="text-3xl font-bold text-foreground mb-2">NBA</h1>
          <p className="text-muted-foreground mb-6">National Basketball Association</p>
          
          <Tabs defaultValue="fixtures" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fixtures" className="gap-2">
                <Calendar className="h-4 w-4" />
                Fixtures
              </TabsTrigger>
              <TabsTrigger value="standings" className="gap-2">
                <Trophy className="h-4 w-4" />
                Standings
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fixtures">
              <LeagueMatchSchedule leagueName="NBA" daysAhead={14} />
            </TabsContent>

            <TabsContent value="standings">
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Eastern Conference</h3>
                  <LeagueTable leagueName="NBA East" />
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Western Conference</h3>
                  <LeagueTable leagueName="NBA West" />
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">League Leaders</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Points Per Game</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">L. Doncic</span>
                        <span className="text-primary font-bold">34.2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">J. Embiid</span>
                        <span className="text-primary font-bold">33.8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">G. Antetokounmpo</span>
                        <span className="text-primary font-bold">31.5</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Rebounds Per Game</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">D. Sabonis</span>
                        <span className="text-primary font-bold">13.2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">A. Davis</span>
                        <span className="text-primary font-bold">12.8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">R. Gobert</span>
                        <span className="text-primary font-bold">12.3</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Assists Per Game</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">T. Haliburton</span>
                        <span className="text-primary font-bold">12.5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">T. Young</span>
                        <span className="text-primary font-bold">11.2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">L. Doncic</span>
                        <span className="text-primary font-bold">9.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default NBA;
