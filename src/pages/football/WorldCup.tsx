import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const WorldCup = () => {
  const matches = [
    { time: "Mon 14:00", homeTeam: "Brazil", awayTeam: "Argentina", homeOdds: "2.20", drawOdds: "3.10", awayOdds: "3.40" },
    { time: "Mon 18:00", homeTeam: "France", awayTeam: "Germany", homeOdds: "2.40", drawOdds: "3.00", awayOdds: "3.20" },
    { time: "Tue 14:00", homeTeam: "Spain", awayTeam: "Portugal", homeOdds: "2.10", drawOdds: "3.20", awayOdds: "3.60" },
    { time: "Tue 18:00", homeTeam: "England", awayTeam: "Italy", homeOdds: "2.30", drawOdds: "3.10", awayOdds: "3.30" },
    { time: "Wed 14:00", homeTeam: "Netherlands", awayTeam: "Belgium", homeOdds: "2.50", drawOdds: "3.00", awayOdds: "3.00" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">FIFA World Cup</h1>
          <p className="text-muted-foreground mb-6">The biggest tournament in football</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default WorldCup;
