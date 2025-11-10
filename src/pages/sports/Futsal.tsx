import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const Futsal = () => {
  const matches = [
    { time: "Today 18:30", homeTeam: "Brazil", awayTeam: "Argentina", homeOdds: "1.70", drawOdds: "4.50", awayOdds: "2.30" },
    { time: "Today 20:00", homeTeam: "Spain", awayTeam: "Portugal", homeOdds: "1.85", drawOdds: "4.20", awayOdds: "2.10" },
    { time: "Tomorrow 17:00", homeTeam: "Iran", awayTeam: "Russia", homeOdds: "2.05", drawOdds: "4.00", awayOdds: "1.90" },
    { time: "Tomorrow 19:30", homeTeam: "Kazakhstan", awayTeam: "Ukraine", homeOdds: "1.95", drawOdds: "4.10", awayOdds: "2.00" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Futsal Betting</h1>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Futsal;
