import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const Baseball = () => {
  const games = [
    { time: "Today 19:05", homeTeam: "New York Yankees", awayTeam: "Boston Red Sox", homeOdds: "1.80", drawOdds: "-", awayOdds: "2.15" },
    { time: "Today 20:10", homeTeam: "Los Angeles Dodgers", awayTeam: "San Francisco Giants", homeOdds: "1.70", drawOdds: "-", awayOdds: "2.30" },
    { time: "Today 19:40", homeTeam: "Chicago Cubs", awayTeam: "St. Louis Cardinals", homeOdds: "1.95", drawOdds: "-", awayOdds: "2.00" },
    { time: "Tomorrow 13:10", homeTeam: "Atlanta Braves", awayTeam: "Philadelphia Phillies", homeOdds: "1.85", drawOdds: "-", awayOdds: "2.10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Baseball Betting (MLB)</h1>
          <div className="grid gap-4">
            {games.map((game, i) => <MatchCard key={i} {...game} />)}
          </div>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Baseball;
