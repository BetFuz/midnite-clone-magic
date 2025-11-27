import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Users, Bot, Globe, Zap, Crown, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BetType } from '@/lib/betting/universalBettingEngine';

export interface GameMode {
  mode: 'p2p' | 'human-ai' | 'ai-ai' | 'cultural';
  bettingEnabled: boolean;
  stakeAmount: number;
  aiDifficulty?: 'Novice' | 'Skilled' | 'Expert' | 'Master';
}

export interface BettingState {
  availableBets: BetType[];
  activeBets: any[];
  isPlacingBet: boolean;
}

interface UniversalInterfaceProps {
  gameType: 'mancala' | 'morabaraba' | 'african_draft';
  gameState: any;
  gameMode: GameMode;
  onModeChange: (mode: 'p2p' | 'human-ai' | 'ai-ai' | 'cultural') => void;
  bettingState?: BettingState;
  onBetPlace?: (betType: string, betValue: string) => void;
  culturalMode?: boolean;
  onCulturalToggle?: () => void;
  freePlay?: boolean;
  onDifficultyChange?: (difficulty: 'Novice' | 'Skilled' | 'Expert' | 'Master') => void;
  children?: React.ReactNode;
}

interface ModeButtonProps {
  mode: string;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

const ModeButton: React.FC<ModeButtonProps> = ({
  mode,
  label,
  description,
  active,
  onClick,
  icon,
}) => {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 h-auto',
        active && 'ring-2 ring-primary'
      )}
    >
      <div className="text-2xl">{icon}</div>
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </Button>
  );
};

export const UniversalGameInterface: React.FC<UniversalInterfaceProps> = ({
  gameType,
  gameState,
  gameMode,
  onModeChange,
  bettingState,
  onBetPlace,
  culturalMode = false,
  onCulturalToggle,
  freePlay = false,
  onDifficultyChange,
  children,
}) => {
  const getGameTitle = () => {
    const titles = {
      mancala: 'Mancala',
      morabaraba: 'Morabaraba',
      african_draft: 'African Draft',
    };
    return titles[gameType];
  };

  const getCulturalName = () => {
    const names = {
      mancala: 'Seed Master',
      morabaraba: 'Chief of Cows',
      african_draft: 'Battle Chief',
    };
    return names[gameType];
  };

  return (
    <div className="universal-game-interface space-y-6">
      {/* Mode Selection Header */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-background">
        <h3 className="text-lg font-semibold mb-4 text-center">Select Game Mode</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ModeButton
            mode="p2p"
            label="P2P Betting"
            description="Bet against players"
            active={gameMode.mode === 'p2p'}
            onClick={() => onModeChange('p2p')}
            icon={<Users className="h-6 w-6" />}
          />
          <ModeButton
            mode="human-ai"
            label="Beat AI"
            description="Bet on yourself"
            active={gameMode.mode === 'human-ai'}
            onClick={() => onModeChange('human-ai')}
            icon={<Bot className="h-6 w-6" />}
          />
          <ModeButton
            mode="ai-ai"
            label="AI Tournament"
            description="Bet on AI matchup"
            active={gameMode.mode === 'ai-ai'}
            onClick={() => onModeChange('ai-ai')}
            icon={<Zap className="h-6 w-6" />}
          />
          <ModeButton
            mode="cultural"
            label={getCulturalName()}
            description="Traditional mode"
            active={gameMode.mode === 'cultural'}
            onClick={() => onModeChange('cultural')}
            icon={<Globe className="h-6 w-6" />}
          />
        </div>
      </Card>

      {/* Free Play Banner */}
      {freePlay && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-center gap-2 text-blue-800">
            <Trophy className="h-5 w-5" />
            <span className="font-semibold">Practice Mode - No Betting</span>
          </div>
          <p className="text-sm text-blue-600 text-center mt-2">
            Learn the game and improve your skills
          </p>
        </Card>
      )}

      {/* Cultural Mode Active Banner */}
      {culturalMode && gameMode.mode === 'cultural' && onCulturalToggle && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={onCulturalToggle}
              variant="default"
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Globe className="h-4 w-4 mr-2" />
              Cultural Mode Active
            </Button>
          </div>
          <p className="text-sm text-amber-700 text-center mt-2">
            Experience authentic {getGameTitle()} with traditional celebrations
          </p>
        </Card>
      )}

      {/* Betting Interface */}
      {gameMode.bettingEnabled && bettingState && onBetPlace && !freePlay && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Available Bets
          </h3>

          {/* Active Bets Display */}
          {bettingState.activeBets.length > 0 && (
            <div className="mb-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-2">Your Active Bets:</p>
              {bettingState.activeBets.map((bet: any, idx: number) => (
                <div key={idx} className="text-xs flex justify-between py-1">
                  <span className="text-muted-foreground">{bet.bet_type}: {bet.bet_value}</span>
                  <Badge variant={
                    bet.status === 'won' ? 'default' : 
                    bet.status === 'lost' ? 'destructive' : 
                    'secondary'
                  }>
                    {bet.status === 'active' ? `₦${bet.potential_win.toFixed(2)}` : bet.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Bet Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bettingState.availableBets.map((betType) => (
              <Button
                key={betType.id}
                variant="outline"
                onClick={() => onBetPlace(betType.id, 'player1')}
                disabled={bettingState.isPlacingBet}
                className="justify-between"
              >
                <span className="text-sm">
                  {culturalMode ? betType.culturalName : betType.name}
                </span>
                <Badge variant="secondary">{betType.odds}x</Badge>
              </Button>
            ))}
          </div>

          {/* Stake Display */}
          <div className="mt-4 p-3 bg-primary/5 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Stake Amount:</span>
              <span className="font-bold text-primary">₦{gameMode.stakeAmount.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      )}

      {/* AI Difficulty Control (for human-ai and ai-ai modes) */}
      {(gameMode.mode === 'human-ai' || gameMode.mode === 'ai-ai') && onDifficultyChange && (
        <Card className="p-6">
          <Label className="text-sm font-medium mb-3 block">AI Difficulty Level</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['Novice', 'Skilled', 'Expert', 'Master'] as const).map((level) => (
              <Button
                key={level}
                variant={gameMode.aiDifficulty === level ? 'default' : 'outline'}
                onClick={() => onDifficultyChange(level)}
                size="sm"
              >
                {level}
              </Button>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground text-center">
            Current: {gameMode.aiDifficulty || 'Skilled'} | Multiplier: {
              gameMode.aiDifficulty === 'Novice' ? '1.8x' :
              gameMode.aiDifficulty === 'Skilled' ? '3.5x' :
              gameMode.aiDifficulty === 'Expert' ? '7.0x' : '12.0x'
            }
          </div>
        </Card>
      )}

      {/* Mode-Specific Information */}
      <Card className="p-6 bg-muted/20">
        <h4 className="font-semibold mb-2">
          {gameMode.mode === 'p2p' && '🤝 Player vs Player Mode'}
          {gameMode.mode === 'human-ai' && '🧠 Human vs AI Mode'}
          {gameMode.mode === 'ai-ai' && '🤖 AI Tournament Mode'}
          {gameMode.mode === 'cultural' && `🌍 ${getCulturalName()} Mode`}
        </h4>
        <p className="text-sm text-muted-foreground">
          {gameMode.mode === 'p2p' && 'Compete against other players with real-time betting pools'}
          {gameMode.mode === 'human-ai' && 'Test your skills against AI and bet on your performance'}
          {gameMode.mode === 'ai-ai' && 'Watch AI strategies compete and bet on the outcome'}
          {gameMode.mode === 'cultural' && 'Experience traditional gameplay with cultural celebrations'}
        </p>
      </Card>

      {/* Game Board Area */}
      {children}
    </div>
  );
};
