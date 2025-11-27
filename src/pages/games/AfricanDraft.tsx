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

export default function AfricanDraft() {
  const [activeMode, setActiveMode] = useState('p2p');

  const handlePlaceBet = (mode: string, difficulty?: string) => {
    toast({
      title: 'Bet Placed',
      description: `African Draft ${mode} bet placed${difficulty ? ` at ${difficulty} level` : ''}`,
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
                  <h1 className="text-3xl font-bold mb-2">African Draft</h1>
                  <p className="text-muted-foreground mb-4">
                    Traditional West African strategy game where players maneuver pieces across the board to capture opponent's pieces. Known as "Draughts" across Nigeria and Ghana.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Provably Fair
                    </Badge>
                    <Badge variant="secondary">🇳🇬 Nigerian Origin</Badge>
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
                  <span className="hidden sm:inline">P2P</span>
                </TabsTrigger>
                <TabsTrigger value="human-ai" className="gap-2">
                  <Bot className="h-4 w-4" />
                  <span className="hidden sm:inline">Beat AI</span>
                </TabsTrigger>
                <TabsTrigger value="ai-ai" className="gap-2">
                  <Bot className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Tournament</span>
                </TabsTrigger>
                <TabsTrigger value="cultural" className="gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">Traditional</span>
                </TabsTrigger>
              </TabsList>

              {/* P2P Mode */}
              <TabsContent value="p2p" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Player vs Player Betting
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Direct Player Matching</p>
                        <p className="text-sm text-muted-foreground">Bet against other players in real-time matches</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Shared Betting Pools</p>
                        <p className="text-sm text-muted-foreground">Join community pools for larger wins</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Real-time Odds</p>
                        <p className="text-sm text-muted-foreground">Odds adjust based on player performance</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Peer Matching</p>
                        <p className="text-sm text-muted-foreground">Automatic matchmaking by skill level</p>
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
                      <span className="font-medium">₦100,000</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={() => handlePlaceBet('P2P')}
                  >
                    Find Match & Place Bet
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
                        <p className="font-medium">Challenge AI Opponents</p>
                        <p className="text-sm text-muted-foreground">Test your skills against intelligent AI</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Performance Challenges</p>
                        <p className="text-sm text-muted-foreground">Earn bonuses for winning streaks</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Skill Achievements</p>
                        <p className="text-sm text-muted-foreground">Unlock achievements and higher multipliers</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Select Difficulty:</h4>
                    {['Beginner', 'Intermediate', 'Advanced', 'Master'].map((level) => (
                      <Button
                        key={level}
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => handlePlaceBet('Human vs AI', level)}
                      >
                        <span>{level}</span>
                        <Badge variant="secondary">
                          {level === 'Beginner' ? '1.5x' : level === 'Intermediate' ? '3x' : level === 'Advanced' ? '6x' : '12x'}
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
                        <p className="font-medium">AI Personality Matchups</p>
                        <p className="text-sm text-muted-foreground">Watch different AI strategies compete</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Performance History</p>
                        <p className="text-sm text-muted-foreground">Analyze AI win rates and patterns</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Live Tournaments</p>
                        <p className="text-sm text-muted-foreground">24/7 automated AI competitions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Dynamic Odds</p>
                        <p className="text-sm text-muted-foreground">Odds based on AI performance data</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Next Tournament</span>
                      <span className="font-medium">15m 30s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Bets</span>
                      <span className="font-medium">2,451</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={() => handlePlaceBet('AI Tournament')}
                  >
                    Place Tournament Bet
                  </Button>
                </Card>
              </TabsContent>

              {/* Cultural Mode */}
              <TabsContent value="cultural" className="space-y-4">
                <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-background">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-amber-500" />
                    Traditional Mode
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Authentic Gameplay</p>
                        <p className="text-sm text-muted-foreground">Experience the game as played for generations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Cultural Heritage</p>
                        <p className="text-sm text-muted-foreground">Learn traditional rules and strategies</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Community Respect</p>
                        <p className="text-sm text-muted-foreground">Honor the heritage of African gaming</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-sm text-center italic text-muted-foreground">
                      "The strategy taught by our elders, passed down through generations" - Nigerian Proverb
                    </p>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-amber-600 hover:bg-amber-700" 
                    size="lg"
                    onClick={() => handlePlaceBet('Traditional')}
                  >
                    Play Traditional Mode
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
                    <li>Pieces move diagonally forward on dark squares</li>
                    <li>Capture opponent's pieces by jumping over them</li>
                    <li>Reach the opposite end to crown your piece</li>
                    <li>Crowned pieces can move backward</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-2">Betting Rules:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Place bets before match begins</li>
                    <li>Live betting available after first 3 moves</li>
                    <li>Cash out option available until final capture</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Player Stats */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Top Players This Week</h3>
              <div className="space-y-3">
                {[
                  { player: 'Champion_NG', wins: 127, odds: '1.8' },
                  { player: 'DraftMaster', wins: 119, odds: '2.1' },
                  { player: 'Strategist_01', wins: 112, odds: '2.3' },
                  { player: 'Lagos_Pro', wins: 104, odds: '2.5' },
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
