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

  const { gameState, handlePitClick, isProcessing, resetGame, createGameSession, sessionId, betting } = useMancalaGame({
    gameId: null,
    mode: activeMode,
    userId: null,
    stakeAmount,
    difficulty,
    variant,
    culturalMode: activeMode === 'cultural',
  });

  const startGame = async () => {
    resetGame();
    
    // Create game session for betting
    const newSessionId = await createGameSession();
    
    setGameStarted(true);
    toast({
      title: 'Game Started',
      description: `Mancala (${variant}) ${activeMode} game started${activeMode === 'human-ai' ? ` at ${difficulty} level` : ''}`,
    });
  };

  // Place pre-game bet
  const handlePlaceBet = async (betType: string, betValue: string) => {
    if (!sessionId) {
      toast({
        title: 'Start Game First',
        description: 'Please start a game before placing bets',
        variant: 'destructive',
      });
      return;
    }

    await betting.placeBet(sessionId, betType, betValue);
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

                    {/* Active Bets Display */}
                    {betting.activeBets.length > 0 && (
                      <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm font-medium mb-2">Active Bets:</p>
                        {betting.activeBets.map((bet) => (
                          <div key={bet.id} className="text-xs text-muted-foreground flex justify-between">
                            <span>{bet.bet_type}: {bet.bet_value}</span>
                            <span className="text-primary">₦{bet.potential_win.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Bet Options */}
                    {!gameState.gameOver && betting.availableBets.length > 0 && (
                      <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                        <p className="text-sm font-medium mb-2">Quick Bets:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {betting.availableBets.slice(0, 2).map((betType) => (
                            <Button
                              key={betType.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handlePlaceBet(betType.id, 'player1')}
                              disabled={betting.isPlacingBet}
                            >
                              {betType.culturalName || betType.name}
                              <Badge variant="secondary" className="ml-2">{betType.odds}x</Badge>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

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

                    {/* Active Bets Display */}
                    {betting.activeBets.length > 0 && (
                      <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm font-medium mb-2">Your Bets:</p>
                        {betting.activeBets.map((bet) => (
                          <div key={bet.id} className="text-xs text-muted-foreground flex justify-between mb-1">
                            <span>{bet.bet_type}: {bet.bet_value}</span>
                            <Badge variant={bet.status === 'won' ? 'default' : bet.status === 'lost' ? 'destructive' : 'secondary'}>
                              {bet.status === 'active' ? `₦${bet.potential_win.toFixed(2)}` : bet.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Performance Bets */}
                    {!gameState.gameOver && betting.availableBets.length > 0 && (
                      <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                        <p className="text-sm font-medium mb-2">Bet on Your Performance:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePlaceBet('winner', 'player1')}
                            disabled={betting.isPlacingBet}
                          >
                            Win Game
                            <Badge variant="secondary" className="ml-2">
                              {betting.calculateOdds('winner', difficulty)}x
                            </Badge>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePlaceBet('seeds_captured', '30')}
                            disabled={betting.isPlacingBet}
                          >
                            30+ Seeds
                            <Badge variant="secondary" className="ml-2">
                              {betting.calculateOdds('seeds_captured', difficulty)}x
                            </Badge>
                          </Button>
                        </div>
                      </div>
                    )}

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
                {!gameStarted ? (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      AI Tournament
                    </h3>
                    <div className="space-y-4 mb-6">
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
                      <div>
                        <Label>Tournament Stake (₦)</Label>
                        <Input
                          type="number"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(Number(e.target.value))}
                          min={500}
                          max={20000}
                          className="mt-1"
                        />
                      </div>
                    </div>
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
                ) : (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold">AI Tournament ({variant})</h3>
                        <p className="text-sm text-muted-foreground">Bet on AI matchups</p>
                      </div>
                      <Button variant="outline" onClick={() => { resetGame(); setGameStarted(false); }}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        New Tournament
                      </Button>
                    </div>

                    {/* AI Tournament Betting */}
                    {betting.availableBets.length > 0 && !gameState.gameOver && (
                      <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                        <p className="text-sm font-medium mb-2">Bet on Winner:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePlaceBet('winner', 'player1')}
                            disabled={betting.isPlacingBet}
                          >
                            AI 1 Wins
                            <Badge variant="secondary" className="ml-2">1.9x</Badge>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePlaceBet('winner', 'player2')}
                            disabled={betting.isPlacingBet}
                          >
                            AI 2 Wins
                            <Badge variant="secondary" className="ml-2">1.9x</Badge>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Active Tournament Bets */}
                    {betting.activeBets.length > 0 && (
                      <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm font-medium mb-2">Tournament Bets:</p>
                        {betting.activeBets.map((bet) => (
                          <div key={bet.id} className="text-xs text-muted-foreground flex justify-between">
                            <span>{bet.bet_type}: {bet.bet_value}</span>
                            <Badge variant={bet.status === 'won' ? 'default' : bet.status === 'lost' ? 'destructive' : 'secondary'}>
                              {bet.status === 'active' ? `₦${bet.potential_win.toFixed(2)}` : bet.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col items-center gap-6">
                      <div className="text-lg font-bold text-center">
                        {gameState.gameOver 
                          ? `Tournament Over! ${gameState.winner === 'player1' ? 'AI 1 Wins!' : gameState.winner === 'player2' ? 'AI 2 Wins!' : 'Draw!'}`
                          : `AI Tournament in Progress...`}
                      </div>

                      <MancalaBoard
                        gameState={gameState}
                        onPitClick={() => {}}
                        culturalMode={false}
                      />

                      <div className="text-center text-sm text-muted-foreground">
                        {!gameState.gameOver && <p>AI players are competing for victory</p>}
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

              {/* Cultural Mode - Seed Master */}
              <TabsContent value="cultural" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Seed Master Mode
                  </h3>
                  <div className="space-y-3 mb-4 text-sm">
                    <div className="flex items-start gap-3">
                      <Sprout className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Traditional Seed Counting</p>
                        <p className="text-muted-foreground">Experience authentic African seed-sowing gameplay</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Crown className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Cultural Celebrations</p>
                        <p className="text-muted-foreground">Receive ancestral blessings and traditional messages</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={startGame}
                  >
                    Begin Seed Master Journey
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
