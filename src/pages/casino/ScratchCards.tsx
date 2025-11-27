import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScratchCard } from '@/components/ScratchCard';
import { useScratchCard } from '@/hooks/useScratchCard';
import { Sparkles, ShoppingCart } from 'lucide-react';
import { useEffect } from 'react';

const ScratchCards = () => {
  const {
    balance,
    availableCards,
    activeCard,
    isRevealed,
    isLoadingThemes,
    generateAIThemes,
    purchaseCard,
    revealCard,
    resetCard
  } = useScratchCard();

  useEffect(() => {
    generateAIThemes();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Scratch Cards
              </h1>
              <p className="text-muted-foreground">Instant win prizes - Scratch to reveal!</p>
            </div>

            {/* Balance */}
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-3xl font-bold text-primary">₦{balance.toLocaleString()}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={generateAIThemes}
                    disabled={isLoadingThemes}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isLoadingThemes ? 'Loading...' : 'Load AI Themes'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Card */}
            {activeCard && (
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <ScratchCard
                    symbols={activeCard.symbols}
                    prize={activeCard.prize}
                    isRevealed={isRevealed}
                    onReveal={revealCard}
                    onReset={resetCard}
                    color={activeCard.theme.color}
                  />
                </div>
              </div>
            )}

            {/* Available Cards */}
            {!activeCard && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Available Cards</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {availableCards.map((card) => (
                    <Card key={card.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="text-3xl">{card.icon}</span>
                            <span className="text-lg">{card.name}</span>
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{card.description}</p>
                        
                        <div className={`h-32 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-4xl`}>
                          {card.icon}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Max Prize:</span>
                            <span className="font-semibold text-primary">
                              ₦{Math.max(...card.prizes.map(p => p.amount)).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex gap-1 flex-wrap">
                            {card.prizes
                              .filter(p => p.amount > 0)
                              .sort((a, b) => b.amount - a.amount)
                              .map((prize, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  ₦{prize.amount.toLocaleString()}
                                </Badge>
                              ))}
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          onClick={() => purchaseCard(card)}
                          disabled={balance < card.price}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy ₦{card.price}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Game Info */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>1. Choose a scratch card theme and purchase it</p>
                <p>2. Scratch off the silver coating by dragging your mouse/finger</p>
                <p>3. Match three identical symbols to win the corresponding prize</p>
                <p>4. Use "Quick Reveal" button to instantly see your result</p>
                <p className="text-primary font-semibold">
                  💡 Tip: Higher priced cards have bigger potential prizes!
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default ScratchCards;
