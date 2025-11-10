import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const USOpen = () => {
  const matches = [
    { time: "Tue 11:00", homeTeam: "Alcaraz", awayTeam: "Rune", homeOdds: "1.75", drawOdds: "28.00", awayOdds: "2.20" },
    { time: "Tue 13:30", homeTeam: "Pegula", awayTeam: "Rybakina", homeOdds: "1.95", drawOdds: "27.00", awayOdds: "1.95" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">US Open</h1>
          <p className="text-muted-foreground mb-6">New York - Hard Court</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default USOpen;
