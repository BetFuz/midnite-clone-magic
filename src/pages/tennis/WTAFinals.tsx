import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const WTAFinals = () => {
  const matches = [
    { time: "Fri 16:00", homeTeam: "Swiatek", awayTeam: "Gauff", homeOdds: "1.70", drawOdds: "30.00", awayOdds: "2.30" },
    { time: "Fri 18:30", homeTeam: "Rybakina", awayTeam: "Sabalenka", homeOdds: "2.05", drawOdds: "29.00", awayOdds: "1.90" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">WTA Finals</h1>
          <p className="text-muted-foreground mb-6">Season-ending championship</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default WTAFinals;
