import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useState } from "react";

interface BetCalculatorProps {
  boostPercentage?: number;
  minOdds?: number;
}

export const BetCalculator = ({ boostPercentage = 10, minOdds = 2.0 }: BetCalculatorProps) => {
  const [stake, setStake] = useState("10000");
  const [odds, setOdds] = useState("3.5");

  const stakeNum = parseFloat(stake) || 0;
  const oddsNum = parseFloat(odds) || 0;
  const normalWin = stakeNum * oddsNum;
  const boostedWin = normalWin * (1 + boostPercentage / 100);
  const extraWin = boostedWin - normalWin;

  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Calculator className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Calculate Your Winnings</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="stake">Stake Amount</Label>
          <Input
            id="stake"
            type="number"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            className="mt-2"
            placeholder="10000"
          />
        </div>
        <div>
          <Label htmlFor="odds">Total Odds</Label>
          <Input
            id="odds"
            type="number"
            value={odds}
            onChange={(e) => setOdds(e.target.value)}
            className="mt-2"
            placeholder="3.5"
            step="0.1"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
          <span className="text-muted-foreground">Normal Win</span>
          <span className="font-bold text-foreground">{formatCurrency(normalWin)}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-success/10 rounded-lg border-2 border-success/20">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            <span className="font-semibold text-success">Boosted Win (+{boostPercentage}%)</span>
          </div>
          <span className="text-2xl font-bold text-success">{formatCurrency(boostedWin)}</span>
        </div>

        <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
          <span className="text-primary font-semibold">Extra Winnings</span>
          <span className="font-bold text-primary">{formatCurrency(extraWin)}</span>
        </div>
      </div>

      {oddsNum < minOdds && oddsNum > 0 && (
        <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-sm text-destructive">
            ⚠️ Minimum odds of {minOdds} required for boost
          </p>
        </div>
      )}
    </Card>
  );
};
