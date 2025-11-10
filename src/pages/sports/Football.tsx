import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Football = () => {
  const leagues = [
    { name: "Premier League", matches: 10, country: "England" },
    { name: "Champions League", matches: 8, country: "Europe" },
    { name: "La Liga", matches: 10, country: "Spain" },
    { name: "Serie A", matches: 10, country: "Italy" },
    { name: "Bundesliga", matches: 9, country: "Germany" },
    { name: "Ligue 1", matches: 10, country: "France" },
    { name: "Championship", matches: 12, country: "England" },
    { name: "Europa League", matches: 16, country: "Europe" },
    { name: "World Cup", matches: 64, country: "International" },
    { name: "U20 World Cup", matches: 52, country: "International" },
    { name: "U17 World Cup", matches: 52, country: "International" },
    { name: "CAF Champions League", matches: 14, country: "Africa" },
    { name: "African Cup of Nations", matches: 52, country: "Africa" },
    { name: "Egyptian Premier League", matches: 18, country: "Egypt" },
    { name: "South African Premier League", matches: 16, country: "South Africa" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Football Betting</h1>
          <div className="grid gap-4">
            {leagues.map((league) => (
              <Card key={league.name} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <Link to={`/football/${league.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{league.name}</h3>
                      <p className="text-sm text-muted-foreground">{league.country}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{league.matches}</div>
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

export default Football;
