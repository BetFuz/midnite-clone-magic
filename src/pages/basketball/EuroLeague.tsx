import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const EuroLeague = () => {
  const matches = [
    { time: "Thu 18:00", homeTeam: "Real Madrid", awayTeam: "Barcelona", homeOdds: "1.80", drawOdds: "15.50", awayOdds: "2.15" },
    { time: "Thu 19:00", homeTeam: "Olympiacos", awayTeam: "Panathinaikos", homeOdds: "1.95", drawOdds: "14.00", awayOdds: "2.00" },
    { time: "Fri 18:30", homeTeam: "Bayern Munich", awayTeam: "Fenerbahce", homeOdds: "2.10", drawOdds: "13.50", awayOdds: "1.85" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">EuroLeague</h1>
          <p className="text-muted-foreground mb-6">Europe's premier basketball competition</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default EuroLeague;
