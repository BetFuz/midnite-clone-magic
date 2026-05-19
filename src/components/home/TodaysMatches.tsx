import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api/client";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, BarChart2, Clock } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import TeamBadge from "@/components/TeamBadge";
import { LEAGUE_LOGOS } from "@/utils/teamLogos";

interface FixtureMatch {
  id: string;
  match_id: string;
  sport_key: string;
  sport_title: string;
  league_name: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  home_odds: number | null;
  draw_odds: number | null;
  away_odds: number | null;
  status: string;
}

const MAIN_LEAGUES = [
  { name: "Premier League",   url: "/football/premier-league",    emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "Champions League", url: "/football/champions-league",  emoji: "⭐" },
  { name: "La Liga",          url: "/football/la-liga",           emoji: "🇪🇸" },
  { name: "Serie A",          url: "/football/serie-a",           emoji: "🇮🇹" },
  { name: "Bundesliga",       url: "/football/bundesliga",        emoji: "🇩🇪" },
  { name: "Ligue 1",          url: "/football/ligue-1",           emoji: "🇫🇷" },
  { name: "Europa League",    url: "/football/europa-league",     emoji: "🟠" },
  { name: "NBA",              url: "/basketball/nba",             emoji: "🏀" },
  { name: "MMA",              url: "/sports/mma",                 emoji: "🥊" },
];

const formatMatchTime = (iso: string) => {
  const d = new Date(iso);
  if (isToday(d)) return `Today ${format(d, "HH:mm")}`;
  if (isTomorrow(d)) return `Tomorrow ${format(d, "HH:mm")}`;
  return format(d, "EEE d MMM HH:mm");
};

interface MatchRowProps { match: FixtureMatch; leagueName: string }

const MatchRow = ({ match, leagueName }: MatchRowProps) => {
  const { addSelection } = useBetSlip();
  const navigate = useNavigate();
  const isLive = match.status === "LIVE";

  const bet = (e: React.MouseEvent, type: "home" | "draw" | "away", odds: number, val: string) => {
    e.stopPropagation();
    addSelection({
      id: `${match.id}-${type}`,
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

  return (
    <div
      className="flex items-center gap-2 py-2 border-b border-border/40 last:border-0 hover:bg-primary/5 transition-colors cursor-pointer group px-3"
      onClick={() => navigate(`/match/${match.match_id}?home=${encodeURIComponent(match.home_team)}&away=${encodeURIComponent(match.away_team)}&league=${encodeURIComponent(leagueName)}`)}
    >
      {/* Time / Status */}
      <div className="w-12 shrink-0 flex flex-col items-center gap-0.5">
        {isLive ? (
          <Badge className="text-[8px] px-1 py-0 bg-red-500 text-white animate-pulse border-0 leading-tight">LIVE</Badge>
        ) : (
          <span className="text-[10px] text-muted-foreground font-mono leading-tight">
            {format(new Date(match.commence_time), "HH:mm")}
          </span>
        )}
        <span className="text-[9px] text-muted-foreground/50 leading-tight">
          {isToday(new Date(match.commence_time)) ? "Today" : isTomorrow(new Date(match.commence_time)) ? "Tmrw" : format(new Date(match.commence_time), "d MMM")}
        </span>
      </div>

      {/* Teams + logos */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-1.5">
          <TeamBadge name={match.home_team} size={18} />
          <span className="text-xs font-semibold truncate leading-tight">{match.home_team}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TeamBadge name={match.away_team} size={18} />
          <span className="text-xs text-muted-foreground truncate leading-tight">{match.away_team}</span>
        </div>
      </div>

      {/* Odds */}
      <div className="flex gap-1 shrink-0 items-center" onClick={e => e.stopPropagation()}>
        {match.home_odds ? (
          <>
            <button onClick={e => bet(e, "home", match.home_odds!, "Home Win")}
              className="flex flex-col items-center w-[46px] h-9 rounded bg-muted hover:bg-primary/10 hover:border-primary border border-transparent transition-colors">
              <span className="text-[9px] text-muted-foreground leading-none pt-1">1</span>
              <span className="text-xs font-bold text-primary tabular-nums">{match.home_odds.toFixed(2)}</span>
            </button>
            {match.draw_odds && (
              <button onClick={e => bet(e, "draw", match.draw_odds!, "Draw")}
                className="flex flex-col items-center w-[46px] h-9 rounded bg-muted hover:bg-primary/10 hover:border-primary border border-transparent transition-colors">
                <span className="text-[9px] text-muted-foreground leading-none pt-1">X</span>
                <span className="text-xs font-bold text-primary tabular-nums">{match.draw_odds.toFixed(2)}</span>
              </button>
            )}
            {match.away_odds && (
              <button onClick={e => bet(e, "away", match.away_odds!, "Away Win")}
                className="flex flex-col items-center w-[46px] h-9 rounded bg-muted hover:bg-primary/10 hover:border-primary border border-transparent transition-colors">
                <span className="text-[9px] text-muted-foreground leading-none pt-1">2</span>
                <span className="text-xs font-bold text-primary tabular-nums">{match.away_odds.toFixed(2)}</span>
              </button>
            )}
          </>
        ) : (
          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
            <BarChart2 className="w-3 h-3" /> TBC
          </span>
        )}
        <ChevronRight className="w-3 h-3 text-muted-foreground/20 group-hover:text-primary/40 transition-colors" />
      </div>
    </div>
  );
};

interface LeagueSectionProps { league: typeof MAIN_LEAGUES[0] }

const LeagueSection = ({ league }: LeagueSectionProps) => {
  const [showAll, setShowAll] = useState(false);
  const { data: matches = [], isLoading } = useQuery<FixtureMatch[]>({
    queryKey: ["home-fixtures", league.name],
    queryFn: async () => {
      const { data } = await api.get("/sports/fixtures", { params: { league: league.name, days: 7 } });
      return data.data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) return (
    <div className="bg-card rounded-xl border border-border p-3 mb-2">
      <Skeleton className="h-5 w-40 mb-3" />
      {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full mb-1" />)}
    </div>
  );

  if (!matches.length) return null;

  const visible = showAll ? matches : matches.slice(0, 4);

  return (
    <div className="bg-card rounded-xl border border-border p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <Link to={league.url} className="flex items-center gap-2 hover:text-primary transition-colors">
          {LEAGUE_LOGOS[league.name] ? (
            <img src={LEAGUE_LOGOS[league.name]} alt={league.name} className="w-5 h-5 object-contain" />
          ) : (
            <span className="text-base">{league.emoji}</span>
          )}
          <span className="text-sm font-bold">{league.name}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{matches.length}</Badge>
        </Link>
        <Link to={league.url} className="text-xs text-primary flex items-center hover:underline">
          All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div>
        {visible.map(m => <MatchRow key={m.id} match={m} leagueName={league.name} />)}
      </div>

      {matches.length > 4 && (
        <button
          onClick={() => setShowAll(s => !s)}
          className="w-full text-center text-xs text-primary mt-2 py-1.5 hover:bg-primary/5 rounded transition-colors"
        >
          {showAll ? "Show Less ↑" : `+${matches.length - 4} more matches`}
        </button>
      )}
    </div>
  );
};

export const TodaysMatches = () => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Upcoming Matches
        </h2>
        <Link to="/sports/football" className="text-xs text-primary hover:underline flex items-center gap-0.5">
          All Sports <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      {MAIN_LEAGUES.map(league => (
        <LeagueSection key={league.name} league={league} />
      ))}
    </div>
  );
};
