import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const NBA = () => {
  const matches = [
    { time: "Today 19:00", homeTeam: "Lakers", awayTeam: "Warriors", homeOdds: "1.85", drawOdds: "15.00", awayOdds: "2.10" },
    { time: "Today 19:30", homeTeam: "Celtics", awayTeam: "Heat", homeOdds: "1.75", drawOdds: "16.00", awayOdds: "2.20" },
    { time: "Today 20:00", homeTeam: "Bucks", awayTeam: "76ers", homeOdds: "1.90", drawOdds: "14.50", awayOdds: "2.05" },
    { time: "Tomorrow 19:00", homeTeam: "Nets", awayTeam: "Knicks", homeOdds: "2.00", drawOdds: "14.00", awayOdds: "1.95" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">NBA</h1>
          <p className="text-muted-foreground mb-6">National Basketball Association</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default NBA;
