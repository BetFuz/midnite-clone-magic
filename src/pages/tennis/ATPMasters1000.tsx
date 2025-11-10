import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const ATPMasters1000 = () => {
  const matches = [
    { time: "Wed 10:30", homeTeam: "Medvedev", awayTeam: "Zverev", homeOdds: "1.85", drawOdds: "26.00", awayOdds: "2.05" },
    { time: "Wed 14:00", homeTeam: "Tsitsipas", awayTeam: "Rublev", homeOdds: "2.00", drawOdds: "25.00", awayOdds: "1.95" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">ATP Masters 1000</h1>
          <p className="text-muted-foreground mb-6">Top-tier ATP Masters events</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default ATPMasters1000;
