import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { PredictionMarketCard } from '@/components/prediction/PredictionMarketCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star } from 'lucide-react';
import { predictionsApi } from '@/lib/api/predictions';
import { useToast } from '@/hooks/use-toast';

export default function Social() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [placingId, setPlacingId] = useState<string | null>(null);

  const { data: markets = [], isLoading } = useQuery({
    queryKey: ['entertainment-markets'],
    queryFn: predictionsApi.getEntertainmentMarkets,
    refetchInterval: 10 * 60 * 1000,
  });

  const { data: myBets = [], isLoading: betsLoading } = useQuery({
    queryKey: ['entertainment-my-bets'],
    queryFn: predictionsApi.getMyEntertainmentBets,
  });

  const placeBet = async (marketId: string, selectionId: string, _name: string, _odds: number, stake: number) => {
    setPlacingId(marketId);
    try {
      await predictionsApi.placeEntertainmentBet(marketId, selectionId, stake);
      toast({ title: 'Bet placed!', description: `₦${stake.toLocaleString()} bet accepted.` });
      qc.invalidateQueries({ queryKey: ['entertainment-my-bets'] });
    } catch (err: any) {
      toast({ title: 'Failed', description: err.response?.data?.error || err.message, variant: 'destructive' });
    } finally {
      setPlacingId(null);
    }
  };

  const typeLabels: Record<string, { label: string; color: string }> = {
    AWARD_WINNER:  { label: 'Awards',     color: 'yellow' },
    REALITY_TV:    { label: 'Reality TV', color: 'purple' },
    BOX_OFFICE:    { label: 'Nollywood',  color: 'orange' },
    CELEBRITY_NEWS:{ label: 'Celebrity',  color: 'green'  },
    MUSIC_CHART:   { label: 'Music',      color: 'blue'   },
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FuzSocial</h1>
                <p className="text-sm text-muted-foreground">Nigerian entertainment, Nollywood, AMVCA, BBNaija & more.</p>
              </div>
              <Badge variant="outline" className="ml-auto border-pink-500/30 text-pink-500 text-xs">Entertainment</Badge>
            </div>

            <Tabs defaultValue="markets">
              <TabsList>
                <TabsTrigger value="markets">Open Markets</TabsTrigger>
                <TabsTrigger value="my-bets">My Bets ({myBets.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="markets" className="space-y-3 mt-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)
                ) : markets.length === 0 ? (
                  <Card className="p-10 text-center text-muted-foreground">
                    <Star className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No open markets right now</p>
                    <p className="text-sm mt-1">Entertainment markets auto-generate from Nigerian news every 6 hours</p>
                  </Card>
                ) : (
                  markets.map((market: any) => {
                    const typeInfo = typeLabels[market.type] || { label: 'Entertainment', color: 'purple' };
                    return (
                      <PredictionMarketCard
                        key={market.id}
                        market={{
                          id: market.id,
                          title: market.title,
                          description: market.description,
                          closeDate: market.endTime,
                          outcomes: (market.selections || []).map((s: any) => ({
                            id: s.id,
                            name: s.name,
                            odds: Number(s.odds),
                          })),
                        }}
                        categoryColor={typeInfo.color}
                        categoryLabel={typeInfo.label}
                        onPlaceBet={(selectionId, name, odds, stake) =>
                          placeBet(market.id, selectionId, name, odds, stake)
                        }
                        isPlacing={placingId === market.id}
                      />
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="my-bets" className="mt-4">
                {betsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full mb-2" />)
                ) : myBets.length === 0 ? (
                  <Card className="p-10 text-center text-muted-foreground">
                    <p>No bets placed yet. Pick a market above to get started.</p>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {myBets.map((bet: any) => (
                      <Card key={bet.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{bet.entertainmentMarket?.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Picked: <strong>{(bet.entertainmentMarket?.selections || []).find((s: any) => s.id === bet.selectionId)?.name || '—'}</strong>
                              &nbsp;@ {Number(bet.odds).toFixed(2)}
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
