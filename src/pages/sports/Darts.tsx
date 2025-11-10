import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";

const Darts = () => {
  const matches = [
    { player1: "Luke Littler", player2: "Michael van Gerwen", tournament: "Premier League", time: "Tonight 19:00" },
    { player1: "Gerwyn Price", player2: "Peter Wright", tournament: "Premier League", time: "Tonight 20:00" },
    { player1: "Michael Smith", player2: "Rob Cross", tournament: "Premier League", time: "Tonight 21:00" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Darts Betting</h1>
          <div className="grid gap-4">
            {matches.map((match, i) => (
              <Card key={i} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <h3 className="text-lg font-bold text-foreground mb-2">{match.player1} vs {match.player2}</h3>
                <p className="text-sm text-muted-foreground mb-1">{match.tournament}</p>
                <p className="text-sm text-primary">{match.time}</p>
              </Card>
            ))}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Darts;
