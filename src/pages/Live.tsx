import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { api } from "@/lib/api/client";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, ChevronRight, Tv2 } from "lucide-react";
import { cn } from "@/lib/utils";
import TeamBadge from "@/components/TeamBadge";
import { LEAGUE_LOGOS } from "@/utils/teamLogos";
import { fetchAllLive, EspnEvent, ESPN_LEAGUES } from "@/lib/espn";

/* ── Unified event shape ─────────────────────────────────── */
interface LiveEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | string;
  awayScore: number | string;
  minute: string;
  sport: string;
  league: string;
  home_odds?: number | null;
  draw_odds?: number | null;
  away_odds?: number | null;
  espnId?: string;
  espnLeague?: string;
}

const REVERSE_LEAGUES: Record<string, string> = Object.fromEntries(
  Object.entries(ESPN_LEAGUES).map(([name, slug]) => [slug, name])
);

function espnToLive(ev: EspnEvent): LiveEvent {
  return {
    id: `espn-${ev.id}`,
    homeTeam: ev.homeTeam.name,
    awayTeam: ev.awayTeam.name,
    homeScore: ev.homeTeam.score ?? 0,
    awayScore: ev.awayTeam.score ?? 0,
    minute: ev.status.displayClock ?? "",
    sport: "Football",
    league: REVERSE_LEAGUES[ev.leagueSlug] ?? ev.leagueName,
    espnId: ev.id,
    espnLeague: ev.leagueSlug,
  };
}

const SPORT_TABS = ["All", "Football", "Basketball", "Tennis", "MMA", "Cricket"];
const SPORT_EMOJI: Record<string, string> = {
  Football: "⚽", Basketball: "🏀", Tennis: "🎾",
  MMA: "🥊", Cricket: "🏏", Other: "🎯",
};

/* ── Odds button ─────────────────────────────────────────── */
const OddsBtn = ({ label, odds, onClick }: { label: string; odds: number; onClick: (e: React.MouseEvent) => void }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center w-[50px] h-10 rounded-lg bg-muted hover:bg-primary/15 hover:border-primary border border-transparent transition-all active:scale-95"
  >
    <span className="text-[9px] text-muted-foreground leading-none">{label}</span>
    <span className="text-xs font-bold text-primary leading-snug tabular-nums">{odds.toFixed(2)}</span>
  </button>
);

/* ── Live row — SportyBet style ──────────────────────────── */
const LiveRow = ({ event }: { event: LiveEvent }) => {
  const { addSelection } = useBetSlip();
  const navigate = useNavigate();

  const bet = (e: React.MouseEvent, type: "home" | "draw" | "away", odds: number, val: string) => {
    e.stopPropagation();
    addSelection({
      id: `live-${event.id}-${type}`,
      matchId: event.id,
      homeTeam: event.homeTeam,
      awayTeam: event.awayTeam,
      league: event.league,
      sport: event.sport,
      selectionType: type,
      selectionValue: val,
      odds,
      matchTime: new Date().toISOString(),
    });
  };

  const openDetail = () => {
    if (event.espnId && event.espnLeague) {
      navigate(`/match/${event.espnId}?league=${encodeURIComponent(event.league)}&espn=1`);
    } else {
      navigate(`/match/${event.id}?home=${encodeURIComponent(event.homeTeam)}&away=${encodeURIComponent(event.awayTeam)}&league=${encodeURIComponent(event.league)}`);
    }
  };

  const hasOdds = event.home_odds || event.draw_odds || event.away_odds;

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 border-b border-border/40 last:border-0 hover:bg-primary/5 transition-colors cursor-pointer group"
      onClick={openDetail}
    >
      {/* Live pulse + minute */}
      <div className="flex flex-col items-center gap-0.5 w-8 shrink-0">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
        </span>
        <span className="text-[9px] text-red-400 font-bold tabular-nums leading-none">{event.minute}'</span>
      </div>

      {/* Teams + logos */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-1.5">
          <TeamBadge name={event.homeTeam} size={20} />
          <span className="text-xs font-semibold truncate leading-tight flex-1">{event.homeTeam}</span>
          <span className="text-sm font-black text-yellow-400 tabular-nums shrink-0">{event.homeScore}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TeamBadge name={event.awayTeam} size={20} />
          <span className="text-xs text-muted-foreground truncate leading-tight flex-1">{event.awayTeam}</span>
          <span className="text-sm font-black text-yellow-400/80 tabular-nums shrink-0">{event.awayScore}</span>
        </div>
      </div>

      {/* Odds */}
      <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
        {hasOdds ? (
          <>
            {event.home_odds != null && <OddsBtn label="1" odds={event.home_odds} onClick={e => bet(e, "home", event.home_odds!, "Home Win")} />}
            {event.draw_odds != null && <OddsBtn label="X" odds={event.draw_odds} onClick={e => bet(e, "draw", event.draw_odds!, "Draw")} />}
            {event.away_odds != null && <OddsBtn label="2" odds={event.away_odds} onClick={e => bet(e, "away", event.away_odds!, "Away Win")} />}
          </>
        ) : (
          <button
            onClick={openDetail}
            className="text-[10px] text-primary border border-primary/30 rounded px-2 py-1 hover:bg-primary/10 transition-colors"
          >
            View
          </button>
        )}
        <ChevronRight className="w-3 h-3 text-muted-foreground/20 group-hover:text-primary/50 self-center transition-colors" />
      </div>
    </div>
  );
};

/* ── League section with logo ────────────────────────────── */
const LeagueSection = ({ league, events }: { league: string; events: LiveEvent[] }) => {
  const logo = LEAGUE_LOGOS[league];
  return (
    <div>
      {/* League header */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 border-b border-border/40">
        {logo
          ? <img src={logo} alt={league} className="w-4 h-4 object-contain shrink-0" />
          : <span className="w-4 h-4 rounded-full bg-primary/20 shrink-0" />
        }
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate flex-1">
          {league}
        </span>
        <Badge className="bg-red-500/15 text-red-400 border-red-500/20 text-[9px] px-1.5 py-0 shrink-0">
          {events.length} LIVE
        </Badge>
      </div>
      {events.map(ev => <LiveRow key={ev.id} event={ev} />)}
    </div>
  );
};

/* ── Sport section ───────────────────────────────────────── */
const SportSection = ({ sport, events }: { sport: string; events: LiveEvent[] }) => {
  const byLeague = events.reduce<Record<string, LiveEvent[]>>((acc, ev) => {
    (acc[ev.league || "Other"] ??= []).push(ev);
    return acc;
  }, {});

  return (
    <div className="mb-2 border border-border rounded-xl overflow-hidden bg-card">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border-b border-border/60">
        <span className="text-sm">{SPORT_EMOJI[sport] ?? "🎯"}</span>
        <span className="text-xs font-bold flex-1">{sport}</span>
        <span className="text-[10px] bg-red-500/15 text-red-400 rounded-full px-1.5 py-0.5 font-bold">
          {events.length}
        </span>
      </div>
      {Object.entries(byLeague).map(([league, leagueEvents]) => (
        <LeagueSection key={league} league={league} events={leagueEvents} />
      ))}
    </div>
  );
};

/* ── Page ────────────────────────────────────────────────── */
const Live = () => {
  const [activeSport, setActiveSport] = useState("All");

  /* DB live events */
  const { data: dbEvents = [], isLoading: dbLoading } = useQuery<LiveEvent[]>({
    queryKey: ["live-events"],
    queryFn: async () => {
      const { data } = await api.get("/sports/events/live", { params: { limit: 100 } });
      return data.data ?? data.events ?? [];
    },
    refetchInterval: 20_000,
    staleTime: 10_000,
  });

  /* ESPN live events — always shown */
  const { data: espnEvents = [], isLoading: espnLoading } = useQuery<LiveEvent[]>({
    queryKey: ["espn-live-all"],
    queryFn: async () => (await fetchAllLive()).map(espnToLive),
    refetchInterval: 30_000,
    staleTime: 20_000,
    placeholderData: [],
  });

  const isLoading = dbLoading && espnLoading;

  /* Merge, dedupe by team names */
  const seen = new Set<string>();
  const events: LiveEvent[] = [];
  for (const ev of [...dbEvents, ...espnEvents]) {
    const key = `${ev.homeTeam}|${ev.awayTeam}`.toLowerCase();
    if (!seen.has(key)) { seen.add(key); events.push(ev); }
  }

  const filtered = activeSport === "All"
    ? events
    : events.filter(e => e.sport?.toLowerCase().includes(activeSport.toLowerCase()));

  const bySport = filtered.reduce<Record<string, LiveEvent[]>>((acc, ev) => {
    (acc[ev.sport || "Other"] ??= []).push(ev);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />
        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">

          {/* Red header banner */}
          <div className="bg-gradient-to-r from-red-700 to-rose-900 px-4 md:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              <Activity className="w-4 h-4 text-white" />
              <h1 className="text-sm font-bold text-white">Live Betting</h1>
              {events.length > 0 && (
                <Badge className="bg-white/20 text-white text-[10px] px-1.5 border-white/30">
                  {events.length} live
                </Badge>
              )}
            </div>
          </div>

          {/* Sport filter tabs */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-border bg-card sticky top-0 z-10">
            {SPORT_TABS.map(sport => {
              const count = sport === "All" ? events.length
                : events.filter(e => e.sport?.toLowerCase().includes(sport.toLowerCase())).length;
              return (
                <button
                  key={sport}
                  onClick={() => setActiveSport(sport)}
                  className={cn(
                    "flex items-center gap-1 shrink-0 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 whitespace-nowrap",
                    activeSport === sport
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {sport !== "All" && <span className="text-sm">{SPORT_EMOJI[sport] ?? "🎯"}</span>}
                  {sport}
                  {count > 0 && (
                    <span className={cn(
                      "text-[9px] rounded-full px-1.5 py-0.5 font-bold",
                      activeSport === sport
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="px-3 md:px-4 py-3">
            {isLoading && (
              <div className="space-y-2">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
              </div>
            )}

            {!isLoading && events.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                  <Tv2 className="w-7 h-7 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-semibold">No live events right now</p>
                <p className="text-xs text-muted-foreground">Check back soon — matches update every 30s</p>
              </div>
            )}

            {!isLoading && filtered.length === 0 && events.length > 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                <p className="text-sm text-muted-foreground">No live {activeSport} events</p>
                <button onClick={() => setActiveSport("All")} className="text-xs text-primary underline">
                  Show all sports
                </button>
              </div>
            )}

            {!isLoading && Object.entries(bySport).map(([sport, sportEvents]) => (
              <SportSection key={sport} sport={sport} events={sportEvents} />
            ))}
          </div>
        </main>

        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Live;
