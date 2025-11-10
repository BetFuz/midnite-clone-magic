import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const Volleyball = () => {
  const matches = [
    { time: "Today 18:00", homeTeam: "Poland", awayTeam: "Brazil", homeOdds: "2.10", drawOdds: "17.00", awayOdds: "1.85" },
    { time: "Today 20:30", homeTeam: "Italy", awayTeam: "USA", homeOdds: "1.95", drawOdds: "16.00", awayOdds: "2.00" },
    { time: "Tomorrow 17:00", homeTeam: "Russia", awayTeam: "Japan", homeOdds: "1.70", drawOdds: "19.00", awayOdds: "2.35" },
    { time: "Tomorrow 19:30", homeTeam: "Serbia", awayTeam: "Turkey", homeOdds: "1.80", drawOdds: "18.00", awayOdds: "2.15" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Volleyball Betting</h1>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Volleyball;
