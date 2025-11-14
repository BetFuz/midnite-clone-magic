import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { LeagueMatchSchedule } from "@/components/LeagueMatchSchedule";
import { Card } from "@/components/ui/card";

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
          <LeagueMatchSchedule leagueName="Premier League" daysAhead={14} />
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default PremierLeague;
