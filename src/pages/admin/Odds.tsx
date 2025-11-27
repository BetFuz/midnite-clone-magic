import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface OddsData {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  home: string;
  draw: string;
  away: string;
  over25: string;
  under25: string;
}

export default function Odds() {
  const [oddsData, setOddsData] = useState<OddsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOdds();
  }, []);

  const fetchOdds = async () => {
    try {
      setLoading(true);
      
      // Fetch upcoming matches with odds
      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'upcoming')
        .not('home_odds', 'is', null)
        .order('commence_time', { ascending: true })
        .limit(50);

      if (error) throw error;

      const formattedOdds: OddsData[] = matches.map(match => ({
        matchId: match.id,
        homeTeam: match.home_team,
        awayTeam: match.away_team,
        home: String(match.home_odds || '2.00'),
        draw: String(match.draw_odds || '3.00'),
        away: String(match.away_odds || '2.00'),
        over25: '1.85',
        under25: '2.00',
      }));

      setOddsData(formattedOdds);
    } catch (error) {
      console.error('Error fetching odds:', error);
      toast.error('Failed to load odds data');
    } finally {
      setLoading(false);
    }
  };

  const handleOddsChange = (matchId: string, field: keyof OddsData, value: string) => {
    setOddsData((prev) =>
      prev.map((odds) =>
        odds.matchId === matchId ? { ...odds, [field]: value } : odds
      )
    );
  };

  const handleSave = async () => {
    try {
      toast.loading('Updating odds...');

      // Validate odds (basic check - sum should not be < 1)
      for (const odds of oddsData) {
        const home = parseFloat(odds.home);
        const draw = parseFloat(odds.draw);
        const away = parseFloat(odds.away);
        
        if (isNaN(home) || isNaN(draw) || isNaN(away)) {
          toast.error(`Invalid odds for ${odds.homeTeam} vs ${odds.awayTeam}`);
          return;
        }

        if (home < 1.01 || draw < 1.01 || away < 1.01) {
          toast.error('Odds must be at least 1.01');
          return;
        }
      }

      // Update odds in database
      // Note: In production, this would use an admin edge function with proper validation
      for (const odds of oddsData) {
        const { error } = await supabase
          .from('matches')
          .update({
            home_odds: parseFloat(odds.home),
            draw_odds: parseFloat(odds.draw),
            away_odds: parseFloat(odds.away),
            updated_at: new Date().toISOString(),
          })
          .eq('id', odds.matchId);

        if (error) throw error;
      }

      toast.success('Odds updated successfully');
      fetchOdds();
    } catch (error) {
      console.error('Error updating odds:', error);
      toast.error('Failed to update odds. Check admin permissions.');
    }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Odds Management</h1>
              <p className="text-muted-foreground">
                {loading ? 'Loading...' : `Editing odds for ${oddsData.length} matches`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchOdds} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleSave} disabled={loading || oddsData.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                Save All Changes
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Loading odds data...</p>
                </CardContent>
              </Card>
            ) : oddsData.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">No upcoming matches with odds found</p>
                </CardContent>
              </Card>
            ) : (
              oddsData.map((odds) => (
              <Card key={odds.matchId}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {odds.homeTeam} vs {odds.awayTeam}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Home</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={odds.home}
                        onChange={(e) =>
                          handleOddsChange(odds.matchId, "home", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Draw</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={odds.draw}
                        onChange={(e) =>
                          handleOddsChange(odds.matchId, "draw", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Away</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={odds.away}
                        onChange={(e) =>
                          handleOddsChange(odds.matchId, "away", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Over 2.5</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={odds.over25}
                        onChange={(e) =>
                          handleOddsChange(odds.matchId, "over25", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Under 2.5</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={odds.under25}
                        onChange={(e) =>
                          handleOddsChange(odds.matchId, "under25", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
