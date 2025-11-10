import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const AustralianOpen = () => {
  const matches = [
    { time: "Mon 10:00", homeTeam: "Djokovic", awayTeam: "Sinner", homeOdds: "1.65", drawOdds: "30.00", awayOdds: "2.35" },
    { time: "Mon 12:00", homeTeam: "Sabalenka", awayTeam: "Gauff", homeOdds: "1.80", drawOdds: "28.00", awayOdds: "2.10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">Australian Open</h1>
          <p className="text-muted-foreground mb-6">Melbourne - Hard Court</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default AustralianOpen;
