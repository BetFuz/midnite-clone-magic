import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const Bundesliga = () => {
  const matches = [
    { time: "Sat 15:30", homeTeam: "Bayern Munich", awayTeam: "Borussia Dortmund", homeOdds: "1.70", drawOdds: "4.00", awayOdds: "5.00" },
    { time: "Sat 15:30", homeTeam: "RB Leipzig", awayTeam: "Bayer Leverkusen", homeOdds: "2.20", drawOdds: "3.50", awayOdds: "3.20" },
    { time: "Sat 18:30", homeTeam: "Borussia M'gladbach", awayTeam: "Eintracht Frankfurt", homeOdds: "2.40", drawOdds: "3.40", awayOdds: "2.90" },
    { time: "Sun 17:30", homeTeam: "Union Berlin", awayTeam: "VfB Stuttgart", homeOdds: "2.60", drawOdds: "3.30", awayOdds: "2.70" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">Bundesliga</h1>
          <p className="text-muted-foreground mb-6">Germany's top football league</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Bundesliga;
