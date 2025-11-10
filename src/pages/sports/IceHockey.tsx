import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const IceHockey = () => {
  const games = [
    { time: "Tonight 19:00", homeTeam: "Toronto Maple Leafs", awayTeam: "Montreal Canadiens", homeOdds: "1.85", drawOdds: "4.20", awayOdds: "2.10" },
    { time: "Tonight 21:00", homeTeam: "Boston Bruins", awayTeam: "New York Rangers", homeOdds: "1.95", drawOdds: "4.10", awayOdds: "2.00" },
    { time: "Tonight 22:00", homeTeam: "Colorado Avalanche", awayTeam: "Vegas Golden Knights", homeOdds: "1.75", drawOdds: "4.30", awayOdds: "2.20" },
    { time: "Tomorrow 19:30", homeTeam: "Tampa Bay Lightning", awayTeam: "Florida Panthers", homeOdds: "1.90", drawOdds: "4.15", awayOdds: "2.05" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Ice Hockey Betting</h1>
          <div className="grid gap-4">
            {games.map((game, i) => <MatchCard key={i} {...game} />)}
          </div>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default IceHockey;
