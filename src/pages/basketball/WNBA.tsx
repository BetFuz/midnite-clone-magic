import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const WNBA = () => {
  const matches = [
    { time: "Today 18:00", homeTeam: "Aces", awayTeam: "Liberty", homeOdds: "1.80", drawOdds: "18.00", awayOdds: "2.20" },
    { time: "Today 20:30", homeTeam: "Sky", awayTeam: "Mystics", homeOdds: "1.95", drawOdds: "17.00", awayOdds: "2.00" },
    { time: "Tomorrow 19:00", homeTeam: "Sparks", awayTeam: "Mercury", homeOdds: "2.05", drawOdds: "16.50", awayOdds: "1.90" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">WNBA</h1>
          <p className="text-muted-foreground mb-6">Women's National Basketball Association</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default WNBA;
