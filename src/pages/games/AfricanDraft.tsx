import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import MobileNav from '@/components/MobileNav';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Bot, Globe, Shield, Zap, Crown, Play, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AfricanDraftBoard from '@/components/games/AfricanDraftBoard';
import { useAfricanDraftGame, GameMode } from '@/hooks/useAfricanDraftGame';

export default function AfricanDraft() {
  const [activeMode, setActiveMode] = useState<GameMode>('p2p');
  const [isPlaying, setIsPlaying] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('1000');
  const [aiDifficulty, setAiDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'master'>('intermediate');

  const { boardState, handleMove, resetGame, isProcessing } = useAfricanDraftGame({
    mode: activeMode,
    aiDifficulty: aiDifficulty
  });

  const startGame = () => {
    setIsPlaying(true);
    toast({
      title: 'Game Started!',
      description: `African Draft ${activeMode} game started with ₦${stakeAmount} stake`,
    });
  };

  const handleReset = () => {
    resetGame();
    setIsPlaying(false);
    toast({
      title: 'Game Reset',
      description: 'Starting new game',
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
            <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as GameMode)}>
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
                {!isPlaying ? (
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
                    </div>
                    <div className="mt-6 space-y-3">
                      <label className="text-sm font-medium">Stake Amount (₦)</label>
                      <Input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        min="500"
                        max="100000"
                      />
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      size="lg"
                      onClick={startGame}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start P2P Match
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <Card className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">P2P Match</h3>
                          <p className="text-sm text-muted-foreground">Stake: ₦{stakeAmount}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleReset}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          New Game
                        </Button>
                      </div>
                      <AfricanDraftBoard
                        boardState={boardState}
                        onMove={handleMove}
                        disabled={isProcessing}
                      />
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Human vs AI Mode */}
              <TabsContent value="human-ai" className="space-y-4">
                {!isPlaying ? (
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
                    </div>

                    <div className="space-y-3 mb-4">
                      <label className="text-sm font-medium">Stake Amount (₦)</label>
                      <Input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        min="500"
                        max="100000"
                      />
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Select Difficulty:</h4>
                      {[
                        { level: 'beginner', label: 'Beginner', multiplier: '1.5x' },
                        { level: 'intermediate', label: 'Intermediate', multiplier: '3x' },
                        { level: 'advanced', label: 'Advanced', multiplier: '6x' },
                        { level: 'master', label: 'Master', multiplier: '12x' }
                      ].map(({ level, label, multiplier }) => (
                        <Button
                          key={level}
                          variant={aiDifficulty === level ? "default" : "outline"}
                          className="w-full justify-between"
                          onClick={() => {
                            setAiDifficulty(level as any);
                            setActiveMode('human-ai');
                            startGame();
                          }}
                        >
                          <span>{label}</span>
                          <Badge variant="secondary">{multiplier}</Badge>
                        </Button>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <Card className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">vs AI ({aiDifficulty})</h3>
                          <p className="text-sm text-muted-foreground">Stake: ₦{stakeAmount}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleReset}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          New Game
                        </Button>
                      </div>
                      <AfricanDraftBoard
                        boardState={boardState}
                        onMove={handleMove}
                        disabled={isProcessing || boardState.currentPlayer === 'black'}
                      />
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* AI vs AI Mode */}
              <TabsContent value="ai-ai" className="space-y-4">
                {!isPlaying ? (
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
                    </div>
                    <div className="mt-6 space-y-3">
                      <label className="text-sm font-medium">Stake Amount (₦)</label>
                      <Input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        min="500"
                        max="100000"
                      />
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      size="lg"
                      onClick={startGame}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch AI Tournament
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <Card className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">AI vs AI Match</h3>
                          <p className="text-sm text-muted-foreground">Stake: ₦{stakeAmount}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleReset}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          New Match
                        </Button>
                      </div>
                      <AfricanDraftBoard
                        boardState={boardState}
                        onMove={handleMove}
                        disabled={true}
                      />
                    </Card>
                  </div>
                )}
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
                    onClick={() => {
                      setActiveMode('cultural');
                      startGame();
                    }}
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
