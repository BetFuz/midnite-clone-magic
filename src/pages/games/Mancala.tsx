import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import MobileNav from '@/components/MobileNav';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Bot, Globe, Shield, Zap, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Mancala() {
  const [activeMode, setActiveMode] = useState('p2p');

  const handlePlaceBet = (mode: string, difficulty?: string) => {
    toast({
      title: 'Bet Placed',
      description: `Mancala ${mode} bet placed${difficulty ? ` at ${difficulty} level` : ''}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 md:ml-64">
          <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-6">
            {/* Game Header */}
            <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">Mancala</h1>
                  <p className="text-muted-foreground mb-4">
                    Ancient African count-and-capture game played with seeds and pits. One of the oldest board games in history, dating back over 7,000 years across Africa and the Middle East.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Provably Fair
                    </Badge>
                    <Badge variant="secondary">🌍 Pan-African Origin</Badge>
                    <Badge variant="secondary">Traditional</Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Game Modes */}
            <Tabs value={activeMode} onValueChange={setActiveMode}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="p2p" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Seed Betting</span>
                  <span className="sm:hidden">P2P</span>
                </TabsTrigger>
                <TabsTrigger value="human-ai" className="gap-2">
                  <Bot className="h-4 w-4" />
                  <span className="hidden sm:inline">Beat AI</span>
                  <span className="sm:hidden">AI</span>
                </TabsTrigger>
                <TabsTrigger value="ai-ai" className="gap-2">
                  <Bot className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Tournament</span>
                  <span className="sm:hidden">AI vs AI</span>
                </TabsTrigger>
                <TabsTrigger value="cultural" className="gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">Seed Master</span>
                  <span className="sm:hidden">Cultural</span>
                </TabsTrigger>
              </TabsList>

              {/* P2P Mode - Seed Betting */}
              <TabsContent value="p2p" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Seed Betting
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Direct Player Competition</p>
                        <p className="text-sm text-muted-foreground">Bet on seed collection vs opponents</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Seed Pool Betting</p>
                        <p className="text-sm text-muted-foreground">Community pools with shared winnings</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Live Odds Updates</p>
                        <p className="text-sm text-muted-foreground">Odds change based on seed counts</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Skill-Based Matching</p>
                        <p className="text-sm text-muted-foreground">Fair pairing by experience level</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Min Bet</span>
                      <span className="font-medium">₦200</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Max Bet</span>
                      <span className="font-medium">₦50,000</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={() => handlePlaceBet('Seed Betting')}
                  >
                    Join Seed Betting Match
                  </Button>
                </Card>
              </TabsContent>

              {/* Human vs AI Mode */}
              <TabsContent value="human-ai" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    Beat the AI
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Seed Strategy Challenge</p>
                        <p className="text-sm text-muted-foreground">Master optimal seed distribution</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Collection Bonuses</p>
                        <p className="text-sm text-muted-foreground">Earn multipliers for seed hoarding</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Tactical Mastery</p>
                        <p className="text-sm text-muted-foreground">Unlock advanced counting techniques</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Select Difficulty:</h4>
                    {['Learner', 'Competent', 'Advanced', 'Grandmaster'].map((level) => (
                      <Button
                        key={level}
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => handlePlaceBet('Human vs AI', level)}
                      >
                        <span>{level}</span>
                        <Badge variant="secondary">
                          {level === 'Learner' ? '1.8x' : level === 'Competent' ? '3.5x' : level === 'Advanced' ? '7x' : '12x'}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* AI vs AI Mode */}
              <TabsContent value="ai-ai" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    AI Tournament
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">AI Strategy Matchups</p>
                        <p className="text-sm text-muted-foreground">Different counting strategies compete</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Statistical Analysis</p>
                        <p className="text-sm text-muted-foreground">Track AI win patterns and tactics</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Continuous Tournaments</p>
                        <p className="text-sm text-muted-foreground">Round-the-clock AI competitions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Dynamic Seed Odds</p>
                        <p className="text-sm text-muted-foreground">Real-time odds based on seed positions</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Next Tournament</span>
                      <span className="font-medium">6m 15s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Active Bets</span>
                      <span className="font-medium">2,187</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={() => handlePlaceBet('AI Tournament')}
                  >
                    Bet on AI Tournament
                  </Button>
                </Card>
              </TabsContent>

              {/* Cultural Mode - Seed Master */}
              <TabsContent value="cultural" className="space-y-4">
                <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-background">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-amber-500" />
                    Seed Master Mode
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Ancient Counting Art</p>
                        <p className="text-sm text-muted-foreground">Master the oldest counting game in human history</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Traditional Rules</p>
                        <p className="text-sm text-muted-foreground">Play using authentic African variants</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Cultural Heritage</p>
                        <p className="text-sm text-muted-foreground">Connect with 7,000 years of African gaming tradition</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-sm text-center italic text-muted-foreground">
                      "Mancala teaches mathematics, foresight, and wisdom passed through generations"
                    </p>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-amber-600 hover:bg-amber-700" 
                    size="lg"
                    onClick={() => handlePlaceBet('Seed Master')}
                  >
                    Become Seed Master
                  </Button>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Rules */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Game Rules</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-2">Basic Rules:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Pick up all seeds from one pit and sow them counterclockwise</li>
                    <li>Capture seeds when last seed lands in specific conditions</li>
                    <li>Collect seeds in your store (mancala) on your side</li>
                    <li>Win by collecting more seeds than your opponent</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-2">Betting Rules:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Pre-match betting on final seed count</li>
                    <li>Live betting enabled after first 5 moves</li>
                    <li>Cash out available throughout match</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Player Stats */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Top Players This Week</h3>
              <div className="space-y-3">
                {[
                  { player: 'SeedCounter_Pro', wins: 156, odds: '1.6' },
                  { player: 'AfricanMaster', wins: 148, odds: '1.9' },
                  { player: 'Tactician_001', wins: 139, odds: '2.1' },
                  { player: 'Lagos_Seed', wins: 133, odds: '2.3' },
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Crown className={`h-5 w-5 ${idx === 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="font-medium">{stat.player}</p>
                        <p className="text-sm text-muted-foreground">{stat.wins} wins</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{stat.odds}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
        <BetSlip className="hidden lg:block" />
      </div>
      <MobileNav />
    </div>
  );
}
