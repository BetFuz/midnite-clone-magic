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
import { Label } from '@/components/ui/label';
import { Users, Bot, Globe, Shield, Zap, Crown, RotateCcw, Sprout } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MancalaBoard } from '@/components/games/MancalaBoard';
import { useMancalaGame } from '@/hooks/useMancalaGame';
import type { Variant } from '@/lib/games/mancalaEngine';

export default function Mancala() {
  const [activeMode, setActiveMode] = useState<'p2p' | 'human-ai' | 'ai-ai' | 'cultural'>('p2p');
  const [difficulty, setDifficulty] = useState<'Novice' | 'Skilled' | 'Expert' | 'Master'>('Skilled');
  const [stakeAmount, setStakeAmount] = useState<number>(1000);
  const [variant, setVariant] = useState<Variant>('Oware');
  const [gameStarted, setGameStarted] = useState(false);

  const { gameState, handlePitClick, isProcessing, resetGame } = useMancalaGame({
    gameId: null,
    mode: activeMode,
    userId: null,
    stakeAmount,
    difficulty,
    variant,
    culturalMode: activeMode === 'cultural',
  });

  const startGame = () => {
    resetGame();
    setGameStarted(true);
    toast({
      title: 'Game Started',
      description: `Mancala (${variant}) ${activeMode} game started${activeMode === 'human-ai' ? ` at ${difficulty} level` : ''}`,
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
                  <Sprout className="h-8 w-8 text-primary" />
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
            <Tabs value={activeMode} onValueChange={(val) => setActiveMode(val as 'p2p' | 'human-ai' | 'ai-ai' | 'cultural')}>
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
                {!gameStarted ? (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Seed Betting
                    </h3>
                    <div className="space-y-4 mb-6">
                      <div>
                        <Label>Stake Amount (₦)</Label>
                        <Input
                          type="number"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(Number(e.target.value))}
                          min={200}
                          max={50000}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Game Variant</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {(['Oware', 'Kalah'] as const).map((v) => (
                            <Button
                              key={v}
                              variant={variant === v ? 'default' : 'outline'}
                              onClick={() => setVariant(v)}
                            >
                              {v}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      size="lg"
                      onClick={startGame}
                    >
                      Start Seed Betting Match
                    </Button>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold">Seed Betting ({variant})</h3>
                        <p className="text-sm text-muted-foreground">Stake: ₦{stakeAmount.toLocaleString()}</p>
                      </div>
                      <Button variant="outline" onClick={() => { resetGame(); setGameStarted(false); }}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        New Game
                      </Button>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                      <div className={`text-lg font-bold text-center ${gameState.currentPlayer === 'player1' ? 'text-destructive' : 'text-primary'}`}>
                        {gameState.gameOver 
                          ? `Game Over! ${gameState.winner === 'player1' ? 'Player 1 Wins!' : gameState.winner === 'player2' ? 'Player 2 Wins!' : 'Draw!'}`
                          : `${gameState.currentPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s Turn`}
                      </div>

                      <MancalaBoard
                        gameState={gameState}
                        onPitClick={handlePitClick}
                        culturalMode={false}
                      />

                      <div className="text-center text-sm text-muted-foreground max-w-md">
                        {isProcessing && <p className="text-primary font-medium">Processing...</p>}
                        {!isProcessing && !gameState.gameOver && (
                          <p>Click a pit on your side to sow the seeds counter-clockwise</p>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* Human vs AI Mode */}
              <TabsContent value="human-ai" className="space-y-4">
                {!gameStarted ? (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      Beat the AI
                    </h3>
                    <div className="space-y-4 mb-6">
                      <div>
                        <Label>Difficulty Level</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {(['Novice', 'Skilled', 'Expert', 'Master'] as const).map((level) => (
                            <Button
                              key={level}
                              variant={difficulty === level ? 'default' : 'outline'}
                              onClick={() => setDifficulty(level)}
                              className="justify-between"
                            >
                              <span>{level}</span>
                              <Badge variant="secondary">
                                {level === 'Novice' ? '1.8x' : level === 'Skilled' ? '3.5x' : level === 'Expert' ? '7x' : '12x'}
                              </Badge>
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Game Variant</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {(['Oware', 'Kalah'] as const).map((v) => (
                            <Button
                              key={v}
                              variant={variant === v ? 'default' : 'outline'}
                              onClick={() => setVariant(v)}
                            >
                              {v}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      size="lg"
                      onClick={startGame}
                    >
                      Challenge AI ({difficulty})
                    </Button>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold">vs AI ({difficulty})</h3>
                        <p className="text-sm text-muted-foreground">You are Player 1 | Variant: {variant}</p>
                      </div>
                      <Button variant="outline" onClick={() => { resetGame(); setGameStarted(false); }}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                      <div className={`text-lg font-bold ${gameState.currentPlayer === 'player1' ? 'text-destructive' : 'text-primary'}`}>
                        {gameState.gameOver 
                          ? `${gameState.winner === 'player1' ? 'You Win!' : gameState.winner === 'player2' ? 'AI Wins!' : 'Draw!'}`
                          : `${gameState.currentPlayer === 'player1' ? 'Your Turn' : 'AI Thinking...'}`}
                      </div>

                      <MancalaBoard
                        gameState={gameState}
                        onPitClick={handlePitClick}
                        culturalMode={false}
                      />

                      <div className="text-center text-sm text-muted-foreground max-w-md">
                        {isProcessing && <p className="text-primary font-medium">Processing move...</p>}
                        {!isProcessing && !gameState.gameOver && gameState.currentPlayer === 'player1' && (
                          <p>Click a pit on your side (bottom row) to sow seeds</p>
                        )}
                        {gameState.gameOver && (
                          <p className="text-foreground font-medium">
                            Final Score: {gameState.player1Seeds} - {gameState.player2Seeds}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* AI vs AI Mode */}
              <TabsContent value="ai-ai" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    AI Tournament
                  </h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">AI Strategy Matchups</p>
                        <p className="text-sm text-muted-foreground">Watch AI seed counting strategies compete</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={startGame}
                  >
                    Watch AI Tournament
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
