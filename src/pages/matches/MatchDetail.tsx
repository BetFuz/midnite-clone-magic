import { useParams, useSearchParams } from "react-router-dom";
import { useEspnMatchDetail, useEspnEventByTeams } from "@/hooks/useEspnMatchDetail";
import { EspnMatchDetail, EspnEvent, ESPN_LEAGUES } from "@/lib/espn";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Goal, CreditCard, ArrowLeftRight, Play, Users, BarChart2, MessageSquare, ChevronLeft, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── Status helpers ─────────────────────────────────────── */
function statusColor(name: string) {
  if (name === "STATUS_IN_PROGRESS") return "bg-red-500";
  if (name === "STATUS_FINAL" || name === "STATUS_FULL_TIME") return "bg-zinc-500";
  return "bg-blue-500";
}

function statusLabel(ev: EspnEvent) {
  const n = ev.status.type.name;
  if (n === "STATUS_IN_PROGRESS") return `${ev.status.displayClock}'`;
  if (n === "STATUS_FINAL" || n === "STATUS_FULL_TIME") return "FT";
  if (n === "STATUS_HALFTIME") return "HT";
  return ev.status.type.description;
}

/* ─── Score header ───────────────────────────────────────── */
function ScoreHeader({ event }: { event: EspnEvent }) {
  const isLive = event.status.type.name === "STATUS_IN_PROGRESS";
  const isHT = event.status.type.name === "STATUS_HALFTIME";

  return (
    <div className="bg-gradient-to-b from-zinc-900 to-zinc-800 rounded-xl p-5 mb-4 text-white">
      <div className="flex justify-center mb-2">
        <Badge className={cn("text-[10px] font-bold px-2", statusColor(event.status.type.name), isLive && "animate-pulse")}>
          {statusLabel(event)}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Home */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <img
            src={event.homeTeam.logo}
            alt={event.homeTeam.name}
            className="w-14 h-14 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <p className="text-sm font-bold text-center leading-tight">{event.homeTeam.name}</p>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-1 min-w-[100px]">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black tabular-nums">{event.homeTeam.score ?? "–"}</span>
            <span className="text-2xl text-zinc-400">:</span>
            <span className="text-4xl font-black tabular-nums">{event.awayTeam.score ?? "–"}</span>
          </div>
          {(isHT) && <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Half Time</span>}
        </div>

        {/* Away */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <img
            src={event.awayTeam.logo}
            alt={event.awayTeam.name}
            className="w-14 h-14 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <p className="text-sm font-bold text-center leading-tight">{event.awayTeam.name}</p>
        </div>
      </div>

      {event.venue && (
        <p className="text-center text-[10px] text-zinc-400 mt-3">📍 {event.venue}</p>
      )}
    </div>
  );
}

/* ─── Match timeline (goals/cards/subs) ─────────────────── */
const EVENT_ICONS: Record<string, React.ReactNode> = {
  "57": <Goal className="w-3.5 h-3.5 text-yellow-400" />,       // goal
  "58": <Goal className="w-3.5 h-3.5 text-yellow-400" />,       // own goal
  "51": <CreditCard className="w-3.5 h-3.5 text-yellow-400" />, // yellow card
  "55": <CreditCard className="w-3.5 h-3.5 text-red-500" />,    // red card
  "53": <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />, // sub
};

function Timeline({ detail }: { detail: EspnMatchDetail }) {
  const key = (p: typeof detail.plays[0]) => p.type.id;
  const keyPlays = detail.plays.filter(p =>
    detail.plays.length < 50
      ? true
      : ["57","58","51","55","53"].includes(key(p)) || p.scoringPlay
  );

  if (!keyPlays.length) {
    return <p className="text-center text-sm text-muted-foreground py-8">No match events yet</p>;
  }

  const homeId = detail.event.homeTeam.id;

  return (
    <div className="space-y-1.5">
      {[...keyPlays].reverse().map((play) => {
        const isHome = play.team?.id === homeId;
        const icon = EVENT_ICONS[play.type.id];
        return (
          <div
            key={play.id}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
              play.scoringPlay ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-muted/30"
            )}
          >
            <span className="text-[11px] text-muted-foreground w-8 text-right shrink-0 font-mono">
              {play.clock.displayValue}&apos;
            </span>
            {icon && <span className="shrink-0">{icon}</span>}
            <span className={cn(
              "flex-1 text-xs leading-snug",
              isHome ? "text-foreground" : "text-muted-foreground"
            )}>
              {play.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Stats bars ─────────────────────────────────────────── */
const SHOWN_STATS = [
  "possessionPct", "shotsTotalAttempts", "shotsOnTarget", "corners",
  "fouls", "offsides", "saves", "yellowCards", "redCards",
];
const STAT_LABELS: Record<string, string> = {
  possessionPct: "Possession %",
  shotsTotalAttempts: "Total Shots",
  shotsOnTarget: "Shots on Target",
  corners: "Corners",
  fouls: "Fouls",
  offsides: "Offsides",
  saves: "Saves",
  yellowCards: "Yellow Cards",
  redCards: "Red Cards",
};

function StatBar({ label, home, away }: { label: string; home: string; away: string }) {
  const h = parseFloat(home) || 0;
  const a = parseFloat(away) || 0;
  const total = h + a || 1;
  const homePct = (h / total) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-bold text-primary">{home}</span>
        <span className="text-muted-foreground text-[11px]">{label}</span>
        <span className="font-bold text-muted-foreground">{away}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-muted">
        <div className="bg-primary rounded-l-full" style={{ width: `${homePct}%` }} />
        <div className="bg-muted-foreground/40 rounded-r-full flex-1" />
      </div>
    </div>
  );
}

function Stats({ detail }: { detail: EspnMatchDetail }) {
  const shown = detail.stats.filter(s => SHOWN_STATS.includes(s.name));
  if (!shown.length) {
    return <p className="text-center text-sm text-muted-foreground py-8">Stats not yet available</p>;
  }
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-[11px] font-bold text-muted-foreground px-1 mb-2">
        <span className="text-primary">{detail.event.homeTeam.abbreviation}</span>
        <span>{detail.event.awayTeam.abbreviation}</span>
      </div>
      {shown.map(s => (
        <StatBar
          key={s.name}
          label={STAT_LABELS[s.name] ?? s.name}
          home={s.homeValue}
          away={s.awayValue}
        />
      ))}
    </div>
  );
}

/* ─── Lineup ─────────────────────────────────────────────── */
function LineupSide({ roster, teamName, logo }: {
  roster: EspnMatchDetail["homeRoster"];
  teamName: string;
  logo: string;
}) {
  const starters = roster.filter(r => r.starter);
  const bench = roster.filter(r => !r.starter);
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <img src={logo} alt={teamName} className="w-6 h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        <span className="text-xs font-bold truncate">{teamName}</span>
      </div>
      <div className="space-y-0.5">
        {starters.map(r => (
          <div key={r.athlete.id} className="flex items-center gap-2 py-1 border-b border-border/30 last:border-0">
            <span className="text-[10px] text-muted-foreground w-5 text-right shrink-0">{r.athlete.jersey}</span>
            <span className="text-xs flex-1 truncate">{r.athlete.displayName}</span>
            <span className="text-[9px] text-muted-foreground/60 shrink-0">{r.athlete.position}</span>
            {r.subbedOut && <ArrowLeftRight className="w-2.5 h-2.5 text-red-400 shrink-0" />}
          </div>
        ))}
        {bench.length > 0 && (
          <>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest pt-2 pb-1">Bench</p>
            {bench.slice(0, 7).map(r => (
              <div key={r.athlete.id} className="flex items-center gap-2 py-0.5">
                <span className="text-[10px] text-muted-foreground w-5 text-right shrink-0">{r.athlete.jersey}</span>
                <span className="text-xs text-muted-foreground flex-1 truncate">{r.athlete.displayName}</span>
                {r.subbedIn && <ArrowLeftRight className="w-2.5 h-2.5 text-green-400 shrink-0" />}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function Lineups({ detail }: { detail: EspnMatchDetail }) {
  if (!detail.homeRoster.length && !detail.awayRoster.length) {
    return <p className="text-center text-sm text-muted-foreground py-8">Lineups not yet available</p>;
  }
  return (
    <div className="flex gap-4">
      <LineupSide roster={detail.homeRoster} teamName={detail.event.homeTeam.name} logo={detail.event.homeTeam.logo} />
      <div className="w-px bg-border shrink-0" />
      <LineupSide roster={detail.awayRoster} teamName={detail.event.awayTeam.name} logo={detail.event.awayTeam.logo} />
    </div>
  );
}

/* ─── Videos/Highlights ──────────────────────────────────── */
function Highlights({ detail }: { detail: EspnMatchDetail }) {
  if (!detail.videos.length) {
    return (
      <div className="flex flex-col items-center py-10 gap-3 text-center">
        <Play className="w-10 h-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Highlights will appear here after the match</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {detail.videos.map((v, i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-border bg-card">
          {v.thumbnail && (
            <div className="relative">
              <img src={v.thumbnail} alt={v.headline} className="w-full aspect-video object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <a
                  href={v.links?.source?.href ?? v.links?.mobile?.href ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white/90 hover:bg-white rounded-full p-3 transition-transform hover:scale-110"
                >
                  <Play className="w-6 h-6 text-black fill-black" />
                </a>
              </div>
            </div>
          )}
          <div className="p-3">
            <p className="text-sm font-semibold">{v.headline}</p>
            {v.duration > 0 && (
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.floor(v.duration / 60)}:{String(v.duration % 60).padStart(2, "0")}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Betting markets ────────────────────────────────────── */
function Markets({ homeTeam, awayTeam, matchId, league }: {
  homeTeam: string; awayTeam: string; matchId: string; league: string;
}) {
  const { addSelection } = useBetSlip();
  const markets = [
    { label: `${homeTeam} Win`, type: "home" as const, odds: 2.10 },
    { label: "Draw", type: "draw" as const, odds: 3.30 },
    { label: `${awayTeam} Win`, type: "away" as const, odds: 3.60 },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {markets.map(m => (
          <button
            key={m.type}
            onClick={() => addSelection({
              id: `${matchId}-${m.type}`,
              matchId,
              homeTeam,
              awayTeam,
              league,
              sport: "Football",
              selectionType: m.type,
              selectionValue: m.label,
              odds: m.odds,
              matchTime: new Date().toISOString(),
            })}
            className="flex flex-col items-center justify-center h-16 rounded-lg bg-card hover:bg-primary/10 border border-border hover:border-primary transition-all active:scale-95"
          >
            <span className="text-[10px] text-muted-foreground">{m.label}</span>
            <span className="text-xl font-black text-primary tabular-nums">{m.odds.toFixed(2)}</span>
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {[
          ["Both Teams to Score", "1.85"],
          ["Over 2.5 Goals", "1.75"],
          ["Under 2.5 Goals", "2.05"],
          ["1st Half – Home Win", "2.90"],
          ["Correct Score 1-0", "6.50"],
          ["Anytime Goalscorer", "View →"],
        ].map(([label, val]) => (
          <div key={label} className="flex justify-between items-center px-4 py-2.5 rounded-lg bg-card border border-border hover:border-primary/40 cursor-pointer transition-colors">
            <span className="text-sm">{label}</span>
            <span className="text-sm font-bold text-primary">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Loading skeleton ───────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-44 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="space-y-2">
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────── */
const MatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const isEspn = params.get("espn") === "1";
  const leagueName = params.get("league") ?? "Premier League";
  const leagueSlug = ESPN_LEAGUES[leagueName] ?? "eng.1";
  const homeTeamParam = params.get("home") ?? "";
  const awayTeamParam = params.get("away") ?? "";

  // Direct ESPN event ID
  const directDetail = useEspnMatchDetail(isEspn ? leagueSlug : "", isEspn ? (id ?? "") : "");
  // Or lookup by team names
  const foundEvent = useEspnEventByTeams(!isEspn ? leagueName : "", homeTeamParam, awayTeamParam);
  const lookupDetail = useEspnMatchDetail(
    !isEspn && foundEvent.data ? leagueSlug : "",
    foundEvent.data?.id ?? ""
  );

  const detail: EspnMatchDetail | null | undefined = isEspn ? directDetail.data : lookupDetail.data;
  const isLoading = isEspn ? directDetail.isLoading : (foundEvent.isLoading || lookupDetail.isLoading);

  const homeTeam = detail?.event.homeTeam.name ?? homeTeamParam;
  const awayTeam = detail?.event.awayTeam.name ?? awayTeamParam;
  const matchId = id ?? "unknown";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-3 md:p-4 overflow-y-auto h-[calc(100vh-4rem)]">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>

          {isLoading ? (
            <LoadingSkeleton />
          ) : detail ? (
            <>
              <ScoreHeader event={detail.event} />

              <Tabs defaultValue="timeline" className="mb-6">
                <TabsList className="w-full grid grid-cols-5 bg-muted/50 h-9">
                  {[
                    { value: "timeline", icon: <Clock className="w-3 h-3" />, label: "Events" },
                    { value: "stats", icon: <BarChart2 className="w-3 h-3" />, label: "Stats" },
                    { value: "lineup", icon: <Users className="w-3 h-3" />, label: "Lineup" },
                    { value: "highlights", icon: <Play className="w-3 h-3" />, label: "Video" },
                    { value: "markets", icon: <MessageSquare className="w-3 h-3" />, label: "Bet" },
                  ].map(t => (
                    <TabsTrigger
                      key={t.value}
                      value={t.value}
                      className="flex items-center gap-1 text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-1"
                    >
                      {t.icon} <span className="hidden sm:inline">{t.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="timeline" className="mt-3">
                  <Timeline detail={detail} />
                </TabsContent>
                <TabsContent value="stats" className="mt-3">
                  <Stats detail={detail} />
                </TabsContent>
                <TabsContent value="lineup" className="mt-3">
                  <Lineups detail={detail} />
                </TabsContent>
                <TabsContent value="highlights" className="mt-3">
                  <Highlights detail={detail} />
                </TabsContent>
                <TabsContent value="markets" className="mt-3">
                  <Markets
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    matchId={matchId}
                    league={leagueName}
                  />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            /* Fallback: ESPN data unavailable — show basic detail */
            <div className="space-y-4">
              <div className="bg-gradient-to-b from-zinc-900 to-zinc-800 rounded-xl p-5 text-white text-center">
                <p className="text-xs text-zinc-400 mb-3">{leagueName}</p>
                <div className="flex items-center justify-center gap-8 mb-2">
                  <span className="font-bold text-lg">{homeTeam || "Home"}</span>
                  <span className="text-3xl font-black text-zinc-400">vs</span>
                  <span className="font-bold text-lg">{awayTeam || "Away"}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">Live data will appear once the match starts</p>
              </div>
              <Markets
                homeTeam={homeTeam || "Home"}
                awayTeam={awayTeam || "Away"}
                matchId={matchId}
                league={leagueName}
              />
            </div>
          )}
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default MatchDetail;
