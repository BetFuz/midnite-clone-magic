import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const EgyptianPremierLeague = () => {
  const matches = [
    { time: "Fri 16:00", homeTeam: "Al Ahly", awayTeam: "Zamalek", homeOdds: "1.95", drawOdds: "3.30", awayOdds: "4.00" },
    { time: "Fri 19:00", homeTeam: "Pyramids FC", awayTeam: "Al Masry", homeOdds: "1.80", drawOdds: "3.50", awayOdds: "4.50" },
    { time: "Sat 16:00", homeTeam: "Ismaily", awayTeam: "Future FC", homeOdds: "2.30", drawOdds: "3.10", awayOdds: "3.30" },
    { time: "Sat 19:00", homeTeam: "Ceramica Cleopatra", awayTeam: "El Gouna", homeOdds: "2.20", drawOdds: "3.20", awayOdds: "3.40" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">Egyptian Premier League</h1>
          <p className="text-muted-foreground mb-6">Egypt's top football division</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default EgyptianPremierLeague;
