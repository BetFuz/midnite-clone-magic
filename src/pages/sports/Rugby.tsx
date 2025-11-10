import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const Rugby = () => {
  const matches = [
    { time: "Sat 15:00", homeTeam: "England", awayTeam: "Ireland", homeOdds: "2.40", drawOdds: "21.00", awayOdds: "1.65" },
    { time: "Sat 17:45", homeTeam: "Wales", awayTeam: "Scotland", homeOdds: "1.95", drawOdds: "18.00", awayOdds: "2.00" },
    { time: "Sun 15:00", homeTeam: "France", awayTeam: "Italy", homeOdds: "1.25", drawOdds: "25.00", awayOdds: "4.50" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Rugby Betting</h1>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Rugby;
