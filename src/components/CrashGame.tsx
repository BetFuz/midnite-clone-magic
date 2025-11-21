import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Rocket, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

const CrashGame = () => {
  const [multiplier, setMultiplier] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [betAmount, setBetAmount] = useState(1000);
  const [isCrashed, setIsCrashed] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [winAmount, setWinAmount] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setMultiplier((prev) => {
        const increase = 0.01 + Math.random() * 0.05;
        const newValue = prev + increase;
        
        // TODO: DEV – wire to backend when ready
        const crashChance = Math.random();
        if (crashChance < 0.02 * (newValue / 2)) {
          setIsCrashed(true);
          setIsPlaying(false);
          if (!cashedOut) {
            toast.error(`Crashed at ${newValue.toFixed(2)}x!`);
          }
          return newValue;
        }
        
        return newValue;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, cashedOut]);

  const handleStart = () => {
    if (betAmount < 100) {
      toast.error("Minimum bet is ₦100");
      return;
    }
    
    // TODO: DEV – wire to backend when ready
    setMultiplier(1.0);
    setIsPlaying(true);
    setIsCrashed(false);
    setCashedOut(false);
    setWinAmount(0);
  };

  const handleCashOut = () => {
    if (!isPlaying || cashedOut) return;
    
    // TODO: DEV – wire to backend when ready
    const winnings = Math.floor(betAmount * multiplier);
    setWinAmount(winnings);
    setCashedOut(true);
    setIsPlaying(false);
    toast.success(`Cashed out at ${multiplier.toFixed(2)}x! Won ${formatCurrency(winnings)}`);
  };

  const getMultiplierColor = () => {
    if (isCrashed) return "text-red-500";
    if (cashedOut) return "text-green-500";
    if (multiplier < 2) return "text-blue-500";
    if (multiplier < 5) return "text-purple-500";
    if (multiplier < 10) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500">
        <CardTitle className="flex items-center gap-2 text-white">
          <Rocket className="h-5 w-5" />
          Crash Game
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="relative h-48 bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-purple-500/20" />
          <div className={`text-7xl font-bold ${getMultiplierColor()} transition-all ${isPlaying && !isCrashed ? "animate-pulse" : ""}`}>
            {multiplier.toFixed(2)}x
          </div>
          {isCrashed && (
            <Badge variant="destructive" className="absolute top-4 right-4 text-lg gap-2">
              💥 CRASHED
            </Badge>
          )}
          {cashedOut && (
            <Badge className="absolute top-4 right-4 text-lg bg-green-500 gap-2">
              ✓ CASHED OUT
            </Badge>
          )}
        </div>

        {!isPlaying && !isCrashed && !cashedOut && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Bet Amount</label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                min={100}
                step={100}
                className="text-lg"
              />
            </div>
            <Button onClick={handleStart} className="w-full h-12 text-lg gap-2">
              <TrendingUp className="h-5 w-5" />
              Start ({formatCurrency(betAmount)})
            </Button>
          </div>
        )}

        {isPlaying && !cashedOut && (
          <Button onClick={handleCashOut} size="lg" className="w-full h-16 text-xl bg-green-500 hover:bg-green-600 gap-2">
            <DollarSign className="h-6 w-6" />
            Cash Out: {formatCurrency(Math.floor(betAmount * multiplier))}
          </Button>
        )}

        {(isCrashed || cashedOut) && (
          <div className="space-y-3">
            {cashedOut && winAmount > 0 && (
              <div className="p-4 bg-green-500/20 border-2 border-green-500 rounded-lg text-center">
                <p className="text-sm font-semibold mb-1">🎉 Win!</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(winAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Profit: {formatCurrency(winAmount - betAmount)}
                </p>
              </div>
            )}
            {isCrashed && !cashedOut && (
              <div className="p-4 bg-red-500/20 border-2 border-red-500 rounded-lg text-center">
                <p className="text-sm font-semibold mb-1">💥 Crashed at {multiplier.toFixed(2)}x</p>
                <p className="text-lg font-bold text-red-500">Loss: {formatCurrency(betAmount)}</p>
              </div>
            )}
            <Button onClick={handleStart} variant="outline" className="w-full gap-2">
              <TrendingUp className="h-4 w-4" />
              Play Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CrashGame;
