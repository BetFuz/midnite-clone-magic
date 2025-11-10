import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Roulette = () => {
  const handlePlayGame = (gameName: string) => {
    toast({
      title: "Launching Game",
      description: `${gameName} is loading...`,
    });
  };

  const games = [
    { name: "European Roulette", provider: "NetEnt", type: "Single Zero" },
    { name: "American Roulette", provider: "NetEnt", type: "Double Zero" },
    { name: "French Roulette", provider: "NetEnt", type: "La Partage" },
    { name: "Double Ball Roulette", provider: "Evolution", type: "Two Balls" },
    { name: "Lightning Roulette", provider: "Evolution", type: "Multipliers" },
    { name: "Speed Roulette", provider: "Evolution", type: "Fast Play" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Roulette Games</h1>
          <div className="grid grid-cols-2 gap-4">
            {games.map((game) => (
              <Card key={game.name} className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all cursor-pointer" onClick={() => handlePlayGame(game.name)}>
                <div className="aspect-video bg-gradient-card relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="lg" className="rounded-full w-16 h-16 p-0" onClick={(e) => { e.stopPropagation(); handlePlayGame(game.name); }}>
                      <Play className="h-6 w-6" fill="currentColor" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-foreground mb-1">{game.name}</h3>
                  <p className="text-sm text-muted-foreground">{game.provider}</p>
                  <p className="text-xs text-primary mt-1">{game.type}</p>
                </div>
              </Card>
            ))}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Roulette;
