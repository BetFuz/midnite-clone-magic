import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles, RefreshCw } from "lucide-react";
import { useSlotMachine } from "@/hooks/useSlotMachine";

export const SlotMachine = () => {
  const {
    theme,
    reels,
    isSpinning,
    balance,
    betAmount,
    totalWin,
    winningLines,
    isLoadingTheme,
    spin,
    setBetAmount,
    generateAITheme,
  } = useSlotMachine();

  return (
    <Card className={`w-full max-w-4xl mx-auto bg-gradient-to-br ${theme.backgroundColor} p-8 shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 animate-fade-in`}>
      {/* Header */}
      <div className="text-center mb-6 animate-scale-in">
        <h2 className={`text-4xl font-bold ${theme.accentColor} mb-2 drop-shadow-lg`}>{theme.name}</h2>
        <div className="flex justify-center gap-4 text-white">
          <Badge variant="secondary" className="text-lg px-4 py-2 hover:scale-105 transition-transform">
            Balance: ₦{balance.toFixed(2)}
          </Badge>
          {totalWin > 0 && (
            <Badge variant="default" className="text-lg px-4 py-2 bg-green-600 animate-bounce-in shadow-lg shadow-green-500/50">
              WIN: ₦{totalWin.toFixed(2)}
            </Badge>
          )}
        </div>
      </div>

      {/* Slot Reels */}
      <div className="mb-8 bg-black/40 rounded-xl p-6 backdrop-blur-sm border border-white/10 shadow-inner">
        <div className="grid grid-cols-3 gap-4">
          {reels.map((reel, reelIndex) => (
            <div key={reelIndex} className="flex flex-col gap-2">
              {reel.map((symbol, symbolIndex) => {
                const lineNumber = symbolIndex;
                const isWinning = winningLines.includes(lineNumber) || 
                                 (lineNumber === 1 && (winningLines.includes(3) || winningLines.includes(4)));
                
                return (
                  <div
                    key={symbolIndex}
                    className={`
                      bg-white rounded-lg p-6 text-6xl flex items-center justify-center
                      transition-all duration-300 transform shadow-lg
                      ${isSpinning ? 'animate-spin-slow scale-95 opacity-80' : 'scale-100 hover:scale-105'}
                      ${isWinning ? 'ring-4 ring-yellow-400 shadow-2xl shadow-yellow-400/70 animate-pulse-glow' : ''}
                    `}
                  >
                    <span className={isWinning ? 'drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]' : ''}>
                      {symbol}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Winning Lines Indicator */}
        {winningLines.length > 0 && !isSpinning && (
          <div className="mt-4 text-center animate-bounce-in">
            <p className="text-yellow-400 font-bold text-2xl drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
              🎊 {winningLines.length} Winning Line{winningLines.length > 1 ? 's' : ''} 🎊
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-6">
        {/* Bet Amount Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-white">
            <label className="font-semibold">Bet Amount:</label>
            <span className={theme.accentColor}>₦{betAmount}</span>
          </div>
          <Slider
            value={[betAmount]}
            onValueChange={(value) => setBetAmount(value[0])}
            min={5}
            max={100}
            step={5}
            disabled={isSpinning}
            className="w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={spin}
            disabled={isSpinning || balance < betAmount}
            size="lg"
            className="w-full text-xl font-bold bg-green-600 hover:bg-green-700 hover:shadow-2xl hover:shadow-green-500/50 h-16 transition-all duration-300 hover:scale-105"
          >
            {isSpinning ? (
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            ) : (
              <Play className="h-6 w-6 mr-2" fill="currentColor" />
            )}
            {isSpinning ? 'Spinning...' : 'SPIN'}
          </Button>

          <Button
            onClick={() => generateAITheme()}
            disabled={isLoadingTheme || isSpinning}
            size="lg"
            variant="secondary"
            className="w-full text-xl font-bold h-16 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="h-6 w-6 mr-2 animate-pulse" />
            {isLoadingTheme ? 'Generating...' : 'AI Theme'}
          </Button>
        </div>
      </div>

      {/* Paytable */}
      <div className="mt-8 bg-black/20 rounded-lg p-4 backdrop-blur-sm">
        <h3 className="text-white font-bold text-center mb-3">💰 PAYTABLE 💰</h3>
        <div className="grid grid-cols-4 gap-2">
          {theme.symbols.map((symbol) => (
            <div key={symbol.id} className="text-center bg-white/10 rounded p-2">
              <div className="text-3xl mb-1">{symbol.emoji}</div>
              <div className="text-xs text-white/70">{symbol.name}</div>
              <div className="text-sm text-yellow-400 font-bold">{symbol.multiplier}x</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bonus Features */}
      <div className="mt-4 text-center">
        <p className="text-white/70 text-sm">Bonus Features: {theme.bonusFeatures.join(' • ')}</p>
      </div>
    </Card>
  );
};