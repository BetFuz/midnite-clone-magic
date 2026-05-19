import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Trophy, Clock, Users } from 'lucide-react';
import { predictionsApi } from '@/lib/api/predictions';
import { betApi } from '@/lib/api/bets';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Predict() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [placingId, setPlacingId] = useState<string | null>(null);
  const [selectedOdds, setSelectedOdds] = useState<Record<string, { oddsId: string; marketId: string; name: string; value: number }>>({});
  const [stakes, setStakes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('markets');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['predict-markets'],
    queryFn: predictionsApi.getPredictMarkets,
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: myBets = [], isLoading: betsLoading } = useQuery({
    queryKey: ['predict-my-bets'],
    queryFn: predictionsApi.getMyPredictBets,
    enabled: activeTab === 'my-bets',
  });

  const { data: leaderboard = [], isLoading: lbLoading } = useQuery({
    queryKey: ['predict-leaderboard'],
    queryFn: predictionsApi.getPredictLeaderboard,
    enabled: activeTab === 'leaderboard',
  });

  const placeBet = async (eventId: string) => {
    const sel = selectedOdds[eventId];
    const stake = parseFloat(stakes[eventId] || '');
    if (!sel || !stake || stake <= 0) return;
    setPlacingId(eventId);
    try {
      await betApi.placeBet({
        stake,
        betType: 'single',
        selections: [{
          eventId,
          marketId: sel.marketId,
          oddsId:   sel.oddsId,
          odds:     sel.value,
        }],
      });
      toast({ title: 'Prediction placed!', description: `₦${stake.toLocaleString()} on ${sel.name}. Good luck!` });
      qc.invalidateQueries({ queryKey: ['predict-my-bets'] });
      setSelectedOdds(s => { const n = { ...s }; delete n[eventId]; return n; });
      setStakes(s => { const n = { ...s }; delete n[eventId]; return n; });
    } catch (err: any) {
      toast({ title: 'Failed', description: err.response?.data?.error || err.message, variant: 'destructive' });
    } finally {
      setPlacingId(null);
    }
  };

  const sportEmoji: Record<string, string> = {
    football: '⚽', soccer: '⚽', basketball: '🏀', tennis: '🎾',
    cricket: '🏏', rugby: '🏉', boxing: '🥊', baseball: '⚾',
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FuzPredict</h1>
                <p className="text-sm text-muted-foreground">Sports match predictions. Pick winners from upcoming fixtures.</p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="markets">Upcoming Matches</TabsTrigger>
                <TabsTrigger value="my-bets">My Predictions</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              </TabsList>

              {/* Upcoming matches */}
              <TabsContent value="markets" className="space-y-3 mt-4">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
                ) : events.length === 0 ? (
                  <Card className="p-10 text-center text-muted-foreground">
                    <Target className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No upcoming matches found</p>
                    <p className="text-sm mt-1">Check back when sports events are loaded into the system</p>
                  </Card>
                ) : (
                  events.map((event: any) => {
                    const sel = selectedOdds[event.id];
                    const stakeVal = parseFloat(stakes[event.id] || '') || 0;
                    const emoji = sportEmoji[event.sport?.toLowerCase()] || '🎯';

                    // Flatten all odds across markets for this event
                    const allOdds = (event.markets || []).flatMap((m: any) =>
                      (m.odds || []).map((o: any) => ({ ...o, marketId: m.id, marketName: m.name }))
                    );

                    if (allOdds.length === 0) return null;

                    return (
                      <Card key={event.id} className="hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-2 pt-4 px-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{emoji}</span>
                            <Badge variant="secondary" className="text-[10px]">{event.league}</Badge>
                            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(event.closeDate), { addSuffix: true })}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold">{event.homeTeam} vs {event.awayTeam}</h3>
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          <div className={cn('grid gap-2 mb-3', allOdds.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
                            {allOdds.slice(0, 3).map((o: any) => (
                              <button
                                key={o.id}
                                onClick={() => setSelectedOdds(s => ({
                                  ...s,
                                  [event.id]: sel?.oddsId === o.id ? undefined as any : { oddsId: o.id, marketId: o.marketId, name: o.name, value: Number(o.value) },
                                }))}
                                className={cn(
                                  'flex flex-col items-center p-2.5 rounded-lg border text-xs font-medium transition-all',
                                  sel?.oddsId === o.id
                                    ? 'border-2 border-primary bg-primary/10'
                                    : 'border-border hover:border-primary/50 hover:bg-muted/60'
                                )}
                              >
                                <span className="text-muted-foreground text-[11px]">{o.name}</span>
                                <span className="text-lg font-bold">{Number(o.value).toFixed(2)}</span>
                              </button>
                            ))}
                          </div>

                          {sel && (
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                placeholder="Stake (₦)"
                                value={stakes[event.id] || ''}
                                onChange={(e) => setStakes(s => ({ ...s, [event.id]: e.target.value }))}
                                min={100}
                                className="h-8 text-xs"
                              />
                              <Button
                                size="sm"
                                className="h-8 px-3 text-xs whitespace-nowrap"
                                disabled={stakeVal <= 0 || placingId === event.id}
                                onClick={() => placeBet(event.id)}
                              >
                                {placingId === event.id
                                  ? '...'
                                  : `Win ₦${(stakeVal * sel.value).toFixed(0)}`}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  }).filter(Boolean)
                )}
              </TabsContent>

              {/* My prediction bets */}
              <TabsContent value="my-bets" className="mt-4">
                {betsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full mb-2" />)
                ) : myBets.length === 0 ? (
                  <Card className="p-10 text-center text-muted-foreground">
                    <p>No predictions placed yet. Pick a match above.</p>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {myBets.map((bet: any) => (
                      <Card key={bet.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {(bet.selections || []).slice(0, 1).map((s: any) => (
                              <div key={s.id}>
                                <p className="text-sm font-medium">
                                  {s.event?.homeTeam} vs {s.event?.awayTeam}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {s.event?.league} · Picked: <strong>{s.selectionName}</strong> @ {Number(s.oddsValue).toFixed(2)}
                                </p>
                              </div>
                            ))}
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

              {/* Leaderboard */}
              <TabsContent value="leaderboard" className="mt-4">
                <Card>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      Top Predictors This Week
                    </h3>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    {lbLoading ? (
                      Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full mb-2" />)
                    ) : leaderboard.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No winners yet this week</p>
                    ) : (
                      <div className="space-y-2">
                        {leaderboard.map((entry: any) => (
                          <div key={entry.userId} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                            <span className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                              entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-600' :
                              entry.rank === 2 ? 'bg-gray-400/20 text-gray-500' :
                              entry.rank === 3 ? 'bg-orange-500/20 text-orange-600' :
                              'bg-muted text-muted-foreground'
                            )}>
                              {entry.rank}
                            </span>
                            <Users className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm font-medium flex-1 truncate">{entry.username}</span>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-semibold">{entry.correctBets} wins</p>
                              <p className="text-xs text-muted-foreground">₦{Math.round(entry.totalWon).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
