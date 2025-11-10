import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const CAFChampionsLeague = () => {
  const matches = [
    { time: "Fri 17:00", homeTeam: "Al Ahly", awayTeam: "Wydad Casablanca", homeOdds: "2.00", drawOdds: "3.20", awayOdds: "3.80" },
    { time: "Fri 20:00", homeTeam: "Mamelodi Sundowns", awayTeam: "TP Mazembe", homeOdds: "1.85", drawOdds: "3.40", awayOdds: "4.20" },
    { time: "Sat 17:00", homeTeam: "Esperance Tunis", awayTeam: "Raja Casablanca", homeOdds: "2.20", drawOdds: "3.10", awayOdds: "3.40" },
    { time: "Sat 20:00", homeTeam: "Simba SC", awayTeam: "Horoya AC", homeOdds: "2.10", drawOdds: "3.20", awayOdds: "3.50" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">CAF Champions League</h1>
          <p className="text-muted-foreground mb-6">Africa's premier club competition</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default CAFChampionsLeague;
