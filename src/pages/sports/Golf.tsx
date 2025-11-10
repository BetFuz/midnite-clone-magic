import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";

const Golf = () => {
  const tournaments = [
    { name: "The Masters", location: "Augusta National", date: "Apr 11-14", players: 87 },
    { name: "PGA Championship", location: "Oak Hill", date: "May 16-19", players: 156 },
    { name: "US Open", location: "Los Angeles CC", date: "Jun 13-16", players: 156 },
    { name: "The Open", location: "Royal Liverpool", date: "Jul 20-23", players: 156 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Golf Betting</h1>
          <div className="grid gap-4">
            {tournaments.map((tournament) => (
              <Card key={tournament.name} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <h3 className="text-lg font-bold text-foreground mb-2">{tournament.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">{tournament.location}</p>
                <p className="text-sm text-muted-foreground">{tournament.date} • {tournament.players} players</p>
              </Card>
            ))}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Golf;
