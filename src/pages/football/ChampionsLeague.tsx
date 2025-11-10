import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const ChampionsLeague = () => {
  const matches = [
    { time: "Tue 20:00", homeTeam: "Real Madrid", awayTeam: "Bayern Munich", homeOdds: "2.20", drawOdds: "3.50", awayOdds: "3.40" },
    { time: "Tue 20:00", homeTeam: "PSG", awayTeam: "Barcelona", homeOdds: "2.60", drawOdds: "3.30", awayOdds: "2.80" },
    { time: "Wed 20:00", homeTeam: "Man City", awayTeam: "Inter Milan", homeOdds: "1.65", drawOdds: "4.00", awayOdds: "5.50" },
    { time: "Wed 20:00", homeTeam: "Atletico Madrid", awayTeam: "Borussia Dortmund", homeOdds: "2.35", drawOdds: "3.20", awayOdds: "3.10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">UEFA Champions League</h1>
          <p className="text-muted-foreground mb-6">Europe's premier club competition</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default ChampionsLeague;
