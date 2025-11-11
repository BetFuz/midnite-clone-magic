import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, Target, Crown, Ticket, Grid3x3, Search,
  Trophy, Star, Zap, Flame, TrendingUp, Users, DollarSign
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

const CasinoLobby = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "All Games", count: 120, icon: Grid3x3 },
    { name: "Slots", count: 45, icon: Sparkles },
    { name: "Live Casino", count: 24, icon: Users },
    { name: "Table Games", count: 18, icon: Target },
    { name: "Jackpots", count: 12, icon: Trophy },
    { name: "African Games", count: 15, icon: Crown },
  ];

  const jackpots = [
    { name: "Mega Naira Jackpot", amount: 250000000, players: 45230, color: "from-amber-500 to-orange-600" },
    { name: "Lagos Millionaire", amount: 150000000, players: 32140, color: "from-purple-500 to-pink-600" },
    { name: "African Dream", amount: 85000000, players: 18560, color: "from-green-500 to-emerald-600" },
  ];

  const featuredGames = [
    { 
      name: "Lagos Lights Megaways",
      provider: "Betfuz Studios",
      type: "Slot",
      rtp: 96.5,
      theme: "🌆",
      players: 3420,
      featured: true,
    },
    {
      name: "Naija Lightning Roulette",
      provider: "Evolution Gaming",
      type: "Live Casino",
      rtp: 97.3,
      theme: "⚡",
      players: 2156,
      hot: true,
    },
    {
      name: "Afrobeat Bonanza",
      provider: "Betfuz Studios",
      type: "Slot",
      rtp: 95.8,
      theme: "🎵",
      players: 1892,
      new: true,
    },
    {
      name: "Jollof Jackpot",
      provider: "Betfuz Studios",
      type: "Slot",
      rtp: 94.2,
      theme: "🍲",
      players: 4523,
      jackpot: true,
    },
  ];

  const liveGames = [
    { name: "Lagos Blackjack", dealer: "Amaka", players: 8, seats: 7, minBet: 500 },
    { name: "Naija Roulette", dealer: "Chidi", players: 12, seats: "∞", minBet: 100 },
    { name: "African Baccarat", dealer: "Yemi", players: 5, seats: 9, minBet: 1000 },
    { name: "Nigerian Poker", dealer: "Tunde", players: 6, seats: 6, minBet: 2000 },
  ];

  const slots = [
    { name: "Lagos Nights", rtp: 96.5, volatility: "High", maxWin: "5000x" },
    { name: "Naija Treasures", rtp: 95.8, volatility: "Medium", maxWin: "2500x" },
    { name: "African Safari", rtp: 97.2, volatility: "Low", maxWin: "1000x" },
    { name: "Masquerade Magic", rtp: 96.0, volatility: "High", maxWin: "10000x" },
    { name: "Jollof Fortune", rtp: 94.5, volatility: "Medium", maxWin: "3000x" },
    { name: "Ankara Riches", rtp: 95.5, volatility: "High", maxWin: "7500x" },
  ];

  const handlePlayGame = (gameName: string) => {
    toast.success(`Loading ${gameName}...`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 md:ml-64 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-8 md:p-12">
              <div className="relative z-10">
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  <Crown className="h-3 w-3 mr-1" />
                  Casino
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Betfuz Casino
                </h1>
                <p className="text-lg text-white/90 mb-6 max-w-2xl">
                  120+ premium casino games featuring African themes, progressive jackpots, and live dealers from Lagos
                </p>
                <div className="flex gap-4">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                    <Zap className="h-5 w-5 mr-2" />
                    Play Now
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10">
                    View Jackpots
                  </Button>
                </div>
              </div>
            </div>

            {/* Progressive Jackpots */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Trophy className="h-6 w-6 text-amber-500" />
                Progressive Jackpots
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {jackpots.map((jackpot, idx) => (
                  <Card key={idx} className="relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${jackpot.color} opacity-10`} />
                    <CardContent className="relative p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">{jackpot.name}</h3>
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          {jackpot.players.toLocaleString()}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Current Prize</p>
                        <p className="text-3xl font-bold text-primary">{formatCurrency(jackpot.amount)}</p>
                      </div>
                      <Button className="w-full" onClick={() => handlePlayGame(jackpot.name)}>
                        Play to Win
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Search & Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search games..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((cat) => (
                  <Button key={cat.name} variant="outline" className="whitespace-nowrap gap-2">
                    <cat.icon className="h-4 w-4" />
                    {cat.name}
                    <Badge variant="secondary" className="ml-1">{cat.count}</Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Featured Games */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Star className="h-6 w-6 text-amber-500" />
                Featured Games
              </h2>
              <div className="grid md:grid-cols-4 gap-6">
                {featuredGames.map((game, idx) => (
                  <Card key={idx} className="overflow-hidden group hover:shadow-2xl transition-all cursor-pointer" onClick={() => handlePlayGame(game.name)}>
                    <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <span className="text-6xl">{game.theme}</span>
                      {game.featured && (
                        <Badge className="absolute top-2 right-2 bg-amber-500">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {game.hot && (
                        <Badge className="absolute top-2 right-2 bg-red-500">
                          <Flame className="h-3 w-3 mr-1" />
                          Hot
                        </Badge>
                      )}
                      {game.new && (
                        <Badge className="absolute top-2 right-2 bg-green-500">
                          <Sparkles className="h-3 w-3 mr-1" />
                          New
                        </Badge>
                      )}
                      {game.jackpot && (
                        <Badge className="absolute top-2 right-2 bg-purple-500">
                          <Trophy className="h-3 w-3 mr-1" />
                          Jackpot
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-sm mb-1">{game.name}</h3>
                        <p className="text-xs text-muted-foreground">{game.provider}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">RTP {game.rtp}%</Badge>
                          <Badge variant="outline" className="gap-1">
                            <Users className="h-3 w-3" />
                            {game.players}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" className="w-full opacity-0 group-hover:opacity-100 transition-opacity">
                        Play Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Live Casino Tables */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Users className="h-6 w-6 text-red-500" />
                  Live Casino
                </h2>
                <Badge variant="destructive" className="gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  {liveGames.length} Tables Open
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {liveGames.map((table, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold mb-1">{table.name}</h3>
                          <p className="text-sm text-muted-foreground">Dealer: {table.dealer}</p>
                        </div>
                        <Badge variant="destructive" className="gap-1">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          LIVE
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Players</p>
                          <p className="font-bold">{table.players}/{table.seats}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Min Bet</p>
                          <p className="font-bold">{formatCurrency(table.minBet)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <p className="font-bold text-green-500">Open</p>
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => handlePlayGame(table.name)}>
                        Join Table
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Slots Collection */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-purple-500" />
                African-Themed Slots
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {slots.map((slot, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => handlePlayGame(slot.name)}>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">{slot.name}</h3>
                        <Badge variant="outline">{slot.volatility}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">RTP</p>
                          <p className="font-semibold">{slot.rtp}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Max Win</p>
                          <p className="font-semibold text-green-500">{slot.maxWin}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        Play Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Quick Links */}
            <section className="grid md:grid-cols-4 gap-4">
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/casino/blackjack')}>
                <Target className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Blackjack</h3>
                <p className="text-sm text-muted-foreground">12 tables</p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/casino/roulette')}>
                <Crown className="h-8 w-8 text-amber-500 mb-3" />
                <h3 className="font-bold mb-2">Roulette</h3>
                <p className="text-sm text-muted-foreground">8 tables</p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/casino/slots')}>
                <Sparkles className="h-8 w-8 text-purple-500 mb-3" />
                <h3 className="font-bold mb-2">All Slots</h3>
                <p className="text-sm text-muted-foreground">45 games</p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
                <Ticket className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-bold mb-2">Lottery</h3>
                <p className="text-sm text-muted-foreground">Daily draws</p>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CasinoLobby;
