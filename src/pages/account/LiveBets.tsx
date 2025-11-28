import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BetTicketLive } from "@/components/BetTicketLive";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface BetSlip {
  id: string;
  total_stake: number;
  total_odds: number;
  potential_win: number;
  status: string;
  created_at: string;
  bet_selections: Array<{
    home_team: string;
    away_team: string;
    selection_value: string;
    odds: number;
    status?: string;
  }>;
}

const LiveBets = () => {
  const [activeBets, setActiveBets] = useState<BetSlip[]>([]);
  const [settledBets, setSettledBets] = useState<BetSlip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBets();
  }, []);

  const fetchBets = async () => {
    try {
      setLoading(true);

      const { data: bets, error } = await supabase
        .from('bet_slips')
        .select(`
          *,
          bet_selections (*)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const active = bets?.filter(bet => 
        bet.status === 'pending' || bet.status === 'pending_settlement'
      ) || [];
      
      const settled = bets?.filter(bet => 
        bet.status === 'won' || bet.status === 'lost' || bet.status === 'cashed_out'
      ) || [];

      setActiveBets(active);
      setSettledBets(settled);
    } catch (error) {
      console.error('Error fetching bets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Bets</h1>
        <p className="text-muted-foreground">Real-time bet tracking and cashout</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active">
            Active Bets ({activeBets.length})
          </TabsTrigger>
          <TabsTrigger value="settled">
            Settled ({settledBets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeBets.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No active bets</p>
              </CardContent>
            </Card>
          ) : (
            activeBets.map((bet) => (
              <BetTicketLive
                key={bet.id}
                betSlipId={bet.id}
                status={bet.status}
                totalStake={bet.total_stake}
                potentialWin={bet.potential_win}
                totalOdds={bet.total_odds}
                selections={bet.bet_selections}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="settled" className="space-y-4 mt-6">
          {settledBets.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No settled bets</p>
              </CardContent>
            </Card>
          ) : (
            settledBets.map((bet) => (
              <BetTicketLive
                key={bet.id}
                betSlipId={bet.id}
                status={bet.status}
                totalStake={bet.total_stake}
                potentialWin={bet.potential_win}
                totalOdds={bet.total_odds}
                selections={bet.bet_selections}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveBets;
