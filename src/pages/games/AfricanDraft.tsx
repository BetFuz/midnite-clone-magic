import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Users, Bot, Trophy, Shield, TrendingUp, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const AfricanDraft = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState(500);

  const gameModes = [
    {
      id: "p2p",
      name: "P2P Betting",
      icon: Users,
      description: "Player vs Player direct betting",
      features: ["Real-time odds adjustment", "Betting pools", "Peer-to-peer matching"],
      minBet: 500,
      maxBet: 100000,
      color: "blue"
    },
    {
      id: "vs-ai",
      name: "Beat the AI",
      icon: Bot,
      description: "Challenge AI at different difficulties",
      features: ["Easy (2x odds)", "Medium (5x odds)", "Hard (10x odds)", "Expert (20x odds)"],
      minBet: 300,
      maxBet: 75000,
      color: "green"
    },
    {
      id: "ai-tournament",
      name: "AI Tournament",
      icon: Trophy,
      description: "Bet on AI vs AI matchups",
      features: ["Live AI battles", "Performance history", "Dynamic odds"],
      minBet: 1000,
      maxBet: 200000,
      color: "purple"
    },
    {
      id: "cultural",
      name: "Traditional Mode",
      icon: Crown,
      description: "Play with authentic African rules",
      features: ["Cultural authenticity", "Historical context", "Traditional scoring"],
      minBet: 500,
      maxBet: 100000,
      color: "yellow"
    }
  ];

  const liveMatches = [
    { id: 1, player1: "Kofi_GH", player2: "Ade_NG", odds: "2.4 vs 1.8", status: "Live", viewers: 234 },
    { id: 2, player1: "Thabo_ZA", player2: "Amara_KE", odds: "1.9 vs 2.2", status: "Live", viewers: 189 },
    { id: 3, player1: "AI_Champion", player2: "AI_Rookie", odds: "1.5 vs 3.2", status: "Starting", viewers: 456 }
  ];

  const aiDifficulties = [
    { level: "Easy", odds: "2.0x", winRate: "75%", color: "text-green-500" },
    { level: "Medium", odds: "5.0x", winRate: "45%", color: "text-yellow-500" },
    { level: "Hard", odds: "10.0x", winRate: "25%", color: "text-orange-500" },
    { level: "Expert", odds: "20.0x", winRate: "10%", color: "text-red-500" }
  ];

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
    const mode = gameModes.find(m => m.id === modeId);
    toast({
      title: "Mode Selected",
      description: `${mode?.name} - ${mode?.description}`
    });
  };

  const handlePlaceBet = () => {
    toast({
      title: "Bet Placed",
      description: `₦${betAmount.toLocaleString()} on African Draft`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                  <Crown className="h-8 w-8 text-yellow-500" />
                  African Draft
                </h1>
                <p className="text-muted-foreground">Traditional African strategy game with modern betting</p>
              </div>
              <Badge variant="outline" className="text-sm bg-yellow-600/10 text-yellow-600 border-yellow-600/20">
                <Shield className="h-4 w-4 mr-1" />
                Provably Fair
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="modes" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="modes">Game Modes</TabsTrigger>
              <TabsTrigger value="live">Live Matches</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="modes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gameModes.map((mode) => (
                  <Card
                    key={mode.id}
                    className={`p-6 cursor-pointer transition-all hover:border-primary/50 ${
                      selectedMode === mode.id ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => handleModeSelect(mode.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-${mode.color}-600/10`}>
                        <mode.icon className={`h-6 w-6 text-${mode.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">{mode.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{mode.description}</p>
                        <div className="space-y-1">
                          {mode.features.map((feature, idx) => (
                            <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                              <span className="w-1 h-1 bg-primary rounded-full"></span>
                              {feature}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Min: ₦{mode.minBet.toLocaleString()}</span>
                          <span>Max: ₦{mode.maxBet.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {selectedMode === "vs-ai" && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Bot className="h-5 w-5 text-green-600" />
                    Select AI Difficulty
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {aiDifficulties.map((diff) => (
                      <Card key={diff.level} className="p-4 hover:border-primary/50 transition-all cursor-pointer">
                        <div className="text-center">
                          <h4 className={`font-bold text-lg mb-2 ${diff.color}`}>{diff.level}</h4>
                          <div className="text-2xl font-bold text-primary mb-2">{diff.odds}</div>
                          <div className="text-xs text-muted-foreground">Win Rate: {diff.winRate}</div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              )}

              {selectedMode && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">Place Your Bet</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Bet Amount (₦)</label>
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                        min={gameModes.find(m => m.id === selectedMode)?.minBet}
                        max={gameModes.find(m => m.id === selectedMode)?.maxBet}
                      />
                    </div>
                    <Button onClick={handlePlaceBet} className="w-full" size="lg">
                      Place Bet - ₦{betAmount.toLocaleString()}
                    </Button>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="live" className="space-y-4">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Live Matches
              </h3>
              {liveMatches.map((match) => (
                <Card key={match.id} className="p-4 hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <Badge variant={match.status === "Live" ? "default" : "secondary"} className="text-xs">
                          {match.status === "Live" && <Clock className="h-3 w-3 mr-1 animate-pulse" />}
                          {match.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{match.viewers} viewers</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-foreground">{match.player1}</span>
                        <span className="text-sm text-muted-foreground">vs</span>
                        <span className="font-semibold text-foreground">{match.player2}</span>
                      </div>
                      <div className="text-sm text-primary mt-2">Odds: {match.odds}</div>
                    </div>
                    <Button size="sm">Watch & Bet</Button>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Game Rules</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>African Draft is a traditional strategy game that combines elements of checkers and chess.</p>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Objective</h4>
                    <p>Capture all opponent pieces or block them from making any legal moves.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Movement</h4>
                    <p>Pieces move diagonally forward. Captured pieces become yours.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Betting Rules</h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Minimum bet: ₦500</li>
                      <li>Maximum bet: ₦100,000</li>
                      <li>Odds adjust based on player skill ratings</li>
                      <li>Provably fair random seed generation</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Your Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">0</div>
                    <div className="text-xs text-muted-foreground">Games Played</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">0</div>
                    <div className="text-xs text-muted-foreground">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-1">0</div>
                    <div className="text-xs text-muted-foreground">Losses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">0%</div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        
        <BetSlip />
      </div>
    </div>
  );
};

export default AfricanDraft;
