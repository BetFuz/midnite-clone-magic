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
import { Users, Bot, Globe, Shield, Zap, Crown, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MorabarabaBoard } from '@/components/games/MorabarabaBoard';
import { useMorabarabaGame } from '@/hooks/useMorabarabaGame';

export default function Morabaraba() {
  const [activeMode, setActiveMode] = useState<'p2p' | 'human-ai' | 'ai-ai' | 'cultural'>('p2p');
  const [difficulty, setDifficulty] = useState<'Novice' | 'Skilled' | 'Expert' | 'Master'>('Skilled');
  const [stakeAmount, setStakeAmount] = useState<number>(1000);
  const [gameStarted, setGameStarted] = useState(false);

  const { gameState, handlePositionClick, isProcessing, resetGame } = useMorabarabaGame({
    gameId: null,
    mode: activeMode,
    userId: null,
    stakeAmount,
    difficulty,
    culturalMode: activeMode === 'cultural',
  });

  const startGame = () => {
    resetGame();
    setGameStarted(true);
    toast({
      title: 'Game Started',
      description: `Morabaraba ${activeMode} game started${activeMode === 'human-ai' ? ` at ${difficulty} level` : ''}`,
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
            <Tabs value={activeMode} onValueChange={(val) => setActiveMode(val as 'p2p' | 'human-ai' | 'ai-ai' | 'cultural')}>
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
                {!gameStarted ? (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Cow Trading Betting
                    </h3>
                    <div className="space-y-4 mb-6">
                      <div>
                        <Label>Stake Amount (₦)</Label>
                        <Input
                          type="number"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(Number(e.target.value))}
                          min={300}
                          max={75000}
                          className="mt-1"
                        />
                      </div>
                    </div>
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
                    </div>
                    <Button 
                      className="w-full mt-6" 
                      size="lg"
                      onClick={startGame}
                    >
                      Start Cow Trading Match
                    </Button>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold">Cow Trading Match</h3>
                        <p className="text-sm text-muted-foreground">Stake: ₦{stakeAmount.toLocaleString()}</p>
                      </div>
                      <Button variant="outline" onClick={resetGame}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                      {/* Game status */}
                      <div className="flex items-center gap-4 w-full justify-center">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-1">Red Player</div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-destructive" />
                            <span className="font-medium">{gameState.redPiecesRemaining} pieces</span>
                          </div>
                        </div>
                        <div className="text-center px-4">
                          <div className={`text-lg font-bold ${gameState.currentPlayer === 'red' ? 'text-destructive' : 'text-primary'}`}>
                            {gameState.gameOver ? 'Game Over!' : `${gameState.currentPlayer === 'red' ? 'Red' : 'Black'}'s Turn`}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-1">Black Player</div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary" />
                            <span className="font-medium">{gameState.blackPiecesRemaining} pieces</span>
                          </div>
                        </div>
                      </div>

                      {/* Game board */}
                      <MorabarabaBoard
                        gameState={gameState}
                        onPositionClick={handlePositionClick}
                        culturalMode={false}
                      />

                      {/* Instructions */}
                      <div className="text-center text-sm text-muted-foreground max-w-md">
                        {gameState.mustCapture && (
                          <p className="font-medium text-destructive">Select an opponent piece to capture!</p>
                        )}
                        {!gameState.mustCapture && gameState.phase === 'placement' && (
                          <p>Click an empty position to place your piece</p>
                        )}
                        {!gameState.mustCapture && gameState.phase !== 'placement' && !gameState.selectedPiece && (
                          <p>Select one of your pieces to move</p>
                        )}
                        {!gameState.mustCapture && gameState.selectedPiece !== null && (
                          <p>Click a highlighted position to move your piece</p>
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
                                {level === 'Novice' ? '2x' : level === 'Skilled' ? '4x' : level === 'Expert' ? '8x' : '15x'}
                              </Badge>
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
                        <p className="text-sm text-muted-foreground">You are Red</p>
                      </div>
                      <Button variant="outline" onClick={resetGame}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                      <div className="flex items-center gap-4 w-full justify-center">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-1">You (Red)</div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-destructive" />
                            <span className="font-medium">{gameState.redPiecesRemaining} pieces</span>
                          </div>
                        </div>
                        <div className="text-center px-4">
                          <div className={`text-lg font-bold ${gameState.currentPlayer === 'red' ? 'text-destructive' : 'text-primary'}`}>
                            {gameState.gameOver ? (gameState.winner === 'red' ? 'You Win!' : 'AI Wins!') : (gameState.currentPlayer === 'red' ? 'Your Turn' : 'AI Thinking...')}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-1">AI (Black)</div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary" />
                            <span className="font-medium">{gameState.blackPiecesRemaining} pieces</span>
                          </div>
                        </div>
                      </div>

                      <MorabarabaBoard
                        gameState={gameState}
                        onPositionClick={handlePositionClick}
                        culturalMode={false}
                      />

                      <div className="text-center text-sm text-muted-foreground max-w-md">
                        {isProcessing && <p className="text-primary font-medium">Processing...</p>}
                        {gameState.mustCapture && (
                          <p className="font-medium text-destructive">Select an opponent piece to capture!</p>
                        )}
                        {!isProcessing && !gameState.mustCapture && gameState.phase === 'placement' && (
                          <p>Click an empty position to place your piece</p>
                        )}
                        {!isProcessing && !gameState.mustCapture && gameState.phase !== 'placement' && !gameState.selectedPiece && (
                          <p>Select one of your pieces to move</p>
                        )}
                        {!isProcessing && !gameState.mustCapture && gameState.selectedPiece !== null && (
                          <p>Click a highlighted position to move your piece</p>
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
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Strategic AI Profiles</p>
                        <p className="text-sm text-muted-foreground">Different AI mill-building strategies compete</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Next Tournament</span>
                      <span className="font-medium">8m 45s</span>
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
                  </div>
                  <Button 
                    className="w-full mt-4 bg-amber-600 hover:bg-amber-700" 
                    size="lg"
                    onClick={startGame}
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
