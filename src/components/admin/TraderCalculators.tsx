import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TraderCalculators = () => {
  // Dead Heat Calculator
  const [dhStake, setDhStake] = useState<number>(100);
  const [dhOdds, setDhOdds] = useState<number>(3.0);
  const [dhPositions, setDhPositions] = useState<number>(2);
  
  const calculateDeadHeat = () => {
    const reductionFactor = 1 / dhPositions;
    const reducedStake = dhStake * reductionFactor;
    const reducedPayout = reducedStake * dhOdds;
    const originalPayout = dhStake * dhOdds;
    
    return {
      reducedStake: reducedStake.toFixed(2),
      reducedPayout: reducedPayout.toFixed(2),
      originalPayout: originalPayout.toFixed(2),
      reductionFactor: reductionFactor.toFixed(2)
    };
  };

  // Rule 4 Calculator
  const [r4Stake, setR4Stake] = useState<number>(100);
  const [r4Odds, setR4Odds] = useState<number>(4.0);
  const [withdrawnOdds, setWithdrawnOdds] = useState<number>(2.0);
  
  const getRule4Deduction = (odds: number): number => {
    if (odds <= 1.10) return 0.90;
    if (odds <= 1.14) return 0.85;
    if (odds <= 1.22) return 0.80;
    if (odds <= 1.28) return 0.75;
    if (odds <= 1.40) return 0.70;
    if (odds <= 1.57) return 0.65;
    if (odds <= 1.80) return 0.60;
    if (odds <= 2.10) return 0.55;
    if (odds <= 2.50) return 0.50;
    if (odds <= 2.87) return 0.45;
    if (odds <= 3.50) return 0.40;
    if (odds <= 4.33) return 0.35;
    if (odds <= 5.50) return 0.30;
    if (odds <= 7.50) return 0.25;
    if (odds <= 11.00) return 0.20;
    if (odds <= 16.00) return 0.15;
    if (odds <= 26.00) return 0.10;
    if (odds <= 51.00) return 0.05;
    return 0;
  };
  
  const calculateRule4 = () => {
    const deductionPct = getRule4Deduction(withdrawnOdds);
    const adjustedStake = r4Stake * (1 - deductionPct);
    const reducedPayout = adjustedStake * r4Odds;
    const originalPayout = r4Stake * r4Odds;
    
    return {
      deductionPct: (deductionPct * 100).toFixed(0),
      adjustedStake: adjustedStake.toFixed(2),
      reducedPayout: reducedPayout.toFixed(2),
      originalPayout: originalPayout.toFixed(2)
    };
  };

  // VAR Overturn Calculator
  const [varStake, setVarStake] = useState<number>(100);
  const [varOdds, setVarOdds] = useState<number>(2.5);
  const [varOverturned, setVarOverturned] = useState<boolean>(false);
  
  const calculateVAR = () => {
    if (varOverturned) {
      return {
        status: 'VOID',
        refund: varStake.toFixed(2),
        message: 'Bet voided - stake returned'
      };
    }
    
    return {
      status: 'ACTIVE',
      potentialWin: (varStake * varOdds).toFixed(2),
      message: 'Bet remains active'
    };
  };

  const dhResult = calculateDeadHeat();
  const r4Result = calculateRule4();
  const varResult = calculateVAR();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Trader Calculators
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dead-heat">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dead-heat">Dead Heat</TabsTrigger>
            <TabsTrigger value="rule-4">Rule 4</TabsTrigger>
            <TabsTrigger value="var">VAR Overturn</TabsTrigger>
          </TabsList>

          <TabsContent value="dead-heat" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Original Stake (₦)</Label>
                <Input
                  type="number"
                  value={dhStake}
                  onChange={(e) => setDhStake(parseFloat(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Odds</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={dhOdds}
                  onChange={(e) => setDhOdds(parseFloat(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Number of Winners (Dead Heat)</Label>
                <Input
                  type="number"
                  value={dhPositions}
                  onChange={(e) => setDhPositions(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Payout:</span>
                <span className="font-semibold">₦{dhResult.originalPayout}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reduction Factor:</span>
                <span className="font-semibold">{dhResult.reductionFactor}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reduced Stake:</span>
                <span className="font-semibold">₦{dhResult.reducedStake}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Reduced Payout:</span>
                <span className="font-bold text-lg text-primary">₦{dhResult.reducedPayout}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rule-4" className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Rule 4 applies when odds-on selections are withdrawn. Deduction based on withdrawn odds.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Original Stake (₦)</Label>
                <Input
                  type="number"
                  value={r4Stake}
                  onChange={(e) => setR4Stake(parseFloat(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Odds (Your Bet)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={r4Odds}
                  onChange={(e) => setR4Odds(parseFloat(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Withdrawn Selection Odds</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={withdrawnOdds}
                  onChange={(e) => setWithdrawnOdds(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Payout:</span>
                <span className="font-semibold">₦{r4Result.originalPayout}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deduction:</span>
                <span className="font-semibold text-destructive">{r4Result.deductionPct}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Adjusted Stake:</span>
                <span className="font-semibold">₦{r4Result.adjustedStake}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Reduced Payout:</span>
                <span className="font-bold text-lg text-primary">₦{r4Result.reducedPayout}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="var" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Stake (₦)</Label>
                <Input
                  type="number"
                  value={varStake}
                  onChange={(e) => setVarStake(parseFloat(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Odds</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={varOdds}
                  onChange={(e) => setVarOdds(parseFloat(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="var-overturn"
                  checked={varOverturned}
                  onChange={(e) => setVarOverturned(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="var-overturn" className="cursor-pointer">
                  VAR Decision Overturned Goal/Card
                </Label>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-semibold ${varResult.status === 'VOID' ? 'text-amber-500' : 'text-green-500'}`}>
                  {varResult.status}
                </span>
              </div>
              {varResult.status === 'VOID' ? (
                <div className="flex justify-between">
                  <span className="font-medium">Refund:</span>
                  <span className="font-bold text-lg text-primary">₦{varResult.refund}</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="font-medium">Potential Win:</span>
                  <span className="font-bold text-lg text-primary">₦{varResult.potentialWin}</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground text-center pt-2">
                {varResult.message}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
