import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import MobileNav from '@/components/MobileNav';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Bot, Globe, Shield, Zap, Target, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Tournament() {
  const [activeMode, setActiveMode] = useState('p2p');

  const handlePlaceBet = (mode: string, difficulty?: string) => {
    toast({
      title: 'Bet Placed',
      description: `Tournament ${mode} bet placed${difficulty ? ` at ${difficulty} level` : ''}`,
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
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">Pan-African Tournament</h1>
                  <p className="text-muted-foreground mb-4">
                    Multi-stage championship format featuring the best players across Africa. Battle through qualifiers, regionals, and finals to claim continental glory.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Provably Fair
                    </Badge>
                    <Badge variant="secondary">Multi-Stage Format</Badge>
                    <Badge variant="secondary">Live Streaming</Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Game Modes */}
            <Tabs value={activeMode} onValueChange={setActiveMode}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="p2p" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">P2P Tournament</span>
                  <span className="sm:hidden">P2P</span>
                </TabsTrigger>
                <TabsTrigger value="human-ai" className="gap-2">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Beat AI</span>
                  <span className="sm:hidden">AI</span>
                </TabsTrigger>
                <TabsTrigger value="ai-ai" className="gap-2">
                  <Bot className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Championship</span>
                  <span className="sm:hidden">AI vs AI</span>
                </TabsTrigger>
                <TabsTrigger value="cultural" className="gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">Pan-African</span>
                  <span className="sm:hidden">Cultural</span>
                </TabsTrigger>
              </TabsList>

              {/* P2P Tournament Mode */}
              <TabsContent value="p2p" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Multi-Player Tournament Betting
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Tournament Brackets</p>
                        <p className="text-sm text-muted-foreground">Bet on knockout stages and finals</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Group Stage Betting</p>
                        <p className="text-sm text-muted-foreground">Predict group winners and qualifiers</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Live Tournament Odds</p>
                        <p className="text-sm text-muted-foreground">Real-time odds as tournament progresses</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Champion Prediction Pools</p>
                        <p className="text-sm text-muted-foreground">Join pools betting on ultimate winner</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Min Bet</span>
                      <span className="font-medium">₦500</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Max Bet</span>
                      <span className="font-medium">₦500,000</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={() => handlePlaceBet('Multi-Player')}
                  >
                    Join Tournament Betting Pool
                  </Button>
                </Card>
              </TabsContent>

              {/* Human vs AI Mode */}
              <TabsContent value="human-ai" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Tournament Skill Challenges
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Regional Qualifiers</p>
                        <p className="text-sm text-muted-foreground">Beat AI to qualify for next stage</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Championship Mode</p>
                        <p className="text-sm text-muted-foreground">Compete for continental title</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Skill-Based Odds</p>
                        <p className="text-sm text-muted-foreground">Odds adjust based on performance level</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Select Tournament Level:</h4>
                    {['Regional Qualifier', 'Semi-Finals', 'Grand Final', 'Continental Champion'].map((level) => (
                      <Button
                        key={level}
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => handlePlaceBet('Tournament Challenge', level)}
                      >
                        <span>{level}</span>
                        <Badge variant="secondary">
                          {level === 'Regional Qualifier' ? '2.5x' : level === 'Semi-Finals' ? '5.0x' : level === 'Grand Final' ? '10.0x' : '25.0x'}
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
                    AI Championship Tournament
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">AI Tournament Brackets</p>
                        <p className="text-sm text-muted-foreground">32 AI contestants battle for supremacy</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">AI Performance Analytics</p>
                        <p className="text-sm text-muted-foreground">Historical data on AI strategies</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Live AI Matches</p>
                        <p className="text-sm text-muted-foreground">Watch AI battles in real-time</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Dynamic Tournament Odds</p>
                        <p className="text-sm text-muted-foreground">Odds update as tournament advances</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Active AI Tournaments</span>
                      <span className="font-medium">8 Live</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Next Championship</span>
                      <span className="font-medium">2h 15m</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={() => handlePlaceBet('AI Championship')}
                  >
                    Bet on AI Tournament
                  </Button>
                </Card>
              </TabsContent>

              {/* Cultural Mode */}
              <TabsContent value="cultural" className="space-y-4">
                <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-background">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    Pan-African Championship
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Continental Unity</p>
                        <p className="text-sm text-muted-foreground">Celebrates African gaming heritage across 54 nations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Cultural Legacy Format</p>
                        <p className="text-sm text-muted-foreground">Traditional tournament rules from ancestral games</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Champion of Champions</p>
                        <p className="text-sm text-muted-foreground">Winners earn legendary status and cultural honors</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Heritage Prizes</p>
                        <p className="text-sm text-muted-foreground">Special rewards honoring African traditions</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-sm text-center italic text-muted-foreground">
                      "The tournament brings together the wisdom of our ancestors with the spirit of competition" - Pan-African Gaming Federation
                    </p>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-amber-600 hover:bg-amber-700" 
                    size="lg"
                    onClick={() => handlePlaceBet('Pan-African')}
                  >
                    Enter Pan-African Championship
                  </Button>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Rules */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Tournament Rules</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-2">Championship Format:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Regional qualifiers determine tournament seeding</li>
                    <li>Knockout format from Round of 32 to Grand Final</li>
                    <li>Best-of-3 matches in early rounds, Best-of-5 in finals</li>
                    <li>Continental champion crowned after final match</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-2">Betting Structure:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Bet on individual matches or entire tournament brackets</li>
                    <li>Live betting available during all tournament stages</li>
                    <li>Special prop bets on MVPs and performance milestones</li>
                    <li>Championship pool betting with progressive jackpots</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Player Stats */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Tournament Leaderboard</h3>
              <div className="space-y-3">
                {[
                  { player: 'Adebayo', country: 'NG', wins: 47, odds: '3.5' },
                  { player: 'Kgosi', country: 'ZA', wins: 45, odds: '4.0' },
                  { player: 'Jabari', country: 'KE', wins: 43, odds: '4.5' },
                  { player: 'Amara', country: 'GH', wins: 41, odds: '5.0' },
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Crown className={`h-5 w-5 ${idx === 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="font-medium">{stat.player}</p>
                        <p className="text-sm text-muted-foreground">Country: {stat.country} • Wins: {stat.wins}</p>
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
