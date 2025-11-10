import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const U17WorldCup = () => {
  const matches = [
    { time: "Sat 10:00", homeTeam: "Brazil U17", awayTeam: "Mexico U17", homeOdds: "1.90", drawOdds: "3.20", awayOdds: "4.00" },
    { time: "Sat 14:00", homeTeam: "Spain U17", awayTeam: "France U17", homeOdds: "2.10", drawOdds: "3.10", awayOdds: "3.60" },
    { time: "Sun 10:00", homeTeam: "England U17", awayTeam: "Germany U17", homeOdds: "2.40", drawOdds: "3.00", awayOdds: "3.10" },
    { time: "Sun 14:00", homeTeam: "Argentina U17", awayTeam: "Uruguay U17", homeOdds: "2.20", drawOdds: "3.00", awayOdds: "3.40" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">FIFA U17 World Cup</h1>
          <p className="text-muted-foreground mb-6">Under 17 international tournament</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default U17WorldCup;
