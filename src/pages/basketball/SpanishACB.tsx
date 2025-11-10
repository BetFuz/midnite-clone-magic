import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const SpanishACB = () => {
  const matches = [
    { time: "Sun 12:00", homeTeam: "Real Madrid", awayTeam: "Valencia", homeOdds: "1.70", drawOdds: "22.00", awayOdds: "2.30" },
    { time: "Sun 14:30", homeTeam: "Barcelona", awayTeam: "Baskonia", homeOdds: "1.80", drawOdds: "21.00", awayOdds: "2.20" },
    { time: "Sun 17:00", homeTeam: "Unicaja", awayTeam: "Gran Canaria", homeOdds: "1.95", drawOdds: "20.50", awayOdds: "2.00" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">Spanish ACB</h1>
          <p className="text-muted-foreground mb-6">Liga ACB - Spain</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default SpanishACB;
