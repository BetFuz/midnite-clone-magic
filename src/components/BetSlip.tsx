import { X, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import CashOutButton from "./CashOutButton";
import FastStakeSelector from "./FastStakeSelector";
import BetShareCard from "./BetShareCard";

interface BetSlipProps {
  className?: string;
  showOnMobile?: boolean;
}

const BetSlip = ({ className, showOnMobile = false }: BetSlipProps) => {
  const {
    selections,
    removeSelection,
    clearSelections,
    totalOdds,
    stake,
    setStake,
    potentialWin,
    placeBet,
    isPlacingBet,
  } = useBetSlip();

  return (
    <aside className={cn(showOnMobile ? "flex" : "hidden md:flex", "w-full md:w-80 border-l border-border bg-card h-full flex-col", className)}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">
          Bet Slip {selections.length > 0 && `(${selections.length})`}
        </h2>
        {selections.length > 0 && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={clearSelections}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {selections.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <p className="text-sm font-medium">Bet Slip is empty</p>
            <p className="text-xs mt-1">Add selections to place bet</p>
            <p className="text-xs mt-2 text-muted-foreground/70">Min stake: {formatCurrency(100)}</p>
          </div>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {selections.map((selection) => (
                <Card key={selection.id} className="p-3 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeSelection(selection.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  <div className="pr-8">
                    <p className="text-xs text-muted-foreground mb-1">
                      {selection.sport} {selection.league && `• ${selection.league}`}
                    </p>
                    <p className="text-sm font-semibold">
                      {selection.homeTeam} vs {selection.awayTeam}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {selection.selectionValue}
                      </span>
                      <span className="text-sm font-bold">{selection.odds}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t border-border p-4 space-y-4">
            <FastStakeSelector
              currentStake={stake}
              onStakeChange={setStake}
              balance={10000}
            />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Odds:</span>
                <span className="font-bold">{totalOdds.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stake:</span>
                <span className="font-semibold">{formatCurrency(stake)}</span>
              </div>
              <div className="flex justify-between text-base border-t border-border pt-2">
                <span className="font-semibold">Potential Win:</span>
                <span className="font-bold text-primary">{formatCurrency(potentialWin)}</span>
              </div>
            </div>

            {selections.length > 0 && (
              <BetShareCard
                totalOdds={totalOdds}
                stake={stake}
                potentialWin={potentialWin}
                selectionCount={selections.length}
              />
            )}

            <div className="space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={placeBet}
                disabled={isPlacingBet || selections.length === 0}
              >
                {isPlacingBet ? "Placing Bet..." : "Place Bet"}
              </Button>

              {/* Cash Out Option (appears if bet is live) */}
              {selections.some(s => s.matchTime?.includes("LIVE")) && (
                <CashOutButton
                  originalStake={stake}
                  currentValue={stake * 1.45}
                  potentialWin={potentialWin}
                />
              )}
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

export default BetSlip;
