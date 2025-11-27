import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRoulette, BetType } from '@/hooks/useRoulette';
import { Sparkles, TrendingUp, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const RouletteGame = () => {
  const {
    bets,
    spinHistory,
    isSpinning,
    currentResult,
    balance,
    aiAnalysis,
    isLoadingAI,
    placeBet,
    clearBets,
    spin,
    getAIAnalysis,
    getAIStrategy,
  } = useRoulette();

  const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0);

  const renderWheel = () => {
    const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    
    return (
      <div className="relative w-80 h-80 mx-auto mb-8">
        <div className={cn(
          "w-full h-full rounded-full border-8 border-primary relative overflow-hidden transition-transform duration-3000",
          isSpinning && "animate-spin"
        )}>
          <div className="absolute inset-0 bg-gradient-conic from-primary via-accent to-primary">
            {numbers.map((num, idx) => {
              const angle = (idx / numbers.length) * 360;
              const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(num);
              
              return (
                <div
                  key={num}
                  className="absolute top-1/2 left-1/2 origin-center"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-140px)`,
                  }}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    num === 0 ? "bg-green-500 text-white" : isRed ? "bg-red-500 text-white" : "bg-black text-white"
                  )}>
                    {num}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {currentResult && !isSpinning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-background shadow-2xl",
              currentResult.color === 'green' ? "bg-green-500 text-white" :
              currentResult.color === 'red' ? "bg-red-500 text-white" : "bg-black text-white"
            )}>
              {currentResult.number}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBettingGrid = () => {
    const chipAmounts = [100, 500, 1000, 5000];
    const [selectedChip, setSelectedChip] = React.useState(100);

    return (
      <div className="space-y-4">
        <div className="flex gap-2 justify-center mb-4">
          {chipAmounts.map(amount => (
            <Button
              key={amount}
              variant={selectedChip === amount ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedChip(amount)}
            >
              ₦{amount}
            </Button>
          ))}
        </div>

        <Tabs defaultValue="outside" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="outside">Outside Bets</TabsTrigger>
            <TabsTrigger value="inside">Inside Bets</TabsTrigger>
          </TabsList>

          <TabsContent value="outside" className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => placeBet('red', selectedChip)} className="bg-red-500/20 hover:bg-red-500/30">
                Red (1:1)
              </Button>
              <Button variant="outline" onClick={() => placeBet('black', selectedChip)} className="bg-gray-900/50 hover:bg-gray-900/70">
                Black (1:1)
              </Button>
              <Button variant="outline" onClick={() => placeBet('even', selectedChip)}>
                Even (1:1)
              </Button>
              <Button variant="outline" onClick={() => placeBet('odd', selectedChip)}>
                Odd (1:1)
              </Button>
              <Button variant="outline" onClick={() => placeBet('low', selectedChip)}>
                1-18 (1:1)
              </Button>
              <Button variant="outline" onClick={() => placeBet('high', selectedChip)}>
                19-36 (1:1)
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => placeBet('dozen1', selectedChip)}>
                1st 12 (2:1)
              </Button>
              <Button variant="outline" onClick={() => placeBet('dozen2', selectedChip)}>
                2nd 12 (2:1)
              </Button>
              <Button variant="outline" onClick={() => placeBet('dozen3', selectedChip)}>
                3rd 12 (2:1)
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="inside" className="space-y-2">
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 36 }, (_, i) => i + 1).map(num => {
                const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(num);
                return (
                  <Button
                    key={num}
                    variant="outline"
                    size="sm"
                    onClick={() => placeBet('straight', selectedChip, num)}
                    className={cn(
                      "text-xs p-1 h-10",
                      isRed ? "bg-red-500/20 hover:bg-red-500/30" : "bg-gray-900/50 hover:bg-gray-900/70"
                    )}
                  >
                    {num}
                  </Button>
                );
              })}
            </div>
            <Button variant="outline" onClick={() => placeBet('straight', selectedChip, 0)} className="w-full bg-green-500/20 hover:bg-green-500/30">
              0 (35:1)
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="p-6 bg-gradient-to-br from-background to-accent/10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold">AI Roulette</h3>
            <p className="text-sm text-muted-foreground">European Roulette with AI Analysis</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold">₦{balance.toLocaleString()}</p>
          </div>
        </div>

        {renderWheel()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-semibold mb-2">Current Bets</h4>
            {bets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bets placed</p>
            ) : (
              <div className="space-y-1">
                {bets.map((bet, idx) => (
                  <div key={idx} className="text-sm flex justify-between bg-muted/30 p-2 rounded">
                    <span>{bet.type}</span>
                    <span className="font-semibold">₦{bet.amount}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>₦{totalBet.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-2">Recent Spins</h4>
            <div className="flex flex-wrap gap-2">
              {spinHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No spins yet</p>
              ) : (
                spinHistory.map((result, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                      result.color === 'green' ? "bg-green-500 text-white" :
                      result.color === 'red' ? "bg-red-500 text-white" : "bg-black text-white"
                    )}
                  >
                    {result.number}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {renderBettingGrid()}

        <div className="flex gap-2 mt-6">
          <Button onClick={spin} disabled={isSpinning || bets.length === 0} className="flex-1" size="lg">
            <RotateCw className="mr-2 h-5 w-5" />
            {isSpinning ? 'Spinning...' : 'Spin'}
          </Button>
          <Button onClick={clearBets} variant="outline" disabled={isSpinning || bets.length === 0}>
            Clear Bets
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <Button onClick={getAIAnalysis} disabled={isLoadingAI || spinHistory.length < 5} className="w-full mb-3">
            <Sparkles className="mr-2 h-4 w-4" />
            Get AI Pattern Analysis
          </Button>
          {aiAnalysis && (
            <div className="text-sm bg-muted/30 p-3 rounded">
              {aiAnalysis}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <Button onClick={getAIStrategy} disabled={isLoadingAI} className="w-full mb-3" variant="outline">
            <TrendingUp className="mr-2 h-4 w-4" />
            Get AI Betting Strategy
          </Button>
          <p className="text-xs text-muted-foreground">
            AI-powered analysis for entertainment purposes only. Remember that each spin is independent and random.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RouletteGame;
