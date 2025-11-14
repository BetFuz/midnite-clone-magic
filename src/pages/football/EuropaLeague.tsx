import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { LeagueMatchSchedule } from "@/components/LeagueMatchSchedule";

const EuropaLeague = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">UEFA Europa League</h1>
          <p className="text-muted-foreground mb-6">Europe's secondary club competition</p>
          <LeagueMatchSchedule leagueName="Europa League" daysAhead={14} />
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default EuropaLeague;
