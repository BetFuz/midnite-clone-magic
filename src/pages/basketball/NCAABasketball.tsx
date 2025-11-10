import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const NCAABasketball = () => {
  const matches = [
    { time: "Sat 13:00", homeTeam: "Duke", awayTeam: "UNC", homeOdds: "1.90", drawOdds: "20.00", awayOdds: "2.00" },
    { time: "Sat 15:00", homeTeam: "Kansas", awayTeam: "Kentucky", homeOdds: "1.85", drawOdds: "19.50", awayOdds: "2.10" },
    { time: "Sat 18:00", homeTeam: "Gonzaga", awayTeam: "UCLA", homeOdds: "2.05", drawOdds: "21.00", awayOdds: "1.85" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">NCAA Basketball</h1>
          <p className="text-muted-foreground mb-6">College Basketball</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default NCAABasketball;
