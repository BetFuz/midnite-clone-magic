import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { useRealtimeBetUpdates } from "@/hooks/useRealtimeBetUpdates";
import { Wifi, WifiOff, Clock, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface BetTicketLiveProps {
  betSlipId: string;
  status: string;
  totalStake: number;
  potentialWin: number;
  totalOdds: number;
  selections: Array<{
    home_team: string;
    away_team: string;
    selection_value: string;
    odds: number;
    status?: string;
  }>;
}

export const BetTicketLive = ({ 
  betSlipId, 
  status, 
  totalStake, 
  potentialWin, 
  totalOdds,
  selections 
}: BetTicketLiveProps) => {
  const { connected, cashoutOffers, requestCashout, acceptCashout } = useRealtimeBetUpdates();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const cashoutOffer = cashoutOffers.get(betSlipId);
  const canCashout = status === 'pending' || status === 'pending_settlement';

  useEffect(() => {
    if (!cashoutOffer) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, cashoutOffer.expiresAt.getTime() - Date.now());
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [cashoutOffer]);

  const handleRequestCashout = () => {
    requestCashout(betSlipId);
  };

  const handleAcceptCashout = () => {
    if (cashoutOffer) {
      acceptCashout(betSlipId, cashoutOffer.cashoutOffer);
    }
  };

  const cashoutPercentage = cashoutOffer 
    ? (cashoutOffer.cashoutOffer / potentialWin) * 100 
    : 0;

  const timeLeftSeconds = timeLeft ? Math.ceil(timeLeft / 1000) : 0;

  return (
    <Card className="relative overflow-hidden">
      {/* Connection Status */}
      <div className="absolute top-2 right-2">
        {connected ? (
          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500 border-green-500/20">
            <Wifi className="h-3 w-3" />
            Live
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 bg-red-500/10 text-red-500 border-red-500/20">
            <WifiOff className="h-3 w-3" />
            Offline
          </Badge>
        )}
      </div>

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bet #{betSlipId.slice(0, 8)}</span>
          <Badge variant={
            status === 'won' ? 'default' : 
            status === 'lost' ? 'destructive' : 
            status === 'cashed_out' ? 'secondary' :
            'outline'
          }>
            {status.replace('_', ' ').toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Selections */}
        <div className="space-y-2">
          {selections.map((selection, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {selection.home_team} vs {selection.away_team}
                </p>
                <p className="text-xs text-muted-foreground">{selection.selection_value}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selection.odds.toFixed(2)}</Badge>
                {selection.status && (
                  <Badge variant={
                    selection.status === 'won' ? 'default' :
                    selection.status === 'lost' ? 'destructive' :
                    'outline'
                  } className="text-xs">
                    {selection.status}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bet Info */}
        <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted/30">
          <div>
            <p className="text-xs text-muted-foreground">Stake</p>
            <p className="font-semibold">{formatCurrency(totalStake)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Odds</p>
            <p className="font-semibold">{totalOdds.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Potential Win</p>
            <p className="font-semibold text-primary">{formatCurrency(potentialWin)}</p>
          </div>
        </div>

        {/* Cashout Section */}
        {canCashout && (
          <div className="space-y-3">
            {!cashoutOffer ? (
              <Button 
                onClick={handleRequestCashout}
                variant="outline"
                className="w-full"
                disabled={!connected}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Request Cashout
              </Button>
            ) : (
              <div className="space-y-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Cashout Offer</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(cashoutOffer.cashoutOffer)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {cashoutPercentage.toFixed(0)}% of potential win
                    </p>
                    <div className="flex items-center gap-1 text-orange-500">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs font-mono">{timeLeftSeconds}s</span>
                    </div>
                  </div>
                </div>

                <Progress value={(timeLeftSeconds / 30) * 100} className="h-1" />

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={handleAcceptCashout}
                    size="sm"
                    disabled={timeLeftSeconds === 0}
                  >
                    Accept {formatCurrency(cashoutOffer.cashoutOffer)}
                  </Button>
                  <Button 
                    onClick={() => requestCashout(betSlipId)}
                    variant="outline"
                    size="sm"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settled Message */}
        {(status === 'won' || status === 'lost' || status === 'cashed_out') && (
          <div className={`p-3 rounded-lg ${
            status === 'won' ? 'bg-green-500/10 text-green-500' :
            status === 'cashed_out' ? 'bg-blue-500/10 text-blue-500' :
            'bg-red-500/10 text-red-500'
          }`}>
            <p className="text-sm font-medium text-center">
              {status === 'won' && `🎉 Won ${formatCurrency(potentialWin)}`}
              {status === 'lost' && `Lost ${formatCurrency(totalStake)}`}
              {status === 'cashed_out' && `Cashed out`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
