import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { LeagueMatchSchedule } from "@/components/LeagueMatchSchedule";

const AustralianOpen = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">Australian Open</h1>
          <p className="text-muted-foreground mb-6">Melbourne - Hard Court</p>
          <LeagueMatchSchedule leagueName="Australian Open" daysAhead={14} />
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default AustralianOpen;
