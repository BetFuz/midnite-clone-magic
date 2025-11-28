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
import { TrendingUp, Sparkles, Users, Star, Lock, Info, Share2 } from "lucide-react";
import { PlayerResearchModal } from "./PlayerResearchModal";
import { LineupExportModal } from "./LineupExportModal";
import { MultiEntryManager } from "./MultiEntryManager";
import { LateSwapPanel } from "./LateSwapPanel";
import { StackingSuggestions } from "./StackingSuggestions";

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
  onLineupComplete?: (payload: { players: Player[]; totalSalary: number; totalProjected: number }) => void;
}

export const SalaryCapDraftInterface = ({ leagueId, sport, onLineupComplete }: SalaryCapDraftInterfaceProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"projected" | "salary" | "value">("projected");
  const [researchPlayer, setResearchPlayer] = useState<{ id: string; name: string } | null>(null);
  const [showExport, setShowExport] = useState(false);
  
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

  const filteredPlayers = players
    .filter(p => {
      const matchesSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = positionFilter === "all" || p.position === positionFilter;
      return matchesSearch && matchesPosition;
    })
    .sort((a, b) => {
      if (sortBy === "projected") return b.projected_points - a.projected_points;
      if (sortBy === "salary") return b.salary - a.salary;
      return (b.projected_points / b.salary) - (a.projected_points / a.salary); // value
    });

  const positions = [...new Set(players.map(p => p.position))];

  return (
    <div className="space-y-6 pb-20">
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight">Build Your Squad</h2>
              <p className="text-white/80 text-lg">Premium Fantasy Football Experience</p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold text-lg">{totalProjected.toFixed(1)} pts</span>
            </div>
          </div>

          {/* Salary Cap Visualization */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Salary Cap Usage</span>
              <span className="font-bold text-lg">{formatCurrency(remainingSalary)} remaining</span>
            </div>
            <div className="relative h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${Math.min((totalSalary / SALARY_CAP) * 100, 100)}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            </div>
            <div className="flex justify-between text-xs text-white/70">
              <span>{formatCurrency(totalSalary)} used</span>
              <span>{formatCurrency(SALARY_CAP)} total</span>
            </div>
          </div>
        
          {/* Position Requirements - Premium Style */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">
            {Object.entries(positionReqs).map(([pos, req]) => {
              const current = selectedByPosition[pos] || 0;
              const complete = current === req;
              return (
                <div 
                  key={pos} 
                  className={`relative p-4 rounded-xl text-center transition-all duration-300 ${
                    complete 
                      ? 'bg-green-500/20 border-2 border-green-400 shadow-lg shadow-green-500/20' 
                      : 'bg-white/10 backdrop-blur-sm border border-white/20'
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wider mb-1">{pos}</div>
                  <div className="text-2xl font-bold">{current}<span className="text-sm opacity-60">/{req}</span></div>
                  {complete && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                      <span className="text-xs">✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Premium Action Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-xl border shadow-sm">
        <Button 
          onClick={handleOptimizeLineup} 
          disabled={optimizing || loading}
          size="lg"
          className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
        >
          <Sparkles className="w-5 h-5" />
          {optimizing ? 'Optimizing...' : 'AI Optimize Squad'}
        </Button>
        <Button 
          variant="outline" 
          onClick={loadPlayers}
          disabled={loading}
          size="lg"
          className="gap-2"
        >
          Refresh Players
        </Button>
        <Button
          variant="outline"
          size="lg"
          disabled={selectedPlayers.length === 0}
          onClick={() => setShowExport(true)}
          className="gap-2"
        >
          <Share2 className="w-4 h-4" />
          Export/Import
        </Button>
        
        {isLineupComplete && (
          <Button 
            size="lg"
            className="ml-auto gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
            onClick={() => onLineupComplete?.({ players: selectedPlayers, totalSalary, totalProjected })}
          >
            <Lock className="w-5 h-5" />
            Lock Lineup
          </Button>
        )}
      </div>

      {/* Player Pool - Premium Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur">
            <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-purple-500/5">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Available Players
              </h3>
              
              {/* Search & Filters */}
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 min-w-[200px] h-11 bg-background/50 border-primary/20 focus:border-primary"
                />
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="px-4 h-11 rounded-md border border-primary/20 bg-background/50 font-medium"
                >
                  <option value="all">All Positions</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 h-11 rounded-md border border-primary/20 bg-background/50 font-medium"
                >
                  <option value="projected">Top Projected</option>
                  <option value="salary">Highest Salary</option>
                  <option value="value">Best Value</option>
                </select>
              </div>
            </div>

            <div className="p-4 space-y-3 max-h-[700px] overflow-y-auto">
              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground font-medium">Loading elite players...</p>
                </div>
              ) : filteredPlayers.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">No players found</p>
                </div>
              ) : (
                filteredPlayers.map((player, idx) => {
                  const isSelected = selectedPlayers.some(p => p.id === player.id);
                  const value = (player.projected_points / player.salary * 1000).toFixed(1);
                  
                  return (
                    <Card 
                      key={player.id}
                      className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                        isSelected 
                          ? 'border-2 border-primary bg-gradient-to-r from-primary/10 to-purple-500/10 shadow-lg shadow-primary/20' 
                          : 'border hover:border-primary/50 bg-gradient-to-br from-card to-card/80'
                      }`}
                      onClick={() => togglePlayer(player)}
                    >
                      {/* Rank Badge */}
                      <div className="absolute top-2 left-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-lg z-10">
                        #{idx + 1}
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center z-10 animate-scale-in">
                          <Star className="w-5 h-5 text-white fill-white" />
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          {/* Research Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-12 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setResearchPlayer({ id: player.id, name: player.full_name });
                            }}
                          >
                            <Info className="w-4 h-4" />
                          </Button>

                          {/* Team Logo */}
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="text-white font-bold text-xs">{player.team.substring(0, 3).toUpperCase()}</span>
                          </div>

                          {/* Player Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="font-bold text-xs px-2 py-1">
                                {player.position}
                              </Badge>
                              {player.injury_status !== 'healthy' && (
                                <Badge variant="destructive" className="text-xs animate-pulse">
                                  {player.injury_status}
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors truncate">
                              {player.full_name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-muted-foreground font-medium">{player.team}</p>
                            </div>
                            
                            {/* Value Indicator */}
                            <div className="mt-3 flex items-center gap-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <TrendingUp className="w-3 h-3" />
                                <span>Value: {value}</span>
                              </div>
                              {player.ownership_percentage !== undefined && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="w-3 h-3" />
                                  <span>{player.ownership_percentage.toFixed(0)}% owned</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Stats Column */}
                          <div className="text-right space-y-2">
                            <div className="bg-gradient-to-br from-primary to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg">
                              <div className="text-xs font-medium opacity-90">Salary</div>
                              <div className="text-xl font-bold">{formatCurrency(player.salary)}</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg">
                              <div className="text-xs font-medium opacity-90">Projected</div>
                              <div className="text-xl font-bold">{player.projected_points.toFixed(1)} pts</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${isSelected ? 'opacity-100' : ''}`} />
                    </Card>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Selected Lineup - Premium Design */}
        <div>
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-card to-card/50 backdrop-blur sticky top-4 overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <h3 className="font-bold text-2xl mb-2 flex items-center gap-2">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                Your Squad
              </h3>
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-90">{selectedPlayers.length} / {Object.values(positionReqs).reduce((a, b) => a + b, 0)} players</span>
                <span className="font-bold">{formatCurrency(totalSalary)}</span>
              </div>
            </div>
            
            {/* Lineup List */}
            <div className="p-4">
              {selectedPlayers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                    <Users className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-muted-foreground font-medium">Select players to build<br />your winning squad</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {selectedPlayers.map((player, idx) => (
                    <div 
                      key={player.id} 
                      className="group relative p-4 rounded-xl bg-gradient-to-br from-card to-muted border border-border hover:border-primary/50 transition-all hover:shadow-lg"
                    >
                      {/* Position Badge */}
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-lg z-10">
                        {player.position}
                      </div>

                      <div className="pl-6 flex justify-between items-center gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {/* Team Logo */}
                          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-white font-bold text-[10px]">{player.team.substring(0, 2).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm mb-1 truncate group-hover:text-primary transition-colors">
                              {player.full_name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{player.team}</div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm font-bold bg-primary/10 px-2 py-1 rounded">
                            {formatCurrency(player.salary)}
                          </div>
                          <div className="text-xs font-semibold text-green-600 bg-green-500/10 px-2 py-1 rounded">
                            {player.projected_points.toFixed(1)} pts
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary Footer */}
            {selectedPlayers.length > 0 && (
              <div className="p-4 border-t bg-gradient-to-r from-primary/5 to-purple-500/5">
                <div className="flex justify-between items-center text-sm font-bold mb-2">
                  <span>Total Salary:</span>
                  <span className="text-lg">{formatCurrency(totalSalary)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Total Projected:</span>
                  <span className="text-lg text-green-600">{totalProjected.toFixed(1)} pts</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right sidebar with advanced features */}
        <div className="space-y-4">
          <MultiEntryManager
            maxEntries={3}
            currentLineup={selectedPlayers}
            totalSalary={totalSalary}
            salaryCap={SALARY_CAP}
          />

          <LateSwapPanel
            contestId={leagueId}
            lateSwapDeadline={new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()}
            currentLineup={selectedPlayers.map(p => ({ ...p, gameTime: new Date().toISOString() }))}
            onSwapPlayer={(oldId, newId) => {
              const newPlayers = selectedPlayers.filter(p => p.id !== oldId);
              setSelectedPlayers(newPlayers);
              toast.success("Ready to swap player");
            }}
          />

          <StackingSuggestions
            currentLineup={selectedPlayers}
            onApplyStack={(players) => {
              players.forEach(p => {
                const player = players.find(ap => ap.id === p.id);
                if (player) togglePlayer(player);
              });
            }}
          />
        </div>
      </div>

      {/* Modals */}
      {researchPlayer && (
        <PlayerResearchModal
          playerId={researchPlayer.id}
          playerName={researchPlayer.name}
          open={!!researchPlayer}
          onOpenChange={(open) => !open && setResearchPlayer(null)}
        />
      )}

      <LineupExportModal
        lineupId={leagueId}
        lineupData={selectedPlayers}
        open={showExport}
        onOpenChange={setShowExport}
      />
    </div>
  );
};
