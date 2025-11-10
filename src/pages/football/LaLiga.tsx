import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const LaLiga = () => {
  const matches = [
    { time: "Sat 16:00", homeTeam: "Real Madrid", awayTeam: "Barcelona", homeOdds: "2.40", drawOdds: "3.40", awayOdds: "2.90" },
    { time: "Sat 18:30", homeTeam: "Atletico Madrid", awayTeam: "Sevilla", homeOdds: "1.85", drawOdds: "3.60", awayOdds: "4.50" },
    { time: "Sat 21:00", homeTeam: "Valencia", awayTeam: "Real Sociedad", homeOdds: "2.60", drawOdds: "3.20", awayOdds: "2.80" },
    { time: "Sun 16:00", homeTeam: "Villarreal", awayTeam: "Athletic Bilbao", homeOdds: "2.20", drawOdds: "3.30", awayOdds: "3.40" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">La Liga</h1>
          <p className="text-muted-foreground mb-6">Spain's top football division</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default LaLiga;
