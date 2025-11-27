import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import MobileNav from '@/components/MobileNav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Crown, RotateCcw, Sprout } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MancalaBoard } from '@/components/games/MancalaBoard';
import { UniversalGameInterface } from '@/components/games/UniversalGameInterface';
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

            {/* Universal Game Interface */}
            <UniversalGameInterface
              gameType="mancala"
              gameState={gameState}
              gameMode={{
                mode: activeMode,
                bettingEnabled: true,
                stakeAmount,
                aiDifficulty: difficulty,
              }}
              onModeChange={(mode) => setActiveMode(mode)}
              bettingState={betting}
              onBetPlace={handlePlaceBet}
              culturalMode={activeMode === 'cultural'}
              onCulturalToggle={() => setActiveMode('p2p')}
              freePlay={false}
              onDifficultyChange={(diff) => setDifficulty(diff)}
            >
              {/* Game Setup and Board Area */}
              {!gameStarted ? (
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Game Setup</h3>
                  <div className="space-y-4">
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
                    <Button 
                      className="w-full mt-4" 
                      size="lg"
                      onClick={startGame}
                    >
                      Start {activeMode === 'p2p' ? 'Seed Betting' : activeMode === 'human-ai' ? 'Challenge AI' : activeMode === 'ai-ai' ? 'AI Tournament' : 'Cultural'} Game
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {activeMode === 'p2p' && `Seed Betting (${variant})`}
                        {activeMode === 'human-ai' && `vs AI (${difficulty})`}
                        {activeMode === 'ai-ai' && `AI Tournament (${variant})`}
                        {activeMode === 'cultural' && `Seed Master (${variant})`}
                      </h3>
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
                        ? `Game Over! ${gameState.winner === 'player1' ? 
                            (activeMode === 'human-ai' ? 'You Win!' : 'Player 1 Wins!') : 
                            gameState.winner === 'player2' ? 
                            (activeMode === 'human-ai' ? 'AI Wins!' : activeMode === 'ai-ai' ? 'AI 2 Wins!' : 'Player 2 Wins!') : 
                            'Draw!'}`
                        : `${gameState.currentPlayer === 'player1' ? 
                            (activeMode === 'human-ai' ? 'Your Turn' : 'Player 1') : 
                            (activeMode === 'human-ai' ? 'AI Thinking...' : activeMode === 'ai-ai' ? 'AI 2' : 'Player 2')}'s Turn`}
                    </div>

                    <MancalaBoard
                      gameState={gameState}
                      onPitClick={handlePitClick}
                      culturalMode={activeMode === 'cultural'}
                    />

                    <div className="text-center text-sm text-muted-foreground max-w-md">
                      {isProcessing && <p className="text-primary font-medium">Processing...</p>}
                      {!isProcessing && !gameState.gameOver && (
                        <p>Click a pit on your side to sow seeds counter-clockwise</p>
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
            </UniversalGameInterface>

            {/* Rules */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Game Rules</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Objective</h4>
                  <p>Capture more seeds than your opponent by strategically sowing seeds around the board.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Gameplay</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Players take turns selecting a pit on their side</li>
                    <li>Seeds are sown counter-clockwise, one per pit</li>
                    <li>Capture opponent's seeds based on variant rules</li>
                    <li>Game ends when one side is empty</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Variants</h4>
                  <p><strong>Oware:</strong> Capture when landing makes opponent's pit 2-3 seeds</p>
                  <p><strong>Kalah:</strong> Capture opposite pit when landing in empty pit on your side</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Betting Modes</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>P2P Betting:</strong> Bet against other players with real-time odds</li>
                    <li><strong>Human vs AI:</strong> Challenge AI at 4 difficulty levels</li>
                    <li><strong>AI vs AI:</strong> Watch and bet on AI tournaments</li>
                    <li><strong>Cultural Mode:</strong> Traditional gameplay with cultural celebrations</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </main>
        <BetSlip />
      </div>
      <MobileNav />
    </div>
  );
}
