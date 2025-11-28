import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, TrendingUp, TrendingDown, Shield, Target, Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/currency";

interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  price: number;
  points: number;
  form: number;
  selected: boolean;
  stats: {
    goals?: number;
    assists?: number;
    cleanSheets?: number;
    saves?: number;
  };
}

interface PlayerDraftInterfaceProps {
  leagueId: string;
  sport: string;
  budget: number;
  onTeamComplete: (players: Player[]) => void;
}

export function PlayerDraftInterface({ leagueId, sport, budget, onTeamComplete }: PlayerDraftInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("ALL");
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [remainingBudget, setRemainingBudget] = useState(budget);

  // Mock player data - in production, fetch from API based on upcoming matches
  const allPlayers: Player[] = [
    { id: "1", name: "Victor Osimhen", team: "Napoli", position: "FWD", price: 12000, points: 245, form: 8.9, selected: false, stats: { goals: 26, assists: 5 } },
    { id: "2", name: "Mohamed Salah", team: "Liverpool", position: "FWD", price: 13000, points: 287, form: 9.2, selected: false, stats: { goals: 30, assists: 16 } },
    { id: "3", name: "Kevin De Bruyne", team: "Man City", position: "MID", price: 12500, points: 276, form: 8.7, selected: false, stats: { goals: 12, assists: 25 } },
    { id: "4", name: "Bukayo Saka", team: "Arsenal", position: "MID", price: 9500, points: 234, form: 8.4, selected: false, stats: { goals: 15, assists: 11 } },
    { id: "5", name: "Virgil van Dijk", team: "Liverpool", position: "DEF", price: 7000, points: 198, form: 7.8, selected: false, stats: { goals: 3, cleanSheets: 20 } },
    { id: "6", name: "William Saliba", team: "Arsenal", position: "DEF", price: 6500, points: 187, form: 7.9, selected: false, stats: { goals: 2, cleanSheets: 18 } },
    { id: "7", name: "Ederson", team: "Man City", position: "GK", price: 6000, points: 176, form: 7.5, selected: false, stats: { saves: 98, cleanSheets: 16 } },
    { id: "8", name: "Alisson", team: "Liverpool", position: "GK", price: 6000, points: 182, form: 7.7, selected: false, stats: { saves: 105, cleanSheets: 17 } },
    { id: "9", name: "Erling Haaland", team: "Man City", position: "FWD", price: 14000, points: 312, form: 9.8, selected: false, stats: { goals: 36, assists: 8 } },
    { id: "10", name: "Bruno Fernandes", team: "Man United", position: "MID", price: 10000, points: 246, form: 8.2, selected: false, stats: { goals: 18, assists: 14 } },
  ];

  const positions = ["ALL", "GK", "DEF", "MID", "FWD"];
  
  const teamRequirements = {
    GK: { min: 1, max: 1 },
    DEF: { min: 3, max: 5 },
    MID: { min: 3, max: 5 },
    FWD: { min: 1, max: 3 },
  };

  const filteredPlayers = allPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         player.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = selectedPosition === "ALL" || player.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  const getPositionCount = (position: string) => {
    return selectedPlayers.filter(p => p.position === position).length;
  };

  const canSelectPlayer = (player: Player) => {
    if (player.price > remainingBudget) return false;
    const posCount = getPositionCount(player.position);
    const req = teamRequirements[player.position as keyof typeof teamRequirements];
    return posCount < req.max;
  };

  const handleSelectPlayer = (player: Player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      // Deselect
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
      setRemainingBudget(remainingBudget + player.price);
    } else if (canSelectPlayer(player)) {
      // Select
      setSelectedPlayers([...selectedPlayers, { ...player, selected: true }]);
      setRemainingBudget(remainingBudget - player.price);
    }
  };

  const isTeamComplete = () => {
    return (
      getPositionCount("GK") >= teamRequirements.GK.min &&
      getPositionCount("DEF") >= teamRequirements.DEF.min &&
      getPositionCount("MID") >= teamRequirements.MID.min &&
      getPositionCount("FWD") >= teamRequirements.FWD.min &&
      selectedPlayers.length === 11
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Player Pool */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players or teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {positions.map(pos => (
                <Button
                  key={pos}
                  variant={selectedPosition === pos ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPosition(pos)}
                >
                  {pos}
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filteredPlayers.map(player => {
                const isSelected = selectedPlayers.find(p => p.id === player.id);
                const canSelect = canSelectPlayer(player);

                return (
                  <Card
                    key={player.id}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 
                      !canSelect ? 'opacity-50 cursor-not-allowed' : 
                      'hover:border-primary/50'
                    }`}
                    onClick={() => canSelect || isSelected ? handleSelectPlayer(player) : null}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          player.position === 'GK' ? 'bg-yellow-500/20 text-yellow-500' :
                          player.position === 'DEF' ? 'bg-blue-500/20 text-blue-500' :
                          player.position === 'MID' ? 'bg-green-500/20 text-green-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {player.position}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{player.name}</h4>
                            {isSelected && <Star className="h-4 w-4 fill-primary text-primary" />}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              {player.team}
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              Form: {player.form}
                            </span>
                            {player.stats.goals !== undefined && (
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {player.stats.goals}G {player.stats.assists}A
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(player.price)}</p>
                        <p className="text-sm text-muted-foreground">{player.points} pts</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Selected Squad */}
      <div className="space-y-4">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Your Squad</h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Remaining Budget</span>
              <span className={`font-bold ${remainingBudget < 0 ? 'text-red-500' : 'text-green-500'}`}>
                {formatCurrency(remainingBudget)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Players</span>
              <span className="font-bold">{selectedPlayers.length}/11</span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {Object.entries(teamRequirements).map(([pos, req]) => {
              const count = getPositionCount(pos);
              const isMet = count >= req.min;
              
              return (
                <div key={pos} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Badge variant={isMet ? "default" : "secondary"}>{pos}</Badge>
                    <span className="text-sm">{count}/{req.min}</span>
                  </div>
                  {isMet ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-warning" />
                  )}
                </div>
              );
            })}
          </div>

          <ScrollArea className="h-[300px] mb-4">
            <div className="space-y-2">
              {selectedPlayers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Select 11 players to build your team
                </p>
              ) : (
                selectedPlayers.map(player => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{player.position}</Badge>
                      <span className="text-sm font-medium">{player.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPlayer(player);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <Button
            className="w-full"
            size="lg"
            disabled={!isTeamComplete()}
            onClick={() => onTeamComplete(selectedPlayers)}
          >
            {isTeamComplete() ? "Confirm Team" : "Complete Your Squad"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
