import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const SouthAfricanPremierLeague = () => {
  const matches = [
    { time: "Sat 15:00", homeTeam: "Mamelodi Sundowns", awayTeam: "Kaizer Chiefs", homeOdds: "1.75", drawOdds: "3.60", awayOdds: "4.80" },
    { time: "Sat 18:00", homeTeam: "Orlando Pirates", awayTeam: "SuperSport United", homeOdds: "2.00", drawOdds: "3.30", awayOdds: "3.80" },
    { time: "Sun 15:00", homeTeam: "AmaZulu", awayTeam: "Cape Town City", homeOdds: "2.20", drawOdds: "3.20", awayOdds: "3.40" },
    { time: "Sun 18:00", homeTeam: "Golden Arrows", awayTeam: "Sekhukhune United", homeOdds: "2.40", drawOdds: "3.10", awayOdds: "3.10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">South African Premier League</h1>
          <p className="text-muted-foreground mb-6">South Africa's top football division</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default SouthAfricanPremierLeague;
