import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const AmericanFootball = () => {
  const games = [
    { time: "Sun 18:00", homeTeam: "Kansas City Chiefs", awayTeam: "Buffalo Bills", homeOdds: "1.90", drawOdds: "-", awayOdds: "2.10" },
    { time: "Sun 21:25", homeTeam: "San Francisco 49ers", awayTeam: "Dallas Cowboys", homeOdds: "1.75", drawOdds: "-", awayOdds: "2.25" },
    { time: "Mon 20:15", homeTeam: "Green Bay Packers", awayTeam: "Detroit Lions", homeOdds: "2.05", drawOdds: "-", awayOdds: "1.85" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">NFL Betting</h1>
          <div className="grid gap-4">
            {games.map((game, i) => <MatchCard key={i} {...game} />)}
          </div>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default AmericanFootball;
