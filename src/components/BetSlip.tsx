import { useState } from "react";
import { X, Trash2, ChevronDown, ChevronUp, Gift, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BetSlipProps {
  className?: string;
  showOnMobile?: boolean;
}

const QUICK_STAKES = [100, 500, 1000, 2000, 5000];

const getBonusPct = (n: number) => {
  if (n >= 20) return 100;
  if (n >= 15) return 60;
  if (n >= 10) return 35;
  if (n >= 8) return 25;
  if (n >= 6) return 15;
  if (n >= 5) return 10;
  if (n >= 4) return 5;
  return 0;
};

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

  const [stakeInput, setStakeInput] = useState("");
  const [betType, setBetType] = useState<"single" | "combo">("combo");
  const [bonusExpanded, setBonusExpanded] = useState(false);

  const bonusPct = getBonusPct(selections.length);
  const boostedOdds = totalOdds * (1 + bonusPct / 100);
  const boostedWin = stake * boostedOdds;
  const isCombo = selections.length > 1;
  const hasInsurance = selections.length >= 5;
  const refundAmount = Math.min(stake, 5000);

  const handleStakeInput = (val: string) => {
    setStakeInput(val);
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) setStake(n);
  };

  const handleQuickStake = (val: number) => {
    setStake(val);
    setStakeInput(String(val));
  };

  return (
    <aside className={cn(
      showOnMobile ? "flex" : "hidden md:flex",
      "w-full md:w-72 border-l border-border bg-card h-full flex-col",
      className
    )}>
      {/* Header */}
      <div className="bg-primary px-3 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary-foreground">Bet Slip</span>
          {selections.length > 0 && (
            <Badge className="bg-white/20 text-white border-white/20 text-[11px] px-1.5 py-0 min-w-[20px] justify-center">
              {selections.length}
            </Badge>
          )}
        </div>
        {selections.length > 0 && (
          <button
            onClick={clearSelections}
            className="text-white/70 hover:text-white transition-colors p-0.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Bet Type Tabs — only show for multi */}
      {isCombo && (
        <div className="flex border-b border-border flex-shrink-0">
          <button
            onClick={() => setBetType("single")}
            className={`flex-1 py-2 text-xs font-semibold transition-colors border-b-2 ${
              betType === "single"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Singles
          </button>
          <button
            onClick={() => setBetType("combo")}
            className={`flex-1 py-2 text-xs font-semibold transition-colors border-b-2 ${
              betType === "combo"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Combo ({selections.length})
          </button>
        </div>
      )}

      {selections.length === 0 ? (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <svg className="w-7 h-7 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Your bet slip is empty</p>
            <p className="text-xs text-muted-foreground mt-1">Click any odds button to add a selection</p>
          </div>
          <p className="text-[10px] text-muted-foreground/60">Min stake: {formatCurrency(100)}</p>
        </div>
      ) : (
        <>
          {/* Selections */}
          <ScrollArea className="flex-1">
            <div className="px-3 py-2 space-y-0">
              {selections.map((sel, idx) => (
                <div
                  key={sel.id}
                  className="py-2.5 border-b border-border/40 last:border-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground leading-tight truncate">
                        {sel.sport}{sel.league ? ` · ${sel.league}` : ""}
                      </p>
                      <p className="text-xs font-semibold leading-tight mt-0.5 truncate">
                        {sel.homeTeam}{sel.awayTeam ? ` vs ${sel.awayTeam}` : ""}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium leading-tight truncate max-w-[110px]">
                          {sel.selectionValue}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5 flex-shrink-0">
                      <span className="text-sm font-bold text-primary tabular-nums">
                        {sel.odds.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeSelection(sel.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Multi-Bet Bonus strip */}
            {bonusPct > 0 && (
              <div className="mx-3 mb-2 rounded-lg bg-green-500/10 border border-green-500/20 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-3 py-2"
                  onClick={() => setBonusExpanded(e => !e)}
                >
                  <div className="flex items-center gap-2">
                    <Gift className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs font-semibold text-green-600">Multi-Bet Bonus</span>
                    <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0">+{bonusPct}%</Badge>
                  </div>
                  {bonusExpanded
                    ? <ChevronUp className="w-3.5 h-3.5 text-green-500" />
                    : <ChevronDown className="w-3.5 h-3.5 text-green-500" />
                  }
                </button>
                {bonusExpanded && (
                  <div className="px-3 pb-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Original odds</span>
                      <span className="line-through text-muted-foreground">{totalOdds.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-600 font-semibold">Boosted odds</span>
                      <span className="font-bold text-green-600">{boostedOdds.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-0.5 pt-1">
                      {[[4,5],[5,10],[8,25],[10,35]].map(([n, pct]) => (
                        <div key={n} className={`text-center text-[9px] py-0.5 rounded ${selections.length >= n ? "bg-green-500/20 text-green-600 font-bold" : "bg-muted text-muted-foreground"}`}>
                          {n}+·{pct}%
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Fuz Insurance strip */}
            {hasInsurance && (
              <div className="mx-3 mb-3 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-blue-600 leading-tight">Fuz Insurance Active</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    1 leg misses → refund up to {formatCurrency(refundAmount)}
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Stake + Summary + CTA */}
          <div className="border-t border-border px-3 py-3 space-y-3 flex-shrink-0">
            {/* Quick Stakes */}
            <div className="grid grid-cols-5 gap-1">
              {QUICK_STAKES.map(v => (
                <button
                  key={v}
                  onClick={() => handleQuickStake(v)}
                  className={`text-[10px] font-semibold py-1.5 rounded transition-colors ${
                    stake === v
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {v >= 1000 ? `₦${v/1000}k` : `₦${v}`}
                </button>
              ))}
            </div>

            {/* Custom Stake Input */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex-shrink-0">Stake</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₦</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={stakeInput || stake}
                  onChange={e => handleStakeInput(e.target.value)}
                  className="pl-6 h-8 text-sm font-semibold text-right pr-2"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1.5 text-xs">
              {isCombo && betType === "combo" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Odds
                    {bonusPct > 0 && <span className="text-green-500 ml-1">(+{bonusPct}% boost)</span>}
                  </span>
                  <span className="font-bold tabular-nums">
                    {bonusPct > 0 ? boostedOdds.toFixed(2) : totalOdds.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t border-border">
                <span className="text-sm font-semibold">Potential Win</span>
                <span className="text-base font-bold text-green-500 tabular-nums">
                  {formatCurrency(bonusPct > 0 && isCombo && betType === "combo" ? boostedWin : potentialWin)}
                </span>
              </div>
            </div>

            {/* Place Bet CTA */}
            <Button
              className="w-full h-11 text-sm font-bold bg-green-600 hover:bg-green-700 text-white"
              onClick={placeBet}
              disabled={isPlacingBet || selections.length === 0}
            >
              {isPlacingBet ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Placing Bet...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Place Bet — {formatCurrency(stake)}
                </span>
              )}
            </Button>

            {/* Disclaimer */}
            <p className="text-[9px] text-center text-muted-foreground/60 leading-tight">
              18+ · Please bet responsibly · T&amp;Cs apply
            </p>
          </div>
        </>
      )}
    </aside>
  );
};

export default BetSlip;
