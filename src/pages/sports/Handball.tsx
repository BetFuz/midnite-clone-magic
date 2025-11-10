import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const Handball = () => {
  const matches = [
    { time: "Today 18:00", homeTeam: "Denmark", awayTeam: "France", homeOdds: "2.05", drawOdds: "15.00", awayOdds: "1.90" },
    { time: "Today 20:00", homeTeam: "Norway", awayTeam: "Sweden", homeOdds: "1.85", drawOdds: "16.00", awayOdds: "2.10" },
    { time: "Tomorrow 17:30", homeTeam: "Germany", awayTeam: "Spain", homeOdds: "1.95", drawOdds: "15.50", awayOdds: "2.00" },
    { time: "Tomorrow 19:30", homeTeam: "Croatia", awayTeam: "Hungary", homeOdds: "1.75", drawOdds: "17.00", awayOdds: "2.25" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Handball Betting</h1>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Handball;
