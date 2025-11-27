import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Users, Bot, Trophy, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Mancala = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState(200);

  const gameModes = [
    {
      id: "seed-betting",
      name: "Seed Betting",
      icon: Users,
      description: "Trade seeds in traditional African style",
      features: ["Harvest stakes", "Seed multipliers", "Community pots"],
      minBet: 200,
      maxBet: 50000,
      color: "amber"
    },
    {
      id: "vs-ai",
      name: "Beat the AI",
      icon: Bot,
      description: "Challenge AI seed masters",
      features: ["Beginner (2x)", "Skilled (4x)", "Master (9x)", "Legend (18x)"],
      minBet: 150,
      maxBet: 40000,
      color: "blue"
    },
    {
      id: "ai-tournament",
      name: "AI Tournament",
      icon: Trophy,
      description: "Watch AI seed champions compete",
      features: ["Tournament brackets", "Live betting", "Dynamic odds"],
      minBet: 400,
      maxBet: 80000,
      color: "purple"
    },
    {
      id: "seed-master",
      name: "Seed Master",
      icon: Crown,
      description: "Traditional cultivation ceremonies",
      features: ["Ancient techniques", "Harvest blessings", "Sacred seeds"],
      minBet: 500,
      maxBet: 100000,
      color: "green"
    }
  ];

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
                  🌾 Mancala
                </h1>
                <p className="text-muted-foreground">Ancient African seed counting and strategy game</p>
              </div>
              <Badge variant="outline" className="text-sm bg-amber-600/10 text-amber-600 border-amber-600/20">
                <Shield className="h-4 w-4 mr-1" />
                Provably Fair
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="modes" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="modes">Game Modes</TabsTrigger>
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
                    onClick={() => {
                      setSelectedMode(mode.id);
                      toast({
                        title: "Mode Selected",
                        description: `${mode.name} - ${mode.description}`
                      });
                    }}
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
                              <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
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
                      />
                    </div>
                    <Button onClick={() => toast({ title: "Bet Placed", description: `₦${betAmount.toLocaleString()} on Mancala` })} className="w-full" size="lg">
                      Place Bet - ₦{betAmount.toLocaleString()}
                    </Button>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Game Rules</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Mancala is one of the oldest known board games, with origins in ancient Africa dating back over 7000 years.</p>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Objective</h4>
                    <p>Collect more seeds in your store than your opponent by strategically sowing seeds around the board.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Gameplay</h4>
                    <p>Pick up all seeds from one pit and sow them counterclockwise. Capture opponent seeds by landing in empty pits.</p>
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
                    <div className="text-xs text-muted-foreground">Seeds Won</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-1">0</div>
                    <div className="text-xs text-muted-foreground">Seeds Lost</div>
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

export default Mancala;
