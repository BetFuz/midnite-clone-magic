import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { LeagueMatchSchedule } from "@/components/LeagueMatchSchedule";

const LaLiga = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">La Liga</h1>
          <p className="text-muted-foreground mb-6">Spain's top football division</p>
          <LeagueMatchSchedule leagueName="La Liga" daysAhead={14} />
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default LaLiga;
