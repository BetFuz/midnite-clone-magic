import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const SerieA = () => {
  const matches = [
    { time: "Sat 18:00", homeTeam: "Inter Milan", awayTeam: "AC Milan", homeOdds: "2.10", drawOdds: "3.40", awayOdds: "3.60" },
    { time: "Sat 20:45", homeTeam: "Juventus", awayTeam: "Napoli", homeOdds: "2.30", drawOdds: "3.20", awayOdds: "3.30" },
    { time: "Sun 15:00", homeTeam: "Roma", awayTeam: "Lazio", homeOdds: "2.40", drawOdds: "3.30", awayOdds: "3.00" },
    { time: "Sun 20:45", homeTeam: "Atalanta", awayTeam: "Fiorentina", homeOdds: "1.90", drawOdds: "3.60", awayOdds: "4.20" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">Serie A</h1>
          <p className="text-muted-foreground mb-6">Italy's premier football league</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default SerieA;
