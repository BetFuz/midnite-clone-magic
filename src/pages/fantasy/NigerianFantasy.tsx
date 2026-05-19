import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { 
  Trophy, Star, Users, Target, Zap, Award, 
  ShieldCheck, TrendingUp, Clock, Gift, Sparkles
} from "lucide-react";

interface Player {
  id: string;
  full_name: string;
  team: string;
  position: string;
  salary: number;
  projected_points: number;
  form_rating: number;
  club_id: string;
}

interface SquadPlayer extends Player {
  is_captain: boolean;
  is_vice_captain: boolean;
  in_starting_xi: boolean;
}

const SALARY_CAP = 100000000; // ₦100M
const SQUAD_SIZE = 15;
const POSITION_LIMITS = {
  GK: 2,
  DEF: 5,
  MID: 5,
  FWD: 3,
};
const CLUB_LIMIT = 3;

export default function NigerianFantasy() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [mySquad, setMySquad] = useState<SquadPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"price" | "points" | "form">("price");

  const totalSpent = mySquad.reduce((sum, p) => sum + p.salary, 0);
  const remaining = SALARY_CAP - totalSpent;
  const squadCount = mySquad.length;

  const positionCounts = mySquad.reduce((acc, p) => {
    acc[p.position] = (acc[p.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const clubCounts = mySquad.reduce((acc, p) => {
    acc[p.club_id] = (acc[p.club_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isSquadValid = squadCount === SQUAD_SIZE && 
    Object.entries(POSITION_LIMITS).every(([pos, limit]) => 
      (positionCounts[pos] || 0) === limit
    );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 md:ml-64 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            {/* Hero Header */}
            <Card className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Nigerian Fantasy Football</h1>
                    <p className="text-muted-foreground mb-2">Build your dream squad of Nigerian stars!</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        ₦100M Budget
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Target className="h-3 w-3" />
                        15 Players
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Max 3 per Club
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Budget Used</span>
                  <span className="font-bold">{formatCurrency(totalSpent)} / {formatCurrency(SALARY_CAP)}</span>
                </div>
                <Progress value={(totalSpent / SALARY_CAP) * 100} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining: {formatCurrency(remaining)}</span>
                  <span className="text-muted-foreground">Squad: {squadCount}/{SQUAD_SIZE}</span>
                </div>
              </div>
            </Card>

            {/* Prize Info */}
            <Card className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
              <div className="flex items-center gap-3">
                <Gift className="h-8 w-8 text-yellow-500" />
                <div className="flex-1">
                  <p className="font-semibold">Season Prizes</p>
                  <p className="text-sm text-muted-foreground">
                    🏆 Champion: Toyota Corolla + ₦5M • 🥇 Weekly Winner: ₦500k • 🎯 Top 20%: Share ₦10M Pool
                  </p>
                </div>
              </div>
            </Card>

            <Tabs defaultValue="players" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="players">Available Players</TabsTrigger>
                <TabsTrigger value="squad">
                  My Squad {squadCount > 0 && `(${squadCount})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="players" className="space-y-4">
                {/* Filters */}
                <Card className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      placeholder="Search players..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                      className="px-3 py-2 border rounded-md"
                      value={filterPosition}
                      onChange={(e) => setFilterPosition(e.target.value)}
                    >
                      <option value="all">All Positions</option>
                      <option value="GK">Goalkeepers</option>
                      <option value="DEF">Defenders</option>
                      <option value="MID">Midfielders</option>
                      <option value="FWD">Forwards</option>
                    </select>
                    <select
                      className="px-3 py-2 border rounded-md"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="price">Sort by Price</option>
                      <option value="points">Sort by Points</option>
                      <option value="form">Sort by Form</option>
                    </select>
                    <div className="text-sm text-muted-foreground self-center">
                      {filteredPlayers.length} players available
                    </div>
                  </div>
                </Card>

                {/* Player List */}
                <div className="grid gap-3">
                  {filteredPlayers.map((player) => {
                    const check = canAddPlayer(player);
                    return (
                      <Card key={player.id} className="p-4 hover:border-primary transition-colors">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                              player.position === 'FWD' ? 'bg-red-500' :
                              player.position === 'MID' ? 'bg-blue-500' :
                              player.position === 'DEF' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}>
                              {player.position}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold">{player.full_name}</p>
                                {player.form_rating >= 7 && (
                                  <Badge variant="secondary" className="gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    Hot Form
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{player.team}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold">{formatCurrency(player.salary)}</p>
                            <p className="text-sm text-muted-foreground">{player.projected_points} pts</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addToSquad(player)}
                            disabled={!check.allowed}
                            title={check.reason}
                          >
                            Add
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="squad" className="space-y-4">
                {mySquad.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Players Selected</h3>
                    <p className="text-muted-foreground mb-4">
                      Start building your squad from the Available Players tab
                    </p>
                  </Card>
                ) : (
                  <>
                    {/* Squad Summary */}
                    <Card className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(POSITION_LIMITS).map(([pos, limit]) => (
                          <div key={pos} className="text-center">
                            <p className="text-2xl font-bold">{positionCounts[pos] || 0}/{limit}</p>
                            <p className="text-sm text-muted-foreground">{pos}</p>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Squad Players */}
                    <div className="space-y-3">
                      {['GK', 'DEF', 'MID', 'FWD'].map(position => {
                        const posPlayers = mySquad.filter(p => p.position === position);
                        if (posPlayers.length === 0) return null;
                        
                        return (
                          <div key={position}>
                            <h3 className="font-semibold mb-2">{position}</h3>
                            <div className="grid gap-2">
                              {posPlayers.map(player => (
                                <Card key={player.id} className="p-3">
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="flex flex-col gap-1">
                                        {player.is_captain && (
                                          <Badge className="gap-1 bg-yellow-500">
                                            <Star className="h-3 w-3" />
                                            Captain
                                          </Badge>
                                        )}
                                        {player.is_vice_captain && (
                                          <Badge variant="outline" className="gap-1">
                                            <Star className="h-3 w-3" />
                                            Vice
                                          </Badge>
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-semibold">{player.full_name}</p>
                                        <p className="text-sm text-muted-foreground">{player.team}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold">{formatCurrency(player.salary)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      {!player.is_captain && (
                                        <Button size="sm" variant="outline" onClick={() => setCaptain(player.id)}>
                                          <Star className="h-4 w-4" />
                                        </Button>
                                      )}
                                      {!player.is_vice_captain && !player.is_captain && (
                                        <Button size="sm" variant="outline" onClick={() => setViceCaptain(player.id)}>
                                          VC
                                        </Button>
                                      )}
                                      <Button size="sm" variant="destructive" onClick={() => removeFromSquad(player.id)}>
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Submit Squad */}
                    {isSquadValid && (
                      <Card className="p-6 bg-success/10 border-success">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                              <Sparkles className="h-6 w-6 text-success" />
                              Squad Complete!
                            </h3>
                            <p className="text-muted-foreground">
                              Your team is ready. Make sure to set your captain and vice-captain.
                            </p>
                          </div>
                          <Button size="lg" className="gap-2">
                            <Trophy className="h-5 w-5" />
                            Enter League
                          </Button>
                        </div>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
