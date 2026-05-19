import { lazy, Suspense, useState, useCallback, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { useLeagueMatches } from "@/hooks/useLeagueMatches";
import { useLeagueScoreboard } from "@/hooks/useEspnScoreboard";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { BetSelection } from "@/contexts/BetSlipContext";
import { SGPLeg } from "@/components/basketball/NBAOddsRow";

const NBAFixtures  = lazy(() => import("@/components/basketball/NBAFixtures").then(m => ({ default: m.NBAFixtures })));
const NBAStandings = lazy(() => import("@/components/basketball/NBAStandings").then(m => ({ default: m.NBAStandings })));
const NBAStats     = lazy(() => import("@/components/basketball/NBAStats").then(m => ({ default: m.NBAStats })));

const TABS = ["fixtures", "standings", "stats"] as const;
type Tab = typeof TABS[number];

const TabFallback = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
    {[1,2,3,4].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
  </div>
);

const NBA = () => {
  const [tab, setTab] = useState<Tab>("fixtures");
  const [sgpMap, setSgpMap] = useState<Map<string, Set<string>>>(new Map());
  // Stores full SGPLeg objects per game so combined odds can be recomputed on each toggle
  const legStore = useRef<Map<string, Map<string, SGPLeg>>>(new Map());

  const { data: matches = [], isLoading, isError, refetch } = useLeagueMatches("NBA", 14);
  const { data: espnEvents = [] } = useLeagueScoreboard("NBA");
  const { addSelection, removeSelection } = useBetSlip();

  const liveCount = espnEvents.filter(e => e.status.type.name === "STATUS_IN_PROGRESS").length;

  const onSGPToggle = useCallback((gameId: string, leg: SGPLeg) => {
    if (!legStore.current.has(gameId)) legStore.current.set(gameId, new Map());
    const gameLegs = legStore.current.get(gameId)!;

    setSgpMap(prev => {
      const next = new Map(prev);
      const set = new Set(prev.get(gameId) ?? []);

      // Remove all existing BetSlip entries for this game
      removeSelection(`sgp-${gameId}`);
      for (const k of set) removeSelection(`${gameId}-single-${k}`);

      if (set.has(leg.key)) {
        set.delete(leg.key);
        gameLegs.delete(leg.key);
      } else {
        set.add(leg.key);
        gameLegs.set(leg.key, leg);
      }

      if (set.size === 0) {
        next.delete(gameId);
        legStore.current.delete(gameId);
      } else if (set.size === 1) {
        const singleLeg = gameLegs.get(Array.from(set)[0])!;
        const sel: BetSelection = {
          id: `${gameId}-single-${singleLeg.key}`,
          matchId: gameId,
          sport: "Basketball",
          league: "NBA",
          homeTeam: singleLeg.homeTeam,
          awayTeam: singleLeg.awayTeam,
          selectionType: singleLeg.key.startsWith("home") ? "home" : "away",
          selectionValue: singleLeg.label,
          odds: singleLeg.odds,
          matchTime: singleLeg.matchTime,
        };
        setTimeout(() => addSelection(sel), 0);
        next.set(gameId, set);
      } else {
        const allLegs = Array.from(gameLegs.values());
        const combinedOdds = parseFloat(allLegs.reduce((acc, l) => acc * l.odds, 1).toFixed(2));
        const first = allLegs[0];
        const sel: BetSelection = {
          id: `sgp-${gameId}`,
          matchId: gameId,
          sport: "Basketball",
          league: "NBA",
          homeTeam: first.homeTeam,
          awayTeam: first.awayTeam,
          selectionType: "other",
          selectionValue: `⚡ SGP ×${set.size} — ${first.homeTeam} vs ${first.awayTeam}`,
          odds: combinedOdds,
          matchTime: first.matchTime,
        };
        setTimeout(() => addSelection(sel), 0);
        next.set(gameId, set);
      }

      return next;
    });
  }, [addSelection, removeSelection]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">

          {/* Header banner */}
          <div className="bg-gradient-to-r from-blue-800 via-blue-900 to-red-900 px-4 md:px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-1.5 shrink-0">
                <img
                  src="https://a.espncdn.com/i/teamlogos/leagues/500/nba.png"
                  alt="NBA"
                  className="w-full h-full object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div>
                <h1 className="text-lg font-black text-white tracking-tight">NBA</h1>
                <p className="text-xs text-white/60">National Basketball Association</p>
              </div>
              <div className="ml-auto flex flex-col items-end gap-1">
                {liveCount > 0 && (
                  <Badge className="bg-red-500/30 text-red-300 border-red-500/40 text-[10px] gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    {liveCount} LIVE
                  </Badge>
                )}
                {matches.length > 0 && (
                  <Badge className="bg-white/10 text-white/80 border-white/20 text-[10px]">
                    {matches.length} upcoming
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-border bg-card sticky top-0 z-10">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-5 py-2.5 text-xs font-semibold transition-colors border-b-2 capitalize",
                  tab === t
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <Suspense fallback={<TabFallback />}>
            {tab === "fixtures" && (
              <NBAFixtures
                matches={matches}
                espnEvents={espnEvents}
                isLoading={isLoading}
                isError={isError}
                refetch={refetch}
                sgpMap={sgpMap}
                onSGPToggle={onSGPToggle}
              />
            )}
            {tab === "standings" && <NBAStandings />}
            {tab === "stats"     && <NBAStats />}
          </Suspense>

        </main>

        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default NBA;
