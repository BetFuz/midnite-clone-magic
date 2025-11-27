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

export default function Morabaraba() {
  const [activeMode, setActiveMode] = useState('p2p');

  const handlePlaceBet = (mode: string, difficulty?: string) => {
    toast({
      title: 'Bet Placed',
      description: `Morabaraba ${mode} bet placed${difficulty ? ` at ${difficulty} level` : ''}`,
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
                  <h1 className="text-3xl font-bold mb-2">Morabaraba</h1>
                  <p className="text-muted-foreground mb-4">
                    Traditional Southern African strategy game where players aim to form "mills" (three pieces in a row) to capture opponent's pieces. Sacred game played for centuries in South Africa and Botswana.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Provably Fair
                    </Badge>
                    <Badge variant="secondary">🇿🇦 South African Origin</Badge>
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
                  <span className="hidden sm:inline">Cow Trading</span>
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
                  <span className="hidden sm:inline">Sacred Cows</span>
                  <span className="sm:hidden">Cultural</span>
                </TabsTrigger>
              </TabsList>

              {/* P2P Mode - Cow Trading */}
              <TabsContent value="p2p" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Cow Trading Betting
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Traditional Cow Stakes</p>
                        <p className="text-sm text-muted-foreground">Bet using traditional cow-based value system</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Player vs Player Matching</p>
                        <p className="text-sm text-muted-foreground">Direct competition with stake trading</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Community Pools</p>
                        <p className="text-sm text-muted-foreground">Join traditional betting circles</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Honor System</p>
                        <p className="text-sm text-muted-foreground">Respected traditional betting protocols</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Min Bet</span>
                      <span className="font-medium">₦300</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Max Bet</span>
                      <span className="font-medium">₦75,000</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={() => handlePlaceBet('Cow Trading')}
                  >
                    Enter Cow Trading Match
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
                        <p className="font-medium">Mill Formation Challenge</p>
                        <p className="text-sm text-muted-foreground">Test your strategic mill-building skills</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Capture Performance Bets</p>
                        <p className="text-sm text-muted-foreground">Bonus multipliers for capture streaks</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Strategic Mastery</p>
                        <p className="text-sm text-muted-foreground">Unlock advanced tactical achievements</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Select Difficulty:</h4>
                    {['Novice', 'Skilled', 'Expert', 'Master'].map((level) => (
                      <Button
                        key={level}
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => handlePlaceBet('Human vs AI', level)}
                      >
                        <span>{level}</span>
                        <Badge variant="secondary">
                          {level === 'Novice' ? '2x' : level === 'Skilled' ? '4x' : level === 'Expert' ? '8x' : '15x'}
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
                        <p className="font-medium">Strategic AI Profiles</p>
                        <p className="text-sm text-muted-foreground">Different AI mill-building strategies compete</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Historical Performance</p>
                        <p className="text-sm text-muted-foreground">Track AI win patterns and tendencies</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">24/7 Tournaments</p>
                        <p className="text-sm text-muted-foreground">Continuous AI competitions running</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Live Odds Adjustment</p>
                        <p className="text-sm text-muted-foreground">Real-time odds based on AI moves</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Next Tournament</span>
                      <span className="font-medium">8m 45s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Active Bets</span>
                      <span className="font-medium">1,832</span>
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

              {/* Cultural Mode - Sacred Cows */}
              <TabsContent value="cultural" className="space-y-4">
                <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-background">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-amber-500" />
                    Sacred Cows Mode
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Ancient Tradition</p>
                        <p className="text-sm text-muted-foreground">Play as practiced by Sotho-Tswana ancestors</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Sacred Game Rules</p>
                        <p className="text-sm text-muted-foreground">Traditional rules honoring cultural heritage</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Cow Symbolism</p>
                        <p className="text-sm text-muted-foreground">Each piece represents cattle wealth and prosperity</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-sm text-center italic text-muted-foreground">
                      "Morabaraba teaches patience, strategy, and respect for tradition" - Sotho-Tswana Wisdom
                    </p>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-amber-600 hover:bg-amber-700" 
                    size="lg"
                    onClick={() => handlePlaceBet('Sacred Cows')}
                  >
                    Play Sacred Cows Mode
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
                    <li>Place pieces on board intersections during placement phase</li>
                    <li>Form "mills" (three pieces in a row) to capture opponent pieces</li>
                    <li>Move pieces along lines after placement phase</li>
                    <li>Win by reducing opponent to 2 pieces or blocking all moves</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-2">Betting Rules:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Pre-game betting available before first piece placement</li>
                    <li>Live betting enabled after placement phase</li>
                    <li>Cash out available until final capture</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Player Stats */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Top Players This Week</h3>
              <div className="space-y-3">
                {[
                  { player: 'MillMaster_ZA', wins: 143, odds: '1.7' },
                  { player: 'CowKeeper', wins: 131, odds: '2.0' },
                  { player: 'Strategist_SA', wins: 127, odds: '2.2' },
                  { player: 'Joburg_Pro', wins: 118, odds: '2.4' },
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
