import { useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

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

const mockOdds: OddsData[] = [
  {
    matchId: "1",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    home: "2.10",
    draw: "3.40",
    away: "3.50",
    over25: "1.85",
    under25: "2.00",
  },
  // TODO: DEV – fetch from realtime_odds_cache
];

export default function Odds() {
  const [oddsData, setOddsData] = useState<OddsData[]>(mockOdds);

  const handleOddsChange = (matchId: string, field: keyof OddsData, value: string) => {
    setOddsData((prev) =>
      prev.map((odds) =>
        odds.matchId === matchId ? { ...odds, [field]: value } : odds
      )
    );
  };

  const handleSave = () => {
    // TODO: DEV – validate odds sum, update cache, broadcast via websocket
    toast.success("Odds updated successfully");
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Odds Management</h1>
              <p className="text-muted-foreground">Edit live betting odds</p>
            </div>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save All Changes
            </Button>
          </div>

          <div className="space-y-4">
            {oddsData.map((odds) => (
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
            ))}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
