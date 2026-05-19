import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, RefreshCw, ChevronRight } from "lucide-react";
import { useLeagueMatches, Match } from "@/hooks/useLeagueMatches";
import { useLeagueScoreboard } from "@/hooks/useEspnScoreboard";
import { format } from "date-fns";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { cn } from "@/lib/utils";
import TeamBadge from "@/components/TeamBadge";
import { useNavigate } from "react-router-dom";
import { EspnEvent, ESPN_LEAGUES } from "@/lib/espn";

interface LeagueMatchScheduleProps {
  leagueName: string;
  daysAhead?: number;
}

function findEspnMatch(espnEvents: EspnEvent[], homeTeam: string, awayTeam: string): EspnEvent | undefined {
  const norm = (s: string) => s.toLowerCase().replace(/\s+(fc|afc|cf|sc)$/i, "").trim();
  const h = norm(homeTeam);
  const a = norm(awayTeam);
  return espnEvents.find(e => {
    const eh = norm(e.homeTeam.name);
    const ea = norm(e.awayTeam.name);
    return (eh.includes(h) || h.includes(eh)) && (ea.includes(a) || a.includes(ea));
  });
}

/* ── Odds button ─────────────────────────────────────────── */
const OddsBtn = ({ label, odds, onClick }: { label: string; odds: number; onClick: (e: React.MouseEvent) => void }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center w-[52px] h-9 rounded bg-muted hover:bg-primary/10 hover:border-primary border border-transparent transition-colors active:scale-95"
  >
    <span className="text-[9px] text-muted-foreground leading-none">{label}</span>
    <span className="text-xs font-bold text-primary leading-tight tabular-nums">{odds.toFixed(2)}</span>
  </button>
);

/* ── Match row ───────────────────────────────────────────── */
const MatchRow = ({ match, espnEvent, leagueName }: { match: Match; espnEvent?: EspnEvent; leagueName: string }) => {
  const { addSelection } = useBetSlip();
  const navigate = useNavigate();

  const isLive = espnEvent?.status.type.name === "STATUS_IN_PROGRESS";
  const isFinished = espnEvent?.status.type.completed;
  const clock = espnEvent?.status.displayClock;

  const bet = (e: React.MouseEvent, type: "home" | "draw" | "away", odds: number, val: string) => {
    e.stopPropagation();
    addSelection({
      id: `${match.match_id}-${type}`,
      matchId: match.match_id,
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      league: match.league_name,
      sport: match.sport_title,
      selectionType: type,
      selectionValue: val,
      odds,
      matchTime: match.commence_time,
    });
  };

  const openDetail = () => {
    if (espnEvent) {
      navigate(`/match/${espnEvent.id}?league=${encodeURIComponent(leagueName)}&espn=1`);
    } else {
      navigate(`/match/${match.match_id}?home=${encodeURIComponent(match.home_team)}&away=${encodeURIComponent(match.away_team)}&league=${encodeURIComponent(leagueName)}`);
    }
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40 last:border-0 hover:bg-primary/5 transition-colors cursor-pointer group"
      onClick={openDetail}
    >
      {/* Teams */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1.5">
          {isLive ? (
            <>
              <Badge className="text-[8px] px-1 py-0 bg-red-500 text-white animate-pulse border-0 leading-tight">LIVE</Badge>
              <span className="text-red-400 font-medium">{clock}&apos;</span>
            </>
          ) : isFinished ? (
            <span className="text-muted-foreground/60">FT</span>
          ) : (
            <span>{format(new Date(match.commence_time), "EEE d MMM · HH:mm")}</span>
          )}
        </p>
        <div className="flex items-center gap-2 mb-0.5">
          <TeamBadge name={match.home_team} size={24} />
          <p className="text-xs font-semibold truncate leading-tight flex-1">{match.home_team}</p>
          {(isLive || isFinished) && espnEvent && (
            <span className={cn("text-sm font-bold tabular-nums", isLive && "text-yellow-400")}>
              {espnEvent.homeTeam.score ?? "0"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TeamBadge name={match.away_team} size={24} />
          <p className="text-xs text-muted-foreground truncate leading-tight flex-1">{match.away_team}</p>
          {(isLive || isFinished) && espnEvent && (
            <span className={cn("text-sm font-bold tabular-nums text-muted-foreground", isLive && "text-yellow-400")}>
              {espnEvent.awayTeam.score ?? "0"}
            </span>
          )}
        </div>
      </div>

      {/* Odds */}
      <div className="flex gap-1 flex-shrink-0 items-center">
        {match.home_odds != null && (
          <OddsBtn label="1" odds={match.home_odds} onClick={(e) => bet(e as any, "home", match.home_odds!, "Home Win")} />
        )}
        {match.draw_odds != null && (
          <OddsBtn label="X" odds={match.draw_odds} onClick={(e) => bet(e as any, "draw", match.draw_odds!, "Draw")} />
        )}
        {match.away_odds != null && (
          <OddsBtn label="2" odds={match.away_odds} onClick={(e) => bet(e as any, "away", match.away_odds!, "Away Win")} />
        )}
        {!match.home_odds && !match.draw_odds && !match.away_odds && (
          <span className="text-[10px] text-muted-foreground w-[52px] text-center self-center">TBC</span>
        )}
        <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary/50 ml-0.5 transition-colors" />
      </div>
    </div>
  );
};

/* ── Main component ──────────────────────────────────────── */
export const LeagueMatchSchedule = ({ leagueName, daysAhead = 7 }: LeagueMatchScheduleProps) => {
  const { data: matches = [], isLoading, isError, refetch } = useLeagueMatches(leagueName, daysAhead);
  const { data: espnEvents = [] } = useLeagueScoreboard(leagueName);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center py-12 gap-3 text-center">
        <p className="text-sm text-muted-foreground">Could not load fixtures</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 rounded px-3 py-1.5 hover:bg-primary/10"
        >
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No upcoming matches in the next {daysAhead} days
        </p>
      </div>
    );
  }

  const grouped = matches.reduce<Record<string, { label: string; matches: Match[] }>>((acc, m) => {
    const d = new Date(m.commence_time);
    const key = format(d, "yyyy-MM-dd");
    if (!acc[key]) {
      const diff = Math.floor((d.getTime() - Date.now()) / 86400000);
      const label = diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : format(d, "EEE d MMM yyyy");
      acc[key] = { label, matches: [] };
    }
    acc[key].matches.push(m);
    return acc;
  }, {});

  return (
    <div>
      {Object.entries(grouped).map(([key, group]) => (
        <div key={key} className="mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Calendar className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{group.label}</span>
            <span className={cn(
              "text-[10px] text-muted-foreground/60",
              group.label === "Today" && "text-primary/70"
            )}>
              · {group.matches.length} match{group.matches.length !== 1 ? "es" : ""}
            </span>
          </div>
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            {group.matches.map(m => (
              <MatchRow
                key={m.id}
                match={m}
                leagueName={leagueName}
                espnEvent={findEspnMatch(espnEvents, m.home_team, m.away_team)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
