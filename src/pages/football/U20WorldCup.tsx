import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const U20WorldCup = () => {
  const matches = [
    { time: "Thu 12:00", homeTeam: "Brazil U20", awayTeam: "Argentina U20", homeOdds: "2.30", drawOdds: "3.00", awayOdds: "3.20" },
    { time: "Thu 16:00", homeTeam: "France U20", awayTeam: "England U20", homeOdds: "2.20", drawOdds: "3.10", awayOdds: "3.40" },
    { time: "Fri 12:00", homeTeam: "Spain U20", awayTeam: "Germany U20", homeOdds: "2.40", drawOdds: "3.00", awayOdds: "3.10" },
    { time: "Fri 16:00", homeTeam: "Nigeria U20", awayTeam: "Ghana U20", homeOdds: "2.60", drawOdds: "2.90", awayOdds: "2.80" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">FIFA U20 World Cup</h1>
          <p className="text-muted-foreground mb-6">Under 20 international tournament</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default U20WorldCup;
