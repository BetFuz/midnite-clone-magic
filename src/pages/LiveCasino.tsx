import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Play } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const LiveCasino = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Tables");
  const categories = ["All Tables", "Roulette", "Blackjack", "Baccarat", "Game Shows", "Poker"];
  
  const handleJoinTable = (tableName: string) => {
    toast({
      title: "Joining Table",
      description: `${tableName} is loading...`,
    });
  };
  
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    toast({
      title: "Category Selected",
      description: `Showing ${category}`,
    });
  };
  
  const liveTables = [
    { name: "Lightning Roulette", dealer: "Sarah", players: 847, provider: "Evolution", minStake: 100, maxStake: 5000000, category: "Roulette" },
    { name: "Blackjack VIP", dealer: "Michael", players: 234, provider: "Evolution", minStake: 2500, maxStake: 10000000, category: "Blackjack" },
    { name: "Crazy Time", dealer: "Anna", players: 1432, provider: "Evolution", minStake: 100, maxStake: 1000000, category: "Game Shows" },
    { name: "Baccarat Squeeze", dealer: "Chen", players: 567, provider: "Evolution", minStake: 1000, maxStake: 5000000, category: "Baccarat" },
    { name: "Mega Ball", dealer: "Emma", players: 923, provider: "Evolution", minStake: 100, maxStake: 100000, category: "Game Shows" },
    { name: "Speed Roulette", dealer: "David", players: 689, provider: "Evolution", minStake: 500, maxStake: 2500000, category: "Roulette" },
    { name: "Infinite Blackjack", dealer: "Lisa", players: 1156, provider: "Evolution", minStake: 1000, maxStake: 5000000, category: "Blackjack" },
    { name: "Dragon Tiger", dealer: "Wei", players: 445, provider: "Evolution", minStake: 1000, maxStake: 2500000, category: "Baccarat" },
  ];

  const filteredTables = selectedCategory === "All Tables" 
    ? liveTables 
    : liveTables.filter((t) => t.category === selectedCategory);

  const featuredTables = filteredTables.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">Live Casino</h1>
              <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                <span className="w-2 h-2 bg-destructive rounded-full mr-2 animate-pulse"></span>
                LIVE
              </Badge>
            </div>
            <p className="text-muted-foreground">Real dealers, real-time gaming</p>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 pr-24">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                size="sm"
                className="whitespace-nowrap"
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Featured Tables</h2>
            <div className="grid grid-cols-2 gap-4">
            {featuredTables.map((table, index) => (
                <Card key={index} className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all cursor-pointer" onClick={() => handleJoinTable(table.name)}>
                  <div className="aspect-video bg-gradient-card relative">
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-destructive/90 text-white">
                        <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span>
                        LIVE
                      </Badge>
                      <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                        <Users className="h-3 w-3 mr-1" />
                        {table.players}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="lg" className="rounded-full w-16 h-16 p-0 bg-primary text-primary-foreground hover:bg-primary/90" onClick={(e) => { e.stopPropagation(); handleJoinTable(table.name); }}>
                        <Play className="h-6 w-6" fill="currentColor" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-foreground mb-1">{table.name}</h3>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Dealer: {table.dealer}</span>
                      <span className="text-muted-foreground">{table.provider}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Stakes: {formatCurrency(table.minStake)} - {formatCurrency(table.maxStake)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">All Live Tables</h2>
            <div className="grid grid-cols-2 gap-4">
            {liveTables.map((table, index) => (
                <Card key={index} className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all cursor-pointer" onClick={() => handleJoinTable(table.name)}>
                  <div className="aspect-video bg-gradient-card relative">
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-destructive/90 text-white">
                        <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span>
                        LIVE
                      </Badge>
                      <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                        <Users className="h-3 w-3 mr-1" />
                        {table.players}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="lg" className="rounded-full w-16 h-16 p-0 bg-primary text-primary-foreground hover:bg-primary/90" onClick={(e) => { e.stopPropagation(); handleJoinTable(table.name); }}>
                        <Play className="h-6 w-6" fill="currentColor" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-foreground mb-1">{table.name}</h3>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Dealer: {table.dealer}</span>
                      <span className="text-muted-foreground">{table.provider}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Stakes: {formatCurrency(table.minStake)} - {formatCurrency(table.maxStake)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </main>

        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default LiveCasino;
