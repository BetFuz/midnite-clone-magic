import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { useF1Racing } from "@/hooks/useF1Racing";
import F1RaceVisuals from "@/components/F1RaceVisuals";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { Play, Flag, Wind, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const TEAM_COLORS: Record<string, string> = {
  "Red Bull Racing": "bg-blue-700",
  "Mercedes": "bg-cyan-500",
  "Ferrari": "bg-red-600",
  "McLaren": "bg-orange-500",
  "Aston Martin": "bg-emerald-600",
};

const F1Racing = () => {
  const circuit = "Monaco";

  const {
    drivers,
    scenario,
    commentary,
    raceState,
    currentLap,
    totalLaps,
    liveRaceState,
    isLoading,
    generateRaceScenario,
    startRace,
  } = useF1Racing(circuit);

  const { addSelection } = useBetSlip();

  const bet = (driverId: string, driverName: string, team: string, odds: number) => {
    addSelection({
      id: `f1-${circuit}-${driverId}-win`,
      matchId: `f1-${circuit}`,
      homeTeam: driverName,
      awayTeam: `${circuit} Grand Prix`,
      league: "Formula 1",
      sport: "Racing",
      selectionType: "home",
      selectionValue: `${driverName} to Win`,
      odds,
      matchTime: new Date().toISOString(),
    });
  };

  const visualDrivers = liveRaceState.racers.map(racer => {
    const driver = drivers.find(d => d.id === racer.id);
    return {
      id: racer.id,
      name: racer.name,
      team: driver?.team ?? "Unknown",
      color: ["#1E40AF", "#06B6D4", "#DC2626", "#EA580C", "#059669"][parseInt(racer.id) - 1] ?? "#6B7280",
      position: racer.position - 1,
      progress: racer.distance,
    };
  });

  const isPreRace = raceState === "pre-race";
  const isRacing = raceState === "racing";
  const isFinished = raceState === "finished";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">

          {/* Gradient header */}
          <div className="bg-gradient-to-r from-slate-800 to-red-900 px-4 md:px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏎️</span>
              <div className="flex-1">
                <h1 className="text-sm font-bold text-white">Formula 1 — {circuit} Grand Prix</h1>
                <p className="text-[11px] text-white/70">AI-Powered Race Simulation</p>
              </div>
              <Badge className={cn(
                "text-[10px] border-0",
                isPreRace ? "bg-green-500/20 text-green-300" :
                isRacing ? "bg-red-500/20 text-red-300 animate-pulse" :
                "bg-muted text-muted-foreground"
              )}>
                {isPreRace ? "Betting Open" : isRacing ? "LIVE" : "Finished"}
              </Badge>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-3 px-4 md:px-6 py-2 border-b border-border bg-card">
            {isRacing && (
              <>
                <Flag className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold">Lap {currentLap} / {totalLaps}</span>
                <Progress value={(currentLap / totalLaps) * 100} className="flex-1 h-1.5" />
              </>
            )}
            {isPreRace && (
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={generateRaceScenario}
                  disabled={isLoading}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Loading…" : "Race Conditions"}
                </button>
                <button
                  onClick={startRace}
                  className="flex items-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded transition-colors hover:bg-primary/90 active:scale-95"
                >
                  <Play className="w-3 h-3" /> Start Race
                </button>
              </div>
            )}
            {isFinished && (
              <span className="text-xs font-semibold text-muted-foreground">Race complete — checkered flag 🏁</span>
            )}
          </div>

          <div className="px-4 md:px-6 py-3 space-y-3">

            {/* Live race visuals */}
            {isRacing && liveRaceState.isRunning && visualDrivers.length > 0 && (
              <F1RaceVisuals
                currentLap={currentLap}
                totalLaps={totalLaps}
                drivers={visualDrivers}
                isRacing={isRacing}
              />
            )}

            {/* Commentary */}
            {commentary && (
              <div className="flex items-start gap-2 bg-muted/40 border border-border rounded-lg px-3 py-2">
                <Volume2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs italic text-muted-foreground">"{commentary}"</p>
              </div>
            )}

            {/* Race scenario */}
            {scenario && (
              <div className="bg-card border border-border rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-bold">Race Conditions</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{scenario.weather}</p>
                <p className="text-xs text-muted-foreground">{scenario.raceNarrative}</p>
              </div>
            )}

            {/* Driver cards */}
            <div className="space-y-2">
              {drivers.map(driver => {
                const liveDriver = liveRaceState.racers.find(r => r.id === driver.id);
                const position = liveDriver?.position;
                const hasCrashed = liveDriver?.hasCrashed;

                return (
                  <div
                    key={driver.id}
                    className={cn(
                      "border border-border rounded-lg overflow-hidden bg-card",
                      hasCrashed && "opacity-50"
                    )}
                  >
                    {/* Driver header */}
                    <div className="flex items-center gap-3 px-3 py-2.5 border-b border-border/40">
                      {/* Position badge */}
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {isRacing && position ? (
                          <span className="text-xs font-bold">P{position}</span>
                        ) : (
                          <span className="text-sm">🏎️</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate">{driver.name}</span>
                          {hasCrashed && <Badge className="bg-red-500/20 text-red-400 border-0 text-[9px] px-1">DNF</Badge>}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn("w-2 h-2 rounded-sm flex-shrink-0", TEAM_COLORS[driver.team] ?? "bg-muted")} />
                          <span className="text-[10px] text-muted-foreground">{driver.team}</span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-[9px] text-muted-foreground">Wins · Podiums</div>
                        <div className="text-xs font-semibold">{driver.stats.wins} · {driver.stats.podiums}</div>
                      </div>
                    </div>

                    {/* Bet row */}
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-[10px] text-muted-foreground">To Win</span>
                      <button
                        onClick={() => bet(driver.id, driver.name, driver.team, driver.odds)}
                        disabled={isRacing || isFinished}
                        className={cn(
                          "flex flex-col items-center justify-center w-[60px] h-9 rounded border transition-colors active:scale-95",
                          isPreRace
                            ? "bg-muted hover:bg-primary/10 hover:border-primary border-transparent"
                            : "bg-muted border-transparent opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span className="text-[9px] text-muted-foreground leading-none">WIN</span>
                        <span className="text-xs font-bold text-primary leading-tight tabular-nums">
                          {driver.odds.toFixed(2)}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </main>

        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default F1Racing;
