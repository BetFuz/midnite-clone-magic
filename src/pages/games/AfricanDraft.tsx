import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import MobileNav from '@/components/MobileNav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Crown, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AfricanDraftBoard from '@/components/games/AfricanDraftBoard';
import { useAfricanDraftGame, GameMode } from '@/hooks/useAfricanDraftGame';
import { UniversalGameInterface } from '@/components/games/UniversalGameInterface';
import { supabase } from '@/integrations/supabase/client';

export default function AfricanDraft() {
  const [activeMode, setActiveMode] = useState<GameMode>('p2p');
  const [isPlaying, setIsPlaying] = useState(false);
  const [stakeAmount, setStakeAmount] = useState(1000);
  const [difficulty, setDifficulty] = useState<'Novice' | 'Skilled' | 'Expert' | 'Master'>('Skilled');
  const [culturalMode, setCulturalMode] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Map difficulty levels
  const difficultyMap = {
    'Novice': 'beginner' as const,
    'Skilled': 'intermediate' as const,
    'Expert': 'advanced' as const,
    'Master': 'master' as const
  };

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  const { 
    boardState, 
    handleMove, 
    resetGame, 
    isProcessing, 
    createGameSession,
    sessionId,
    betting 
  } = useAfricanDraftGame({
    gameId: currentSessionId || undefined,
    userId: userId || undefined,
    mode: activeMode,
    stakeAmount: stakeAmount,
    aiDifficulty: difficultyMap[difficulty],
    culturalMode: culturalMode
  });

  // Update local session ID when hook's sessionId changes
  useEffect(() => {
    if (sessionId) {
      setCurrentSessionId(sessionId);
    }
  }, [sessionId]);

  const startGame = async () => {
    const newSessionId = await createGameSession();
    if (newSessionId) {
      setIsPlaying(true);
      toast({
        title: 'Game Started!',
        description: `African Draft ${activeMode} game started with ₦${stakeAmount} stake`,
      });
    }
  };

  const handleReset = () => {
    resetGame();
    setIsPlaying(false);
    setCurrentSessionId(null);
    toast({
      title: 'Game Reset',
      description: 'Starting new game',
    });
  };

  const handleBetPlace = async (betType: string, betValue: string) => {
    if (!currentSessionId) {
      toast({
        title: 'No Active Game',
        description: 'Start a game first to place bets',
        variant: 'destructive'
      });
      return;
    }

    await betting.placeBet(currentSessionId, betType, betValue);
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

            {/* Universal Game Interface */}
            <UniversalGameInterface
              gameType="african_draft"
              gameState={boardState}
              gameMode={{
                mode: activeMode,
                bettingEnabled: true,
                stakeAmount,
                aiDifficulty: difficulty,
              }}
              onModeChange={(mode) => setActiveMode(mode)}
              bettingState={betting}
              onBetPlace={handleBetPlace}
              culturalMode={activeMode === 'cultural'}
              onCulturalToggle={() => setActiveMode('p2p')}
              freePlay={false}
              onDifficultyChange={(diff) => setDifficulty(diff)}
            >
              {/* Game Setup and Board Area */}
              {!isPlaying ? (
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Game Setup</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Stake Amount (₦)</Label>
                      <Input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(Number(e.target.value))}
                        min={500}
                        max={100000}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      size="lg"
                      onClick={startGame}
                    >
                      Start {activeMode === 'p2p' ? 'P2P Match' : activeMode === 'human-ai' ? 'Beat AI' : activeMode === 'ai-ai' ? 'AI Tournament' : 'Traditional'} Game
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {activeMode === 'p2p' && 'P2P Match'}
                        {activeMode === 'human-ai' && `vs AI (${difficulty})`}
                        {activeMode === 'ai-ai' && 'AI vs AI Match'}
                        {activeMode === 'cultural' && 'Traditional Mode'}
                      </h3>
                      <p className="text-sm text-muted-foreground">Stake: ₦{stakeAmount}</p>
                      {betting.activeBets.length > 0 && (
                        <p className="text-sm text-primary">Active Bets: {betting.activeBets.length}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      New Game
                    </Button>
                  </div>
                  <AfricanDraftBoard
                    boardState={boardState}
                    onMove={handleMove}
                    disabled={isProcessing || (activeMode === 'human-ai' && boardState.currentPlayer === 'black') || activeMode === 'ai-ai'}
                  />
                  
                  {/* Active Bets Display */}
                  {betting.activeBets.length > 0 && (
                    <div className="mt-4 p-4 bg-secondary/10 rounded-lg">
                      <h4 className="font-semibold mb-2">Active Bets</h4>
                      <div className="space-y-2">
                        {betting.activeBets.map((bet) => (
                          <div key={bet.id} className="flex justify-between text-sm">
                            <span>{bet.bet_type}: {bet.bet_value}</span>
                            <span className="font-semibold">₦{bet.potential_win.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </UniversalGameInterface>

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
                  <p className="font-medium text-foreground mb-2">Betting Modes:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>P2P:</strong> Bet against other players in real-time matches</li>
                    <li><strong>Beat AI:</strong> Challenge AI with difficulty-based multipliers</li>
                    <li><strong>AI Tournament:</strong> Bet on AI performance and matchups</li>
                    <li><strong>Traditional:</strong> Experience authentic cultural gameplay</li>
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
