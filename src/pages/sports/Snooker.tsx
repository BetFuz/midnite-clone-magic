import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";

const Snooker = () => {
  const matches = [
    { player1: "Ronnie O'Sullivan", player2: "Judd Trump", tournament: "World Championship", round: "Semi-Final" },
    { player1: "Mark Selby", player2: "John Higgins", tournament: "World Championship", round: "Semi-Final" },
    { player1: "Neil Robertson", player2: "Shaun Murphy", tournament: "Masters", round: "Quarter-Final" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Snooker Betting</h1>
          <div className="grid gap-4">
            {matches.map((match, i) => (
              <Card key={i} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <h3 className="text-lg font-bold text-foreground mb-2">{match.player1} vs {match.player2}</h3>
                <p className="text-sm text-muted-foreground">{match.tournament} - {match.round}</p>
              </Card>
            ))}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Snooker;
