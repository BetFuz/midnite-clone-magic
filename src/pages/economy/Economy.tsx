import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, RefreshCw, DollarSign } from 'lucide-react';
import { predictionsApi } from '@/lib/api/predictions';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Economy() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [placingId, setPlacingId] = useState<string | null>(null);
  const [stakes, setStakes] = useState<Record<string, string>>({});
  const [picks, setPicks] = useState<Record<string, 'UP' | 'DOWN'>>({});

  const { data: markets = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['financial-markets'],
    queryFn: predictionsApi.getFinancialMarkets,
    refetchInterval: 15 * 60 * 1000,
  });

  const { data: prices } = useQuery({
    queryKey: ['live-prices'],
    queryFn: predictionsApi.getLivePrices,
    refetchInterval: 2 * 60 * 1000,
  });

  const { data: myBets = [], isLoading: betsLoading } = useQuery({
    queryKey: ['financial-my-bets'],
    queryFn: predictionsApi.getMyFinancialBets,
  });

  const placeBet = async (marketId: string) => {
    const prediction = picks[marketId];
    const stake = parseFloat(stakes[marketId] || '');
    if (!prediction || !stake || stake <= 0) return;
    setPlacingId(marketId);
    try {
      await predictionsApi.placeFinancialBet(marketId, prediction, stake);
      toast({ title: 'Bet placed!', description: `₦${stake.toLocaleString()} on ${prediction} placed.` });
      qc.invalidateQueries({ queryKey: ['financial-my-bets'] });
      setPicks(p => { const n = { ...p }; delete n[marketId]; return n; });
      setStakes(s => { const n = { ...s }; delete n[marketId]; return n; });
    } catch (err: any) {
      toast({ title: 'Failed', description: err.response?.data?.error || err.message, variant: 'destructive' });
    } finally {
      setPlacingId(null);
    }
  };

  const symbolLabels: Record<string, { label: string; icon: string; color: string }> = {
    bitcoin:     { label: 'Bitcoin',  icon: '₿',  color: 'orange' },
    ethereum:    { label: 'Ethereum', icon: 'Ξ',  color: 'purple' },
    binancecoin: { label: 'BNB',      icon: 'B',  color: 'yellow' },
    'USD/NGN':   { label: 'USD/NGN',  icon: '$',  color: 'green'  },
  };

  const fmt = (v: number | null | undefined, sym: string) => {
    if (!v) return '—';
    if (sym === 'USD/NGN') return `₦${Math.round(v).toLocaleString()}`;
    return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-56 pb-20 md:pb-6">
          <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FuzEconomy</h1>
                <p className="text-sm text-muted-foreground">Bet on crypto prices, forex rates, and market movements.</p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              </Button>
            </div>

            {/* Live ticker */}
            {prices && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { sym: 'bitcoin',  label: 'BTC', value: prices.bitcoin?.usd },
                  { sym: 'ethereum', label: 'ETH', value: prices.ethereum?.usd },
                  { sym: 'binancecoin', label: 'BNB', value: prices.binancecoin?.usd },
                  { sym: 'USD/NGN', label: 'USD/NGN', value: prices['USD/NGN'] },
                ].map(({ sym, label, value }) => (
                  <Card key={sym} className="p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-bold">{fmt(value, sym)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">live</p>
                  </Card>
                ))}
              </div>
            )}

            <Tabs defaultValue="markets">
              <TabsList>
                <TabsTrigger value="markets">Open Markets</TabsTrigger>
                <TabsTrigger value="my-bets">My Bets ({myBets.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="markets" className="space-y-3 mt-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 w-full" />)
                ) : markets.length === 0 ? (
                  <Card className="p-10 text-center text-muted-foreground">
                    <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No open markets right now</p>
                    <p className="text-sm mt-1">Markets auto-generate daily from live crypto and forex prices</p>
                  </Card>
                ) : (
                  markets.map((market: any) => {
                    const sym = symbolLabels[market.symbol] || { label: market.symbol, icon: '📈', color: 'blue' };
                    const currentVal = Number(market.currentValue) || 0;
                    const targetVal  = Number(market.targetValue) || 0;
                    const pct = targetVal && currentVal ? ((targetVal - currentVal) / currentVal * 100).toFixed(1) : null;
                    const pick = picks[market.id];
                    const stakeVal = parseFloat(stakes[market.id] || '') || 0;

                    return (
                      <Card key={market.id} className="hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-2 pt-4 px-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Badge variant="outline" className="text-[10px] mb-1 border-green-500/30 text-green-600">
                                {sym.label} · {market.type?.replace('_', ' ')}
                              </Badge>
                              <CardTitle className="text-sm font-semibold leading-snug">{market.question}</CardTitle>
                              {market.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{market.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                            <span>Current: <strong className="text-foreground">{fmt(currentVal, market.symbol)}</strong></span>
                            <span>Target: <strong className="text-foreground">{fmt(targetVal, market.symbol)}</strong></span>
                            {pct && <span className="text-muted-foreground">({pct}% away)</span>}
                            <span className="ml-auto">
                              Closes {formatDistanceToNow(new Date(market.endTime), { addSuffix: true })}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <button
                              onClick={() => setPicks(p => ({ ...p, [market.id]: 'UP' }))}
                              className={cn(
                                'flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-sm font-medium transition-all',
                                pick === 'UP'
                                  ? 'border-2 border-green-500 bg-green-500/10 text-green-600'
                                  : 'border-border hover:border-green-500/40 hover:bg-green-500/5'
                              )}
                            >
                              <TrendingUp className="h-4 w-4" />
                              YES · 1.90
                            </button>
                            <button
                              onClick={() => setPicks(p => ({ ...p, [market.id]: 'DOWN' }))}
                              className={cn(
                                'flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-sm font-medium transition-all',
                                pick === 'DOWN'
                                  ? 'border-2 border-red-500 bg-red-500/10 text-red-600'
                                  : 'border-border hover:border-red-500/40 hover:bg-red-500/5'
                              )}
                            >
                              <TrendingDown className="h-4 w-4" />
                              NO · 1.90
                            </button>
                          </div>

                          {pick && (
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                placeholder="Stake (₦)"
                                value={stakes[market.id] || ''}
                                onChange={(e) => setStakes(s => ({ ...s, [market.id]: e.target.value }))}
                                min={100}
                                className="h-8 text-xs"
                              />
                              <Button
                                size="sm"
                                className="h-8 px-3 text-xs whitespace-nowrap"
                                disabled={stakeVal <= 0 || placingId === market.id}
                                onClick={() => placeBet(market.id)}
                              >
                                {placingId === market.id
                                  ? '...'
                                  : `Win ₦${(stakeVal * 1.9).toFixed(0)}`}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="my-bets" className="mt-4">
                {betsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full mb-2" />)
                ) : myBets.length === 0 ? (
                  <Card className="p-10 text-center text-muted-foreground">
                    <p>No bets placed yet. Pick a market above.</p>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {myBets.map((bet: any) => (
                      <Card key={bet.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{bet.financialMarket?.question}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Prediction: <strong>{bet.prediction}</strong> @ {Number(bet.odds).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <Badge className={
                              bet.status === 'WON'  ? 'bg-green-500/20 text-green-500' :
                              bet.status === 'LOST' ? 'bg-red-500/20 text-red-500' :
                              'bg-muted text-muted-foreground'
                            }>{bet.status}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">₦{Number(bet.stake).toLocaleString()}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
