import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface CashOutButtonProps {
  originalStake: number;
  currentValue: number;
  potentialWin: number;
}

const CashOutButton = ({
  originalStake,
  currentValue,
  potentialWin,
}: CashOutButtonProps) => {
  const [open, setOpen] = useState(false);
  const profit = currentValue - originalStake;
  const profitPercentage = ((profit / originalStake) * 100).toFixed(1);
  const isProfit = profit > 0;

  const handleCashOut = () => {
    toast({
      title: "Cash Out Successful",
      description: `You've cashed out ${formatCurrency(currentValue)}`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full gap-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
        >
          <DollarSign className="h-4 w-4" />
          Cash Out {formatCurrency(currentValue)}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cash Out Your Bet</DialogTitle>
          <DialogDescription>
            Settle your bet now and secure your returns before the match ends
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Value Card */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Cash Out Value</span>
              <Badge
                variant={isProfit ? "default" : "destructive"}
                className="gap-1"
              >
                {isProfit ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {isProfit ? "+" : ""}
                {profitPercentage}%
              </Badge>
            </div>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(currentValue)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isProfit ? "Profit" : "Loss"}: {formatCurrency(Math.abs(profit))}
            </div>
          </div>

          {/* Comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground mb-1">
                Original Stake
              </div>
              <div className="font-bold">{formatCurrency(originalStake)}</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground mb-1">
                Potential Win
              </div>
              <div className="font-bold text-green-600">
                {formatCurrency(potentialWin)}
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
            <p className="text-xs text-yellow-600 dark:text-yellow-500">
              ⚠️ Cash out value may change based on live match events. Once
              confirmed, this action cannot be undone.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Keep Bet Running
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleCashOut}
          >
            Confirm Cash Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CashOutButton;
