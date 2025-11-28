import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { TrendingUp, Sparkles, Users, Star, Lock } from "lucide-react";

interface Player {
  id: string;
  full_name: string;
  team: string;
  position: string;
  salary: number;
  projected_points: number;
  average_points: number;
  injury_status: string;
  ownership_percentage?: number;
}

interface SalaryCapDraftInterfaceProps {
  leagueId: string;
  sport: string;
  onLineupComplete?: (lineup: any) => void;
}

export const SalaryCapDraftInterface = ({ leagueId, sport, onLineupComplete }: SalaryCapDraftInterfaceProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  
  const SALARY_CAP = 60000;
  const totalSalary = selectedPlayers.reduce((sum, p) => sum + p.salary, 0);
  const remainingSalary = SALARY_CAP - totalSalary;
  const totalProjected = selectedPlayers.reduce((sum, p) => sum + p.projected_points, 0);

  // Position requirements for Football
  const positionReqs = {
    QB: 1,
    RB: 2,
    WR: 3,
    TE: 1,
    K: 1,
    DEF: 1
  };

  const selectedByPosition = selectedPlayers.reduce((acc, p) => {
    acc[p.position] = (acc[p.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    loadPlayers();
  }, [leagueId, sport]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      
      // Generate/fetch players with AI projections
      const { data, error } = await supabase.functions.invoke('fantasy-player-projections', {
        body: { leagueId, sport }
      });

      if (error) throw error;

      setPlayers(data.players || []);
      toast.success(`Loaded ${data.players?.length || 0} players with AI projections`);
    } catch (error) {
      console.error('Error loading players:', error);
      toast.error('Failed to load player pool');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeLineup = async () => {
    try {
      setOptimizing(true);
      
      const { data, error } = await supabase.functions.invoke('fantasy-optimize-lineup', {
        body: { 
          leagueId, 
          salaryCap: SALARY_CAP,
          positionRequirements: positionReqs
        }
      });

      if (error) throw error;

      const optimizedPlayers = data.lineup.map((l: any) => 
        players.find(p => p.id === l.player_id) || l
      );

      setSelectedPlayers(optimizedPlayers);
      toast.success(`Optimized! ${formatCurrency(data.total_salary)} | ${data.total_projected_points.toFixed(1)} pts`);
    } catch (error) {
      console.error('Error optimizing:', error);
      toast.error('Failed to optimize lineup');
    } finally {
      setOptimizing(false);
    }
  };

  const togglePlayer = (player: Player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else {
      // Check position requirement
      const currentCount = selectedByPosition[player.position] || 0;
      const maxAllowed = positionReqs[player.position as keyof typeof positionReqs] || 0;
      
      if (currentCount >= maxAllowed) {
        toast.error(`Max ${maxAllowed} ${player.position} allowed`);
        return;
      }

      if (totalSalary + player.salary > SALARY_CAP) {
        toast.error(`Exceeds salary cap by ${formatCurrency(totalSalary + player.salary - SALARY_CAP)}`);
        return;
      }

      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const isLineupComplete = Object.entries(positionReqs).every(
    ([pos, req]) => (selectedByPosition[pos] || 0) === req
  );

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === "all" || p.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const positions = [...new Set(players.map(p => p.position))];

  return (
    <div className="space-y-6">
      {/* Salary Cap Progress */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">
              {formatCurrency(remainingSalary)} <span className="text-sm text-muted-foreground">/ {formatCurrency(SALARY_CAP)}</span>
            </h3>
            <p className="text-sm text-muted-foreground">Remaining Salary</p>
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-bold text-green-500">{totalProjected.toFixed(1)} pts</h3>
            <p className="text-sm text-muted-foreground">Projected</p>
          </div>
        </div>
        <Progress value={(totalSalary / SALARY_CAP) * 100} className="h-3" />
        
        {/* Position Requirements */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
          {Object.entries(positionReqs).map(([pos, req]) => {
            const current = selectedByPosition[pos] || 0;
            const complete = current === req;
            return (
              <div key={pos} className={`p-2 rounded-lg text-center ${complete ? 'bg-green-500/20' : 'bg-muted'}`}>
                <div className="text-xs font-semibold">{pos}</div>
                <div className="text-sm">{current}/{req}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          onClick={handleOptimizeLineup} 
          disabled={optimizing || loading}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {optimizing ? 'Optimizing...' : 'AI Optimize'}
        </Button>
        <Button 
          variant="outline" 
          onClick={loadPlayers}
          disabled={loading}
        >
          Refresh Players
        </Button>
        {isLineupComplete && (
          <Button 
            variant="default" 
            className="ml-auto gap-2"
            onClick={() => onLineupComplete?.(selectedPlayers)}
          >
            <Lock className="w-4 h-4" />
            Lock Lineup
          </Button>
        )}
      </div>

      {/* Player Pool */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="px-3 rounded-md border bg-background"
              >
                <option value="all">All Positions</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading players...</div>
              ) : filteredPlayers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No players found</div>
              ) : (
                filteredPlayers.map(player => {
                  const isSelected = selectedPlayers.some(p => p.id === player.id);
                  return (
                    <Card 
                      key={player.id}
                      className={`p-4 cursor-pointer transition-all hover:scale-[1.02] ${
                        isSelected ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => togglePlayer(player)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{player.position}</Badge>
                            <h4 className="font-semibold">{player.full_name}</h4>
                            {player.injury_status !== 'healthy' && (
                              <Badge variant="destructive" className="text-xs">
                                {player.injury_status}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{player.team}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{formatCurrency(player.salary)}</div>
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span>{player.projected_points.toFixed(1)} pts</span>
                            {player.ownership_percentage !== undefined && (
                              <span className="text-muted-foreground">
                                <Users className="w-3 h-3 inline" /> {player.ownership_percentage.toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Selected Lineup */}
        <div>
          <Card className="p-4 sticky top-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Your Lineup ({selectedPlayers.length})
            </h3>
            
            {selectedPlayers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Select players to build your lineup
              </div>
            ) : (
              <div className="space-y-2">
                {selectedPlayers.map(player => (
                  <div key={player.id} className="p-3 rounded-lg bg-muted">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-sm">{player.full_name}</div>
                        <div className="text-xs text-muted-foreground">{player.position}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{formatCurrency(player.salary)}</div>
                        <div className="text-xs text-green-500">{player.projected_points.toFixed(1)} pts</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
