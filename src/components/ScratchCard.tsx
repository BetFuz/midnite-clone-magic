import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

interface ScratchCardProps {
  name: string;
  cost: number;
  maxWin: number;
}

const ScratchCard = ({ name, cost, maxWin }: ScratchCardProps) => {
  const [isScratched, setIsScratched] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [winAmount, setWinAmount] = useState<number | null>(null);

  const handleScratch = (index: number) => {
    if (revealed.includes(index)) return;
    
    const newRevealed = [...revealed, index];
    setRevealed(newRevealed);

    if (newRevealed.length === 9) {
      // TODO: DEV – wire to backend when ready
      const won = Math.random() > 0.7;
      const amount = won ? Math.floor(Math.random() * maxWin) + cost : 0;
      setWinAmount(amount);
      setIsScratched(true);
      
      if (amount > 0) {
        toast.success(`You won ${formatCurrency(amount)}! 🎉`);
      } else {
        toast.info("Better luck next time!");
      }
    }
  };

  const handleReset = () => {
    // TODO: DEV – wire to backend when ready
    setIsScratched(false);
    setRevealed([]);
    setWinAmount(null);
  };

  const symbols = ["🎰", "💎", "⭐", "🍀", "🎲", "💰", "🏆", "🎯", "👑"];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {name}
          </div>
          <Badge variant="secondary">{formatCurrency(cost)}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[...Array(9)].map((_, i) => (
            <button
              key={i}
              onClick={() => handleScratch(i)}
              disabled={revealed.includes(i)}
              className={`aspect-square rounded-lg text-3xl flex items-center justify-center transition-all ${
                revealed.includes(i)
                  ? "bg-gradient-to-br from-yellow-400 to-orange-400 scale-105"
                  : "bg-gradient-to-br from-slate-700 to-slate-800 hover:scale-105 cursor-pointer"
              }`}
            >
              {revealed.includes(i) ? symbols[i] : "?"}
            </button>
          ))}
        </div>

        {isScratched && (
          <div className="space-y-3">
            <div className={`p-4 rounded-lg text-center ${winAmount && winAmount > 0 ? "bg-green-500/20 border-2 border-green-500" : "bg-red-500/20 border-2 border-red-500"}`}>
              <p className="text-sm font-semibold mb-1">
                {winAmount && winAmount > 0 ? "🎉 Winner!" : "Try Again"}
              </p>
              {winAmount && winAmount > 0 && (
                <p className="text-2xl font-bold">{formatCurrency(winAmount)}</p>
              )}
            </div>
            <Button onClick={handleReset} variant="outline" className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Play Again ({formatCurrency(cost)})
            </Button>
          </div>
        )}

        {!isScratched && (
          <div className="text-center text-sm text-muted-foreground">
            <p>Scratch all 9 panels to reveal your prize!</p>
            <p className="mt-1 font-semibold">Max Win: {formatCurrency(maxWin)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScratchCard;
