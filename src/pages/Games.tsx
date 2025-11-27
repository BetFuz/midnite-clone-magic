import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Play, Star, TrendingUp, Zap, Dice1, Hash, Grid3x3, CircleDot, Sparkles, Disc, CreditCard, Shuffle, Search, Shield, Crown, Users, Bot, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Games = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const gameCategories = [
    { id: "All", label: "All Games", icon: Shuffle },
    { id: "Traditional", label: "Traditional", icon: Crown },
    { id: "Crash", label: "Crash", icon: TrendingUp },
    { id: "Spin", label: "Spin", icon: Disc },
    { id: "Dice", label: "Dice", icon: Dice1 },
    { id: "Numbers", label: "Numbers", icon: Hash },
    { id: "Mines", label: "Mines", icon: Grid3x3 },
    { id: "Plinko", label: "Plinko", icon: CircleDot },
    { id: "Instant", label: "Instant Win", icon: Zap },
    { id: "Virtual", label: "Virtual Sports", icon: Sparkles },
    { id: "Cards", label: "Cards", icon: CreditCard },
  ];

  const allGames = [
    // Traditional African Games (4) - Each game supports P2P, Human vs AI, AI vs AI, and Cultural Mode
    { id: 41, name: "African Draft", category: "Traditional", minBet: 500, maxBet: 100000, multiplier: "2x - 20x", featured: true, african: true, provablyFair: true, modes: ["P2P Betting", "Beat AI", "AI Tournament", "Traditional"], slug: "african-draft" },
    { id: 42, name: "Morabaraba", category: "Traditional", minBet: 300, maxBet: 75000, multiplier: "2x - 15x", featured: true, african: true, provablyFair: true, modes: ["Cow Trading", "Beat AI", "AI Tournament", "Sacred Cows"], slug: "morabaraba" },
    { id: 43, name: "Mancala", category: "Traditional", minBet: 200, maxBet: 50000, multiplier: "2x - 12x", featured: true, african: true, provablyFair: true, modes: ["Seed Betting", "Beat AI", "AI Tournament", "Seed Master"], slug: "mancala" },
    { id: 44, name: "Pan-African Tournament", category: "Traditional", minBet: 1000, maxBet: 200000, multiplier: "5x - 100x", featured: true, african: true, provablyFair: true, modes: ["Multi-Player", "Skill Levels", "AI Championship", "Pan-African"], slug: "tournament" },

    // Crash Games (5)
    { id: 1, name: "Aviator Classic", category: "Crash", minBet: 10, maxBet: 100000, multiplier: "1.00x - 1000x+", featured: true, african: false, provablyFair: true },
    { id: 2, name: "Space Rocket", category: "Crash", minBet: 10, maxBet: 100000, multiplier: "1.00x - 500x", featured: true, african: true, provablyFair: true },
    { id: 3, name: "Lucky Jet", category: "Crash", minBet: 20, maxBet: 50000, multiplier: "1.00x - 800x", featured: false, african: false, provablyFair: true },
    { id: 4, name: "Crash X Nigeria", category: "Crash", minBet: 10, maxBet: 100000, multiplier: "1.00x - 600x", featured: true, african: true, provablyFair: true },
    { id: 5, name: "Rocket Race", category: "Crash", minBet: 50, maxBet: 200000, multiplier: "1.00x - 1500x", featured: false, african: false, provablyFair: true },

    // Spin Games (4)
    { id: 6, name: "Lucky Wheel Nigeria", category: "Spin", minBet: 100, maxBet: 50000, multiplier: "2x - 500x", featured: true, african: true, provablyFair: false },
    { id: 7, name: "Color Wheel", category: "Spin", minBet: 50, maxBet: 20000, multiplier: "2x - 100x", featured: false, african: false, provablyFair: true },
    { id: 8, name: "Mega Wheel Live", category: "Spin", minBet: 200, maxBet: 100000, multiplier: "5x - 1000x", featured: true, african: false, provablyFair: false },
    { id: 9, name: "Cash Spin Lagos", category: "Spin", minBet: 50, maxBet: 30000, multiplier: "2x - 200x", featured: false, african: true, provablyFair: true },

    // Dice Games (3)
    { id: 10, name: "Classic Dice", category: "Dice", minBet: 10, maxBet: 50000, multiplier: "1.01x - 99x", featured: true, african: false, provablyFair: true },
    { id: 11, name: "African Dice", category: "Dice", minBet: 10, maxBet: 50000, multiplier: "1.01x - 99x", featured: true, african: true, provablyFair: true },
    { id: 12, name: "Multi-Dice", category: "Dice", minBet: 20, maxBet: 75000, multiplier: "2x - 150x", featured: false, african: false, provablyFair: true },

    // Number Games (4)
    { id: 13, name: "Lucky Numbers", category: "Numbers", minBet: 100, maxBet: 10000, multiplier: "10x - 10000x", featured: true, african: true, provablyFair: false },
    { id: 14, name: "Quick Pick 3", category: "Numbers", minBet: 50, maxBet: 5000, multiplier: "5x - 500x", featured: true, african: false, provablyFair: false },
    { id: 15, name: "Mega Draw", category: "Numbers", minBet: 200, maxBet: 20000, multiplier: "50x - 50000x", featured: false, african: false, provablyFair: false },
    { id: 16, name: "Keno Nigeria", category: "Numbers", minBet: 100, maxBet: 15000, multiplier: "10x - 5000x", featured: false, african: true, provablyFair: false },

    // Mines Games (3)
    { id: 17, name: "Classic Mines", category: "Mines", minBet: 10, maxBet: 100000, multiplier: "1.01x - 1000x", featured: true, african: false, provablyFair: true },
    { id: 18, name: "Diamond Mines", category: "Mines", minBet: 20, maxBet: 100000, multiplier: "1.01x - 800x", featured: true, african: true, provablyFair: true },
    { id: 19, name: "Treasure Hunt", category: "Mines", minBet: 10, maxBet: 75000, multiplier: "1.01x - 600x", featured: false, african: true, provablyFair: true },

    // Plinko Games (3)
    { id: 20, name: "Plinko Classic", category: "Plinko", minBet: 10, maxBet: 100000, multiplier: "0.5x - 1000x", featured: true, african: false, provablyFair: true },
    { id: 21, name: "Lagos Plinko", category: "Plinko", minBet: 10, maxBet: 75000, multiplier: "0.5x - 800x", featured: true, african: true, provablyFair: true },
    { id: 22, name: "Mega Plinko", category: "Plinko", minBet: 50, maxBet: 150000, multiplier: "0.5x - 1500x", featured: false, african: false, provablyFair: true },

    // Instant Win Games (5)
    { id: 23, name: "Scratch Cards Nigeria", category: "Instant", minBet: 100, maxBet: 5000, multiplier: "1x - 5000x", featured: true, african: true, provablyFair: false },
    { id: 24, name: "Instant Cash", category: "Instant", minBet: 50, maxBet: 10000, multiplier: "1x - 1000x", featured: false, african: false, provablyFair: false },
    { id: 25, name: "Lucky 7s", category: "Instant", minBet: 100, maxBet: 20000, multiplier: "1x - 777x", featured: true, african: false, provablyFair: false },
    { id: 26, name: "Gold Rush", category: "Instant", minBet: 200, maxBet: 25000, multiplier: "1x - 2500x", featured: false, african: true, provablyFair: false },
    { id: 27, name: "Cash Blast", category: "Instant", minBet: 50, maxBet: 15000, multiplier: "1x - 500x", featured: false, african: false, provablyFair: false },

    // Virtual Sports (6)
    { id: 28, name: "Virtual Football", category: "Virtual", minBet: 100, maxBet: 50000, multiplier: "1.5x - 50x", featured: true, african: true, provablyFair: false },
    { id: 29, name: "Virtual Horse Racing", category: "Virtual", minBet: 100, maxBet: 50000, multiplier: "2x - 100x", featured: true, african: false, provablyFair: false },
    { id: 30, name: "Virtual Greyhounds", category: "Virtual", minBet: 50, maxBet: 30000, multiplier: "2x - 80x", featured: false, african: false, provablyFair: false },
    { id: 31, name: "Virtual Speedway", category: "Virtual", minBet: 100, maxBet: 40000, multiplier: "2x - 120x", featured: false, african: false, provablyFair: false },
    { id: 32, name: "Virtual Tennis", category: "Virtual", minBet: 100, maxBet: 35000, multiplier: "1.5x - 40x", featured: false, african: false, provablyFair: false },
    { id: 33, name: "Virtual Basketball", category: "Virtual", minBet: 100, maxBet: 45000, multiplier: "1.5x - 60x", featured: true, african: false, provablyFair: false },

    // Card Games (4)
    { id: 34, name: "Hi-Lo Cards", category: "Cards", minBet: 10, maxBet: 50000, multiplier: "1.5x - 100x", featured: true, african: false, provablyFair: true },
    { id: 35, name: "Card Crash", category: "Cards", minBet: 20, maxBet: 75000, multiplier: "1.5x - 150x", featured: false, african: false, provablyFair: true },
    { id: 36, name: "Lucky Cards Nigeria", category: "Cards", minBet: 50, maxBet: 50000, multiplier: "2x - 200x", featured: true, african: true, provablyFair: true },
    { id: 37, name: "Speed Baccarat", category: "Cards", minBet: 100, maxBet: 100000, multiplier: "0.95x - 8x", featured: false, african: false, provablyFair: false },

    // Hybrid Games (3)
    { id: 38, name: "FuzBlast", category: "Hybrid", minBet: 50, maxBet: 100000, multiplier: "1x - 1000x", featured: true, african: true, provablyFair: true },
    { id: 39, name: "Naija Fortune", category: "Hybrid", minBet: 100, maxBet: 75000, multiplier: "2x - 888x", featured: true, african: true, provablyFair: true },
    { id: 40, name: "Cash Climb", category: "Hybrid", minBet: 50, maxBet: 50000, multiplier: "1x - 500x", featured: false, african: true, provablyFair: true },
  ];
  
  const handlePlayGame = (gameName: string, isDemo: boolean = false) => {
    toast({
      title: isDemo ? "Demo Mode" : "Launching Game",
      description: isDemo ? `Playing ${gameName} with virtual currency` : `${gameName} is loading...`,
    });
  };
  
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = gameCategories.find(c => c.id === categoryId);
    toast({
      title: "Category Selected",
      description: `Showing ${category?.label || 'all games'}`,
    });
  };

  const filteredGames = allGames.filter(game => {
    const matchesCategory = selectedCategory === "All" || game.category === selectedCategory;
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredGames = allGames.filter(g => g.featured);
  const africanGames = allGames.filter(g => g.african);
  const provablyFairGames = allGames.filter(g => g.provablyFair);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">FuzGames</h1>
                <p className="text-muted-foreground">Instant games, virtual sports & provably fair gaming</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {provablyFairGames.length} Provably Fair
                </Badge>
                <Badge variant="outline" className="text-xs bg-green-600/10 text-green-600 border-green-600/20">
                  🇳🇬 {africanGames.length} Nigerian Themed
                </Badge>
              </div>
            </div>
            
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 pr-24">
            {gameCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "secondary"}
                size="sm"
                className="whitespace-nowrap flex items-center gap-1.5"
                onClick={() => handleCategoryClick(category.id)}
              >
                <category.icon className="h-4 w-4" />
                {category.label}
              </Button>
            ))}
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" fill="currentColor" />
              Featured Games
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredGames.length === 0 ? (
                <p className="text-muted-foreground text-sm col-span-2 md:col-span-4">No featured games available.</p>
              ) : (
                featuredGames.map((game) => (
                  <Card key={game.id} className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
                    <div className="aspect-square bg-gradient-to-br from-primary/20 via-primary/5 to-background relative flex items-center justify-center">
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="lg" className="rounded-full w-14 h-14 p-0" onClick={(e) => { e.stopPropagation(); handlePlayGame(game.name, false); }}>
                          <Play className="h-5 w-5" fill="currentColor" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handlePlayGame(game.name, true); }}>
                          Demo Mode
                        </Button>
                      </div>
                      {game.african && (
                        <Badge className="absolute top-2 left-2 bg-green-600 hover:bg-green-700 text-white text-xs">
                          🇳🇬 Nigerian
                        </Badge>
                      )}
                      {game.provablyFair && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-primary/20 backdrop-blur-sm rounded-full p-1.5" title="Provably Fair">
                            <Shield className="h-3.5 w-3.5 text-primary" />
                          </div>
                        </div>
                      )}
                      <div className="text-center px-3">
                        <TrendingUp className="h-12 w-12 text-primary/40 mx-auto mb-2" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-foreground mb-1 truncate">{game.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{game.category} • {game.multiplier}</p>
                      <p className="text-xs text-muted-foreground">Min: ₦{game.minBet.toLocaleString()}</p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* Popular Nigerian Games */}
          {africanGames.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                🇳🇬 Popular Nigerian Games
                <Badge variant="secondary" className="text-xs">{africanGames.length}</Badge>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {africanGames.slice(0, 5).map((game) => (
                  <Card key={game.id} className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
                    <div className="aspect-square bg-gradient-to-br from-green-600/20 via-green-600/5 to-background relative flex items-center justify-center">
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" className="rounded-full w-10 h-10 p-0" onClick={(e) => { e.stopPropagation(); handlePlayGame(game.name, false); }}>
                          <Play className="h-4 w-4" fill="currentColor" />
                        </Button>
                      </div>
                      <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs">
                        Nigerian
                      </Badge>
                      <Zap className="h-10 w-10 text-green-600/40" />
                    </div>
                    <div className="p-2">
                      <h3 className="font-semibold text-xs text-foreground truncate">{game.name}</h3>
                      <p className="text-xs text-muted-foreground">{game.multiplier}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Traditional African Games Section */}
          {allGames.filter(g => g.category === "Traditional").length > 0 && searchQuery === "" && selectedCategory === "All" && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Traditional African Games
                <Badge variant="secondary" className="text-xs bg-yellow-600/10 text-yellow-600">4 Games • All Modes</Badge>
              </h2>
              <div className="bg-card border border-yellow-600/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Experience authentic African games with modern betting. Each game supports multiple modes:
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className="text-xs"><Users className="h-3 w-3 mr-1" />P2P Betting</Badge>
                  <Badge variant="outline" className="text-xs"><Bot className="h-3 w-3 mr-1" />Human vs AI</Badge>
                  <Badge variant="outline" className="text-xs"><Trophy className="h-3 w-3 mr-1" />AI Tournament</Badge>
                  <Badge variant="outline" className="text-xs"><Crown className="h-3 w-3 mr-1" />Cultural Mode</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allGames.filter(g => g.category === "Traditional").map((game) => (
                  <Card 
                    key={game.id} 
                    className="group overflow-hidden bg-card border-yellow-600/20 hover:border-yellow-600/50 transition-all cursor-pointer"
                    onClick={() => game.slug && navigate(`/games/${game.slug}`)}
                  >
                    <div className="aspect-square bg-gradient-to-br from-yellow-600/20 via-yellow-600/5 to-background relative flex items-center justify-center">
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" className="rounded-full w-10 h-10 p-0" onClick={(e) => { e.stopPropagation(); handlePlayGame(game.name, false); }}>
                          <Play className="h-4 w-4" fill="currentColor" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handlePlayGame(game.name, true); }}>
                          Demo
                        </Button>
                      </div>
                      <Badge className="absolute top-2 left-2 bg-yellow-600 text-white text-xs">
                        🏆 Traditional
                      </Badge>
                      <div className="absolute top-2 right-2">
                        <div className="bg-yellow-600/20 backdrop-blur-sm rounded-full p-1.5" title="Provably Fair">
                          <Shield className="h-3.5 w-3.5 text-yellow-600" />
                        </div>
                      </div>
                      <Crown className="h-12 w-12 text-yellow-600/40" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-foreground mb-1 truncate">{game.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{game.multiplier}</p>
                      <div className="flex flex-wrap gap-1">
                        {game.modes?.slice(0, 2).map((mode: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-[10px] px-1 py-0">
                            {mode === "P2P Betting" || mode === "Cow Trading" || mode === "Seed Betting" || mode === "Multi-Player" ? (
                              <Users className="h-2.5 w-2.5 mr-0.5" />
                            ) : mode === "Beat AI" || mode === "Skill Levels" ? (
                              <Bot className="h-2.5 w-2.5 mr-0.5" />
                            ) : mode === "AI Tournament" || mode === "AI Championship" ? (
                              <Trophy className="h-2.5 w-2.5 mr-0.5" />
                            ) : (
                              <Crown className="h-2.5 w-2.5 mr-0.5" />
                            )}
                            {mode}
                          </Badge>
                        ))}
                        {game.modes && game.modes.length > 2 && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            +{game.modes.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Provably Fair Games */}
          {provablyFairGames.length > 0 && searchQuery === "" && selectedCategory === "All" && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Provably Fair Games
                <Badge variant="secondary" className="text-xs">{provablyFairGames.length}</Badge>
              </h2>
              <div className="bg-card border border-border rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground">
                  These games use cryptographic hashing to ensure fairness. Every result can be independently verified by players.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {provablyFairGames.slice(0, 5).map((game) => (
                  <Card key={game.id} className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
                    <div className="aspect-square bg-gradient-to-br from-primary/20 via-primary/5 to-background relative flex items-center justify-center">
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" className="rounded-full w-10 h-10 p-0" onClick={(e) => { e.stopPropagation(); handlePlayGame(game.name, false); }}>
                          <Play className="h-4 w-4" fill="currentColor" />
                        </Button>
                      </div>
                      <Shield className="h-10 w-10 text-primary/40" />
                    </div>
                    <div className="p-2">
                      <h3 className="font-semibold text-xs text-foreground truncate">{game.name}</h3>
                      <p className="text-xs text-muted-foreground">{game.category}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {selectedCategory === "All" ? "All Games" : `${gameCategories.find(c => c.id === selectedCategory)?.label} Games`}
              <span className="text-sm font-normal text-muted-foreground ml-2">({filteredGames.length} games)</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredGames.length === 0 ? (
                <p className="text-muted-foreground text-sm col-span-2 md:col-span-4">No games found. Try adjusting your filters.</p>
              ) : (
                filteredGames.map((game) => (
                  <Card key={game.id} className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
                    <div className="aspect-square bg-gradient-to-br from-primary/20 via-primary/5 to-background relative flex items-center justify-center">
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="lg" className="rounded-full w-14 h-14 p-0" onClick={(e) => { e.stopPropagation(); handlePlayGame(game.name, false); }}>
                          <Play className="h-5 w-5" fill="currentColor" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handlePlayGame(game.name, true); }}>
                          Demo Mode
                        </Button>
                      </div>
                      {game.african && (
                        <Badge className="absolute top-2 left-2 bg-green-600 hover:bg-green-700 text-white text-xs">
                          🇳🇬 Nigerian
                        </Badge>
                      )}
                      {game.provablyFair && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-primary/20 backdrop-blur-sm rounded-full p-1.5" title="Provably Fair">
                            <Shield className="h-3.5 w-3.5 text-primary" />
                          </div>
                        </div>
                      )}
                      {game.featured && (
                        <div className="absolute bottom-2 right-2">
                          <div className="bg-primary/20 backdrop-blur-sm rounded-full p-1.5">
                            <Star className="h-3.5 w-3.5 text-primary" fill="currentColor" />
                          </div>
                        </div>
                      )}
                      <div className="text-center px-3">
                        <TrendingUp className="h-12 w-12 text-primary/40 mx-auto mb-2" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-foreground mb-1 truncate">{game.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{game.category} • {game.multiplier}</p>
                      <p className="text-xs text-muted-foreground">Min: ₦{game.minBet.toLocaleString()}</p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </section>
        </main>

        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Games;
