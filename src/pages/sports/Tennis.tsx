import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Tennis = () => {
  const tournaments = [
    { name: "Australian Open", matches: 32, surface: "Hard" },
    { name: "French Open", matches: 28, surface: "Clay" },
    { name: "Wimbledon", matches: 24, surface: "Grass" },
    { name: "US Open", matches: 30, surface: "Hard" },
    { name: "ATP Masters 1000", matches: 16, surface: "Various" },
    { name: "WTA Finals", matches: 8, surface: "Hard" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Tennis Betting</h1>
          <div className="grid gap-4">
            {tournaments.map((tournament) => (
              <Card key={tournament.name} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <Link to={`/tennis/${tournament.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{tournament.name}</h3>
                      <p className="text-sm text-muted-foreground">{tournament.surface} Court</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{tournament.matches}</div>
                      <div className="text-xs text-muted-foreground">matches</div>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Tennis;
