import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Basketball = () => {
  const leagues = [
    { name: "NBA", matches: 12, country: "USA" },
    { name: "EuroLeague", matches: 8, country: "Europe" },
    { name: "NCAA Basketball", matches: 45, country: "USA" },
    { name: "WNBA", matches: 6, country: "USA" },
    { name: "Spanish ACB", matches: 9, country: "Spain" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Basketball Betting</h1>
          <div className="grid gap-4">
            {leagues.map((league) => (
              <Card key={league.name} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <Link to={`/basketball/${league.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{league.name}</h3>
                      <p className="text-sm text-muted-foreground">{league.country}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{league.matches}</div>
                      <div className="text-xs text-muted-foreground">games</div>
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

export default Basketball;
