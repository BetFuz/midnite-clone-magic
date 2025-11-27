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

const Morabaraba = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState(300);

  const gameModes = [
    {
      id: "cow-trading",
      name: "Cow Trading",
      icon: Users,
      description: "Bet cattle in traditional Morabaraba style",
      features: ["Cattle stakes", "Community betting", "Traditional rewards"],
      minBet: 300,
      maxBet: 75000,
      color: "green"
    },
    {
      id: "vs-ai",
      name: "Beat the AI",
      icon: Bot,
      description: "Challenge AI herdsmen",
      features: ["Novice (2x)", "Farmer (5x)", "Master (12x)", "Elder (25x)"],
      minBet: 200,
      maxBet: 50000,
      color: "blue"
    },
    {
      id: "ai-tournament",
      name: "AI Championship",
      icon: Trophy,
      description: "Watch AI masters compete",
      features: ["AI rankings", "Betting pools", "Tournament brackets"],
      minBet: 500,
      maxBet: 100000,
      color: "purple"
    },
    {
      id: "sacred",
      name: "Sacred Cows",
      icon: Crown,
      description: "Traditional ceremony mode",
      features: ["Cultural rituals", "Spiritual stakes", "Ancestral blessings"],
      minBet: 1000,
      maxBet: 150000,
      color: "yellow"
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
                  🐄 Morabaraba
                </h1>
                <p className="text-muted-foreground">Ancient cattle herding strategy game from Southern Africa</p>
              </div>
              <Badge variant="outline" className="text-sm bg-green-600/10 text-green-600 border-green-600/20">
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
                              <span className="w-1 h-1 bg-green-600 rounded-full"></span>
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
                    <Button onClick={() => toast({ title: "Bet Placed", description: `₦${betAmount.toLocaleString()} on Morabaraba` })} className="w-full" size="lg">
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
                  <p>Morabaraba (also known as Twelve Men's Morris) is a traditional South African strategy board game.</p>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Objective</h4>
                    <p>Form "mills" (three in a row) to capture opponent's cows. Reduce opponent to 2 cows or block all moves.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Cultural Significance</h4>
                    <p>Traditionally played by South African cattle herders. Cows represent wealth and prosperity in Sotho culture.</p>
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
                    <div className="text-xs text-muted-foreground">Cows Won</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-1">0</div>
                    <div className="text-xs text-muted-foreground">Cows Lost</div>
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

export default Morabaraba;
