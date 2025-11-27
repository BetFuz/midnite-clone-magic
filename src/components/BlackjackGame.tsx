import { useBlackjack, Card } from "@/hooks/useBlackjack";
import { Button } from "@/components/ui/button";
import { Card as UICard } from "@/components/ui/card";
import { Sparkles, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const CardDisplay = ({ card }: { card: Card }) => (
  <div className={cn(
    "w-16 h-24 rounded-lg border-2 flex items-center justify-center text-2xl font-bold shadow-lg",
    card.suit === '♥' || card.suit === '♦' ? 'text-red-500 border-red-500 bg-card' : 'text-foreground border-foreground bg-card'
  )}>
    <div className="text-center">
      <div>{card.value}</div>
      <div>{card.suit}</div>
    </div>
  </div>
);

const BlackjackGame = () => {
  const {
    balance,
    bet,
    playerHand,
    dealerHand,
    gameState,
    result,
    dealerPersonality,
    strategyAdvice,
    isLoadingAdvice,
    placeBet,
    hit,
    stand,
    doubleDown,
    newGame,
    calculateHandValue,
    getStrategyAdvice
  } = useBlackjack();

  const playerTotal = calculateHandValue(playerHand);
  const dealerTotal = calculateHandValue(dealerHand);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              AI Blackjack
            </h1>
            {dealerPersonality && (
              <p className="text-sm text-muted-foreground mt-1">
                Dealer: {dealerPersonality.name} - {dealerPersonality.style}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Balance</div>
            <div className="text-2xl font-bold text-primary">₦{balance.toLocaleString()}</div>
            {bet > 0 && (
              <div className="text-sm text-muted-foreground mt-1">Bet: ₦{bet.toLocaleString()}</div>
            )}
          </div>
        </div>

        {/* Game Table */}
        <UICard className="p-8 bg-gradient-to-br from-emerald-950/50 to-background border-2 border-primary/20">
          {/* Dealer Hand */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Dealer's Hand {gameState !== 'betting' && gameState !== 'playing' && `(${dealerTotal})`}
            </h2>
            <div className="flex gap-3 flex-wrap">
              {dealerHand.map((card, index) => (
                <div key={index}>
                  {gameState === 'playing' && index === 1 ? (
                    <div className="w-16 h-24 rounded-lg border-2 border-primary bg-primary/20 flex items-center justify-center">
                      <div className="text-4xl">🂠</div>
                    </div>
                  ) : (
                    <CardDisplay card={card} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Player Hand */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Your Hand {playerHand.length > 0 && `(${playerTotal})`}
            </h2>
            <div className="flex gap-3 flex-wrap mb-4">
              {playerHand.map((card, index) => (
                <CardDisplay key={index} card={card} />
              ))}
            </div>

            {/* Strategy Advice */}
            {strategyAdvice && (
              <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground mb-1">AI Strategy Advisor</div>
                    <div className="text-sm text-muted-foreground">{strategyAdvice}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className={cn(
              "text-center py-6 mt-6 rounded-lg text-2xl font-bold",
              result.includes('win') || result.includes('Blackjack') ? 'bg-green-500/20 text-green-400' : 
              result.includes('Push') ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
            )}>
              {result}
            </div>
          )}
        </UICard>

        {/* Controls */}
        <div className="space-y-4">
          {gameState === 'betting' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Place Your Bet</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[100, 500, 1000, 5000, 10000].map(amount => (
                  <Button
                    key={amount}
                    onClick={() => placeBet(amount)}
                    disabled={amount > balance}
                    size="lg"
                    variant="outline"
                    className="text-lg font-bold"
                  >
                    ₦{amount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="flex gap-3 flex-wrap justify-center">
              <Button onClick={hit} size="lg" className="px-8">
                Hit
              </Button>
              <Button onClick={stand} size="lg" variant="outline" className="px-8">
                Stand
              </Button>
              {playerHand.length === 2 && (
                <Button 
                  onClick={doubleDown} 
                  size="lg" 
                  variant="secondary"
                  disabled={bet > balance}
                  className="px-8"
                >
                  Double Down
                </Button>
              )}
              <Button 
                onClick={getStrategyAdvice} 
                size="lg" 
                variant="ghost"
                disabled={isLoadingAdvice}
                className="px-8"
              >
                <Lightbulb className="mr-2 h-5 w-5" />
                {isLoadingAdvice ? 'Thinking...' : 'Ask AI'}
              </Button>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="flex justify-center">
              <Button onClick={newGame} size="lg" className="px-12">
                New Game
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlackjackGame;
