import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";

const AFCON = () => {
  const matches = [
    { time: "Mon 17:00", homeTeam: "Nigeria", awayTeam: "Egypt", homeOdds: "2.40", drawOdds: "3.00", awayOdds: "3.20" },
    { time: "Mon 20:00", homeTeam: "Senegal", awayTeam: "Algeria", homeOdds: "2.30", drawOdds: "3.10", awayOdds: "3.30" },
    { time: "Tue 17:00", homeTeam: "Morocco", awayTeam: "Cameroon", homeOdds: "2.20", drawOdds: "3.10", awayOdds: "3.50" },
    { time: "Tue 20:00", homeTeam: "Ghana", awayTeam: "Ivory Coast", homeOdds: "2.50", drawOdds: "3.00", awayOdds: "3.00" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">African Cup of Nations</h1>
          <p className="text-muted-foreground mb-6">Africa's premier international tournament</p>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default AFCON;
