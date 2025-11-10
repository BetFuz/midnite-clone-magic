import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Star } from "lucide-react";

const Games = () => {
  const gameCategories = ["All Games", "Slots", "Table Games", "Jackpots", "New Games", "Popular"];
  
  const games = [
    { name: "Starburst", provider: "NetEnt", category: "Slots", featured: true },
    { name: "Gonzo's Quest", provider: "NetEnt", category: "Slots", featured: true },
    { name: "Book of Dead", provider: "Play'n GO", category: "Slots", featured: false },
    { name: "Blackjack Classic", provider: "Evolution", category: "Table", featured: false },
    { name: "Mega Moolah", provider: "Microgaming", category: "Jackpot", featured: true },
    { name: "Immortal Romance", provider: "Microgaming", category: "Slots", featured: false },
    { name: "European Roulette", provider: "NetEnt", category: "Table", featured: false },
    { name: "Dead or Alive 2", provider: "NetEnt", category: "Slots", featured: true },
    { name: "Rainbow Riches", provider: "Barcrest", category: "Slots", featured: false },
    { name: "Legacy of Dead", provider: "Play'n GO", category: "Slots", featured: false },
    { name: "Reactoonz", provider: "Play'n GO", category: "Slots", featured: false },
    { name: "Baccarat Pro", provider: "NetEnt", category: "Table", featured: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Casino Games</h1>
            <p className="text-muted-foreground">Thousands of games to choose from</p>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {gameCategories.map((category) => (
              <Button
                key={category}
                variant="secondary"
                size="sm"
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Featured Games</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {games.filter(game => game.featured).map((game, index) => (
                <Card key={index} className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
                  <div className="aspect-square bg-gradient-card relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="lg" className="rounded-full w-16 h-16 p-0">
                        <Play className="h-6 w-6" fill="currentColor" />
                      </Button>
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="bg-primary/20 backdrop-blur-sm rounded-full p-1.5">
                        <Star className="h-4 w-4 text-primary" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-foreground mb-1 truncate">{game.name}</h3>
                    <p className="text-xs text-muted-foreground">{game.provider}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">All Games</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {games.map((game, index) => (
                <Card key={index} className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
                  <div className="aspect-square bg-gradient-card relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="lg" className="rounded-full w-16 h-16 p-0">
                        <Play className="h-6 w-6" fill="currentColor" />
                      </Button>
                    </div>
                    {game.featured && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-primary/20 backdrop-blur-sm rounded-full p-1.5">
                          <Star className="h-4 w-4 text-primary" fill="currentColor" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-foreground mb-1 truncate">{game.name}</h3>
                    <p className="text-xs text-muted-foreground">{game.provider}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </main>

        <BetSlip />
      </div>
    </div>
  );
};

export default Games;
