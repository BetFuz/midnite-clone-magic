import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const Wimbledon = () => {
  const matches = [
    { time: "Today 13:00", homeTeam: "Federer", awayTeam: "Murray", homeOdds: "1.90", drawOdds: "24.00", awayOdds: "2.05" },
    { time: "Today 15:00", homeTeam: "Swiatek", awayTeam: "Sabalenka", homeOdds: "1.80", drawOdds: "23.50", awayOdds: "2.15" },
    { time: "Tomorrow 14:00", homeTeam: "Sinner", awayTeam: "Rune", homeOdds: "1.75", drawOdds: "25.00", awayOdds: "2.20" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">Wimbledon</h1>
          <p className="text-muted-foreground mb-6">The Championships - Grass Court</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Wimbledon;
