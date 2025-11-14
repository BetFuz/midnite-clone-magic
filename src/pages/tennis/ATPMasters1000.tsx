import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { LeagueMatchSchedule } from "@/components/LeagueMatchSchedule";

const ATPMasters1000 = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">ATP Masters 1000</h1>
          <p className="text-muted-foreground mb-6">Top-tier ATP Masters events</p>
          <LeagueMatchSchedule leagueName="ATP Masters 1000" daysAhead={14} />
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default ATPMasters1000;
