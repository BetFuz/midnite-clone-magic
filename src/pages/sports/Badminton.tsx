import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";

const Badminton = () => {
  const matches = [
    { player1: "Viktor Axelsen", player2: "Kento Momota", tournament: "All England Open", time: "Today 14:00" },
    { player1: "An Se-young", player2: "Akane Yamaguchi", tournament: "All England Open", time: "Today 15:30" },
    { player1: "Lee Zii Jia", player2: "Chou Tien-chen", tournament: "BWF World Tour Finals", time: "Tomorrow 13:00" },
    { player1: "Chen Yu Fei", player2: "Tai Tzu-ying", tournament: "BWF World Tour Finals", time: "Tomorrow 16:00" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Badminton Betting</h1>
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
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Badminton;
