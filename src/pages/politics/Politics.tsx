import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { PredictionMarketCard } from '@/components/prediction/PredictionMarketCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Landmark, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { predictionsApi } from '@/lib/api/predictions';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function Politics() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [placingId, setPlacingId] = useState<string | null>(null);

  const { data: markets = [], isLoading } = useQuery({
    queryKey: ['politics-markets'],
    queryFn: predictionsApi.getPoliticsMarkets,
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: myBets = [], isLoading: betsLoading } = useQuery({
    queryKey: ['politics-my-bets'],
    queryFn: predictionsApi.getMyPoliticsBets,
  });

  const placeBet = async (marketId: string, selectionId: string, _name: string, _odds: number, stake: number) => {
    setPlacingId(marketId);
    try {
      await predictionsApi.placePoliticsBet(marketId, selectionId, stake);
      toast({ title: 'Bet placed!', description: `₦${stake.toLocaleString()} bet accepted.` });
      qc.invalidateQueries({ queryKey: ['politics-my-bets'] });
    } catch (err: any) {
      toast({ title: 'Failed', description: err.response?.data?.error || err.message, variant: 'destructive' });
    } finally {
      setPlacingId(null);
    }
  };

  const typeLabels: Record<string, string> = {
    ELECTION_WINNER: 'Election',
    APPROVAL_RATING: 'Approval',
    GOVERNMENT_EVENT: 'Politics',
    LEGISLATION: 'Legislation',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-56 pb-20 md:pb-6">
          <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">

            {/* Page header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FuzPolitics</h1>
                <p className="text-sm text-muted-foreground">Bet on Nigerian political outcomes. Markets refresh every 6 hours.</p>
              </div>
              <Badge variant="outline" className="ml-auto border-blue-500/30 text-blue-500 text-xs">Nigeria Focus</Badge>
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
                    <Landmark className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No open markets right now</p>
                    <p className="text-sm mt-1">Markets auto-generate from live Nigerian news every 6 hours</p>
                  </Card>
                ) : (
                  markets.map((market: any) => (
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
                      categoryColor="blue"
                      categoryLabel={typeLabels[market.type] || 'Politics'}
                      onPlaceBet={(selectionId, name, odds, stake) =>
                        placeBet(market.id, selectionId, name, odds, stake)
                      }
                      isPlacing={placingId === market.id}
                    />
                  ))
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
                            <p className="text-sm font-medium line-clamp-1">{bet.politicalMarket?.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Picked: <strong>{(bet.politicalMarket?.selections || []).find((s: any) => s.id === bet.selectionId)?.name || '—'}</strong>
                              &nbsp;@ {Number(bet.odds).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <Badge className={
                              bet.status === 'WON' ? 'bg-green-500/20 text-green-500' :
                              bet.status === 'LOST' ? 'bg-red-500/20 text-red-500' :
                              'bg-muted text-muted-foreground'
                            }>
                              {bet.status}
                            </Badge>
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
