import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Football = () => {
  const leagues: Array<{ name: string; matches: number; country: string; routePath?: string | null }> = [
    { name: "Premier League", matches: 10, country: "England", routePath: "/football/premier-league" },
    { name: "Champions League", matches: 8, country: "Europe", routePath: "/football/champions-league" },
    { name: "La Liga", matches: 10, country: "Spain", routePath: "/football/la-liga" },
    { name: "Serie A", matches: 10, country: "Italy", routePath: "/football/serie-a" },
    { name: "Bundesliga", matches: 9, country: "Germany", routePath: "/football/bundesliga" },
    // Not implemented yet
    { name: "Ligue 1", matches: 10, country: "France", routePath: null },
    { name: "Championship", matches: 12, country: "England", routePath: null },
    { name: "Europa League", matches: 16, country: "Europe", routePath: null },
    { name: "World Cup", matches: 64, country: "International", routePath: "/football/world-cup" },
    { name: "U20 World Cup", matches: 52, country: "International", routePath: "/football/u20-world-cup" },
    { name: "U17 World Cup", matches: 52, country: "International", routePath: "/football/u17-world-cup" },
    { name: "CAF Champions League", matches: 14, country: "Africa", routePath: "/football/caf-champions-league" },
    { name: "African Cup of Nations", matches: 52, country: "Africa", routePath: "/football/african-cup-of-nations" },
    { name: "Egyptian Premier League", matches: 18, country: "Egypt", routePath: "/football/egyptian-premier-league" },
    { name: "South African Premier League", matches: 16, country: "South Africa", routePath: "/football/south-african-premier-league" },
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
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Football;
