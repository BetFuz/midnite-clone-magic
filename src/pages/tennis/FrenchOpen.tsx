import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const FrenchOpen = () => {
  const matches = [
    { time: "Today 11:00", homeTeam: "Djokovic", awayTeam: "Nadal", homeOdds: "2.20", drawOdds: "25.00", awayOdds: "1.75" },
    { time: "Today 13:00", homeTeam: "Alcaraz", awayTeam: "Medvedev", homeOdds: "1.85", drawOdds: "22.00", awayOdds: "2.10" },
    { time: "Today 15:00", homeTeam: "Zverev", awayTeam: "Tsitsipas", homeOdds: "1.95", drawOdds: "23.00", awayOdds: "2.00" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">French Open</h1>
          <p className="text-muted-foreground mb-6">Roland Garros - Clay Court Championship</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default FrenchOpen;
