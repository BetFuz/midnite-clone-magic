import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGameShow } from '@/hooks/useGameShow';
import { Sparkles, Trophy, DollarSign, RotateCcw, Mic } from 'lucide-react';

export const GameShowGame = () => {
  const {
    balance,
    currentStake,
    setCurrentStake,
    isSpinning,
    selectedPrize,
    showHost,
    commentary,
    jackpotAmount,
    totalSpins,
    totalWinnings,
    prizes,
    spinWheel,
    resetGame,
    generateShowHost
  } = useGameShow();

  useEffect(() => {
    generateShowHost();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Show Host Section */}
      {showHost && (
        <Card className="p-6 bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30 animate-scale-in hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/30 rounded-full flex items-center justify-center">
              <Mic className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">{showHost.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{showHost.personality}</p>
              <p className="text-lg italic">"{commentary}"</p>
            </div>
          </div>
        </Card>
      )}

      {/* Jackpot Display */}
      <Card className="p-6 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50 animate-pulse-glow hover:shadow-2xl shadow-amber-500/30 transition-all duration-500">
        <div className="text-center">
          <Trophy className="w-12 h-12 mx-auto mb-2 text-amber-500 animate-bounce" />
          <h3 className="text-2xl font-bold mb-1 drop-shadow-lg">MEGA JACKPOT</h3>
          <p className="text-4xl font-bold text-amber-500 animate-pulse drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">₦{jackpotAmount.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-2">1% of every spin contributes to the jackpot!</p>
        </div>
      </Card>

      {/* Prize Wheel */}
      <Card className="p-8 bg-gradient-to-br from-background to-secondary/10 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500">
        <div className="relative">
          <div className={`w-full aspect-square max-w-md mx-auto rounded-full border-8 border-primary relative overflow-hidden shadow-2xl transition-all duration-300 ${isSpinning ? 'animate-spin-slow shadow-primary/70' : ''}`}
               style={{ animationDuration: isSpinning ? '0.5s' : '0s' }}>
            {prizes.map((prize, index) => {
              const angle = (360 / prizes.length) * index;
              const isSelected = selectedPrize?.id === prize.id && !isSpinning;
              
              return (
                <div
                  key={prize.id}
                  className={`absolute inset-0 flex items-center justify-center transition-all ${
                    isSelected ? 'scale-110 z-10' : ''
                  }`}
                  style={{
                    transform: `rotate(${angle}deg)`,
                    clipPath: `polygon(50% 50%, 100% 0%, 100% ${100 / prizes.length}%)`
                  }}
                >
                  <div className={`text-center p-4 ${
                    prize.isJackpot ? 'bg-amber-500/80' : index % 2 === 0 ? 'bg-primary/30' : 'bg-secondary/30'
                  }`}>
                    <p className="text-xs font-bold rotate-45">{prize.name}</p>
                    {prize.multiplier > 0 && (
                      <p className="text-sm rotate-45">{prize.multiplier}x</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-primary"></div>
          </div>

          {/* Result Display */}
          {selectedPrize && !isSpinning && (
            <div className="absolute inset-0 flex items-center justify-center z-30 animate-bounce-in">
              <Card className="p-6 bg-background/95 backdrop-blur border-primary shadow-2xl shadow-primary/50">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-2 text-primary animate-pulse" />
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{selectedPrize.name}</h3>
                  {selectedPrize.multiplier > 0 && (
                    <p className="text-3xl font-bold text-primary animate-pulse drop-shadow-[0_0_15px_rgba(139,92,246,0.8)]">
                      ₦{(currentStake * selectedPrize.multiplier).toLocaleString()}
                    </p>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>

      {/* Controls */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Stake Amount</label>
            <Input
              type="number"
              value={currentStake}
              onChange={(e) => setCurrentStake(Number(e.target.value))}
              min={10}
              max={balance}
              step={10}
              disabled={isSpinning}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentStake(100)}
              variant="outline"
              disabled={isSpinning}
              className="flex-1"
            >
              ₦100
            </Button>
            <Button
              onClick={() => setCurrentStake(500)}
              variant="outline"
              disabled={isSpinning}
              className="flex-1"
            >
              ₦500
            </Button>
            <Button
              onClick={() => setCurrentStake(1000)}
              variant="outline"
              disabled={isSpinning}
              className="flex-1"
            >
              ₦1,000
            </Button>
          </div>

          <Button
            onClick={spinWheel}
            disabled={isSpinning || currentStake > balance}
            className="w-full h-16 text-xl"
            size="lg"
          >
            {isSpinning ? (
              <>
                <Sparkles className="w-6 h-6 mr-2 animate-spin" />
                Spinning...
              </>
            ) : (
              <>
                <DollarSign className="w-6 h-6 mr-2" />
                SPIN THE WHEEL
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Balance</p>
            <p className="text-2xl font-bold">₦{balance.toLocaleString()}</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Spins</p>
            <p className="text-2xl font-bold">{totalSpins}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Winnings</p>
            <p className="text-2xl font-bold text-primary">₦{totalWinnings.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-4">
          <Button
            onClick={resetGame}
            variant="outline"
            className="w-full h-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Game
          </Button>
        </Card>
      </div>
    </div>
  );
};
