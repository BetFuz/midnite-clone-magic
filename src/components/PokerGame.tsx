import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card as UICard } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePoker, Card } from '@/hooks/usePoker';
import { Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const PokerGame = () => {
  const {
    players,
    communityCards,
    pot,
    currentPlayerIndex,
    phase,
    minBet,
    isLoading,
    handAnalysis,
    startGame,
    call,
    raise,
    fold,
    nextPhase,
    getAIAdvice,
    evaluateHand,
  } = usePoker();

  const [raiseAmount, setRaiseAmount] = useState(minBet);
  const humanPlayer = players.find(p => p.id === 'human');
  const isPlayerTurn = currentPlayerIndex === 0;

  const renderCard = (card: Card, hidden = false) => {
    const suitColor = card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-foreground';
    
    return (
      <div className={cn(
        "w-16 h-24 rounded-lg border-2 flex flex-col items-center justify-center text-lg font-bold transition-all",
        hidden ? "bg-primary/20 border-primary/30" : "bg-card border-border shadow-lg"
      )}>
        {!hidden ? (
          <>
            <span className={suitColor}>{card.rank}</span>
            <span className={cn("text-2xl", suitColor)}>{card.suit}</span>
          </>
        ) : (
          <span className="text-muted-foreground">?</span>
        )}
      </div>
    );
  };

  const renderPlayer = (player: typeof players[0], index: number) => {
    const isCurrent = index === currentPlayerIndex;
    const handEval = player.id === 'human' && communityCards.length > 0 
      ? evaluateHand(player.holeCards, communityCards) 
      : null;

    return (
      <div className={cn(
        "p-4 rounded-lg border-2 transition-all",
        isCurrent ? "border-primary bg-primary/10" : "border-border bg-card",
        player.folded && "opacity-50"
      )}>
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="font-semibold">{player.name}</p>
            <p className="text-sm text-muted-foreground">₦{player.chips.toLocaleString()}</p>
          </div>
          {player.currentBet > 0 && (
            <Badge variant="secondary">Bet: ₦{player.currentBet}</Badge>
          )}
        </div>
        
        <div className="flex gap-1 mb-2">
          {player.holeCards.map((card, idx) => (
            <div key={idx}>{renderCard(card, player.isAI && phase !== 'showdown')}</div>
          ))}
        </div>

        {handEval && (
          <Badge variant="outline" className="text-xs">
            {handEval.rank}
          </Badge>
        )}
        
        {player.folded && <Badge variant="destructive">Folded</Badge>}
      </div>
    );
  };

  if (phase === 'waiting') {
    return (
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <UICard className="p-8 bg-gradient-to-br from-background to-accent/10">
          <h2 className="text-3xl font-bold mb-4">AI Texas Hold'em Poker</h2>
          <p className="text-muted-foreground mb-6">
            Play against intelligent AI opponents with unique personalities and strategies
          </p>
          <Button onClick={startGame} disabled={isLoading} size="lg" className="px-12">
            {isLoading ? 'Setting up table...' : 'Start Game'}
          </Button>
        </UICard>
      </div>
    );
  }

  const maxBet = Math.max(...players.map(p => p.currentBet));
  const callAmount = humanPlayer ? maxBet - humanPlayer.currentBet : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <UICard className="p-6 bg-gradient-to-br from-background to-accent/10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold">Texas Hold'em</h3>
            <Badge variant="outline" className="mt-1">{phase}</Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Pot</p>
            <p className="text-3xl font-bold text-primary">₦{pot.toLocaleString()}</p>
          </div>
        </div>

        {/* Community Cards */}
        <div className="bg-muted/30 rounded-lg p-6 mb-6">
          <p className="text-center text-sm text-muted-foreground mb-3">Community Cards</p>
          <div className="flex justify-center gap-2">
            {communityCards.length === 0 ? (
              <p className="text-muted-foreground">Waiting for flop...</p>
            ) : (
              communityCards.map((card, idx) => (
                <div key={idx}>{renderCard(card)}</div>
              ))
            )}
          </div>
        </div>

        {/* Players */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {players.map((player, idx) => (
            <div key={player.id}>{renderPlayer(player, idx)}</div>
          ))}
        </div>

        {/* Player Actions */}
        {humanPlayer && !humanPlayer.folded && isPlayerTurn && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={fold} variant="destructive" className="flex-1">
                Fold
              </Button>
              <Button onClick={call} variant="outline" className="flex-1" disabled={callAmount === 0}>
                {callAmount === 0 ? 'Check' : `Call ₦${callAmount}`}
              </Button>
              <Button onClick={() => raise(raiseAmount)} className="flex-1" disabled={humanPlayer.chips < raiseAmount}>
                Raise ₦{raiseAmount}
              </Button>
            </div>
            
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                value={raiseAmount}
                onChange={(e) => setRaiseAmount(Math.max(minBet, parseInt(e.target.value) || minBet))}
                min={minBet}
                step={minBet}
                className="w-32"
              />
              <Button onClick={getAIAdvice} variant="outline" disabled={isLoading}>
                <Sparkles className="mr-2 h-4 w-4" />
                Get AI Advice
              </Button>
            </div>
          </div>
        )}

        {/* Phase Control */}
        {phase !== 'showdown' && (
          <Button onClick={nextPhase} className="w-full mt-4" variant="secondary">
            Next Phase
          </Button>
        )}

        {/* AI Analysis */}
        {handAnalysis && (
          <UICard className="p-4 mt-4 bg-muted/30">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold mb-1">AI Strategic Advice</p>
                <p className="text-sm text-muted-foreground">{handAnalysis}</p>
              </div>
            </div>
          </UICard>
        )}
      </UICard>
    </div>
  );
};

export default PokerGame;
