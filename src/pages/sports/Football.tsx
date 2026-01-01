import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useLeagueMatchCounts } from "@/hooks/useLeagueMatchCounts";
import { Skeleton } from "@/components/ui/skeleton";

const leagues = [
  { name: "Premier League", country: "England" },
  { name: "Champions League", country: "Europe" },
  { name: "La Liga", country: "Spain" },
  { name: "Serie A", country: "Italy" },
  { name: "Bundesliga", country: "Germany" },
  { name: "Ligue 1", country: "France" },
  { name: "Championship", country: "England" },
  { name: "Europa League", country: "Europe" },
  { name: "World Cup", country: "International" },
  { name: "U20 World Cup", country: "International" },
  { name: "U17 World Cup", country: "International" },
  { name: "CAF Champions League", country: "Africa" },
  { name: "African Cup of Nations", country: "Africa" },
  { name: "Egyptian Premier League", country: "Egypt" },
  { name: "South African Premier League", country: "South Africa" },
];

const leagueNames = leagues.map(l => l.name);

const Football = () => {
  const { data: matchCounts, isLoading } = useLeagueMatchCounts(leagueNames, 14);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24">
          <h1 className="text-3xl font-bold text-foreground mb-6">Football Betting</h1>
          <div className="grid gap-4">
            {leagues.map((league) => {
              const count = matchCounts?.[league.name] ?? 0;
              return (
                <Card key={league.name} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                  <Link to={`/football/${league.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-1">{league.name}</h3>
                        <p className="text-sm text-muted-foreground">{league.country}</p>
                      </div>
                      <div className="text-right">
                        {isLoading ? (
                          <Skeleton className="h-8 w-12" />
                        ) : (
                          <>
                            <div className="text-2xl font-bold text-primary">{count}</div>
                            <div className="text-xs text-muted-foreground">
                              {count === 1 ? 'match' : 'matches'}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </Card>
              );
            })}
          </div>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Football;
