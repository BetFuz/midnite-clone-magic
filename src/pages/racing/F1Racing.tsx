import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { useF1Racing } from "@/hooks/useF1Racing";
import { useRacingBetting, RaceParticipant } from "@/hooks/useRacingBetting";
import { Loader2, Trophy, Play, Flag, Wind } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

const F1Racing = () => {
  const circuit = "Monaco";
  const { 
    drivers, 
    scenario, 
    commentary, 
    raceVideo, 
    heroImage, 
    isLoading: isF1Loading, 
    raceState: f1RaceState,
    currentLap,
    totalLaps,
    generateRaceScenario,
    startRace: startF1Race
  } = useF1Racing(circuit);

  const [stakes, setStakes] = useState<Record<string, number>>({});

  const participants: RaceParticipant[] = drivers.map(d => ({
    id: d.id,
    name: `${d.name} (${d.team})`,
    odds: d.odds,
    stats: {
      wins: d.stats.wins,
      races: d.stats.wins + d.stats.podiums,
      winRate: `${((d.stats.wins / (d.stats.wins + d.stats.podiums)) * 100).toFixed(1)}%`
    }
  }));

  const { raceState, winner, balance, placeBet, startRace, isPlacingBet } = useRacingBetting({
    raceType: 'F1 Racing',
    raceId: `f1-${circuit.toLowerCase()}-001`,
    participants
  });

  const handleBetClick = (participant: RaceParticipant) => {
    const stake = stakes[participant.id] || 1000;
    
    if (raceState === 'pre-race') {
      placeBet({
        participantId: participant.id,
        participantName: participant.name,
        betType: 'win',
        odds: participant.odds,
        stake
      });
    }
  };

  const handleStartRace = async () => {
    await startF1Race();
    startRace();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <h1 className="text-4xl font-bold mb-2">🏎️ Formula 1 Racing</h1>
          <p className="text-muted-foreground mb-6">AI-Powered Grand Prix Simulation - {circuit}</p>

          <div className="mb-6">
            {isF1Loading && !heroImage ? (
              <div className="h-[400px] flex items-center justify-center bg-card border border-border rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : heroImage ? (
              <img 
                src={heroImage} 
                alt="F1 Racing" 
                className="w-full h-[400px] object-cover rounded-lg"
              />
            ) : null}
          </div>

          {raceVideo && (
            <Card className="p-6 mb-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Play className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Race Highlights</h2>
              </div>
              <video src={raceVideo} controls className="w-full rounded-lg" />
            </Card>
          )}

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Badge variant={raceState === 'pre-race' ? 'default' : raceState === 'racing' ? 'destructive' : 'secondary'}>
                {raceState === 'pre-race' ? 'Pre-Race Betting Open' : raceState === 'racing' ? 'Race In Progress' : 'Race Finished'}
              </Badge>
              {f1RaceState === 'racing' && (
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  <span className="font-semibold">Lap {currentLap}/{totalLaps}</span>
                </div>
              )}
            </div>
            <div className="text-lg font-semibold">Balance: ₦{balance.toLocaleString()}</div>
            {raceState === 'pre-race' && (
              <div className="flex gap-2">
                <Button onClick={generateRaceScenario} variant="outline" disabled={isF1Loading}>
                  Generate Scenario
                </Button>
                <Button onClick={handleStartRace} className="gap-2">
                  <Play className="h-4 w-4" />
                  Start Race
                </Button>
              </div>
            )}
          </div>

          {f1RaceState === 'racing' && (
            <Card className="p-6 mb-6 bg-card border-border">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Race Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round((currentLap / totalLaps) * 100)}%</span>
                  </div>
                  <Progress value={(currentLap / totalLaps) * 100} />
                </div>
                
                {commentary && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm italic">&quot;{commentary}&quot;</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {scenario && (
            <Card className="p-6 mb-6 bg-card border-border">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Wind className="h-5 w-5" />
                Race Conditions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Weather</h4>
                  <p className="text-sm text-muted-foreground">{scenario.weather}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tire Strategies</h4>
                  <p className="text-sm text-muted-foreground">{scenario.tireStrategies?.join(', ')}</p>
                </div>
                {scenario.raceNarrative && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold mb-2">Race Narrative</h4>
                    <p className="text-sm text-muted-foreground">{scenario.raceNarrative}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {participants.map((participant, idx) => {
              const driver = drivers[idx];
              return (
                <Card key={participant.id} className="p-6 bg-card border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">{driver.name}</h3>
                        <Badge variant="outline">{driver.team}</Badge>
                        {winner === participant.id && (
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {driver.stats.wins} wins • {driver.stats.podiums} podiums • {driver.stats.championships} championships
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">Odds</div>
                        <div className="text-2xl font-bold text-primary">{participant.odds.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                  
                  {raceState === 'pre-race' && (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Stake"
                        value={stakes[participant.id] || 1000}
                        onChange={(e) => setStakes({ ...stakes, [participant.id]: Number(e.target.value) })}
                        className="w-32"
                        min={100}
                        step={100}
                      />
                      <Button
                        onClick={() => handleBetClick(participant)}
                        disabled={isPlacingBet}
                        className="flex-1"
                      >
                        Bet on {driver.name}
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default F1Racing;
