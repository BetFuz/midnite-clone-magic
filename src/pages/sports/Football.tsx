import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { api } from "@/lib/api/client";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2, ChevronRight, Lock } from "lucide-react";
import { format, isToday, isTomorrow, addDays, startOfDay, endOfDay } from "date-fns";
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

const DATE_TABS = [
  { label: "Live",      value: "live" },
  { label: "Today",     value: "today" },
  { label: "Tomorrow",  value: "tomorrow" },
  { label: "This Week", value: "week" },
];

const LEAGUE_META: Record<string, { emoji: string; country: string; url: string }> = {
  "Premier League":               { emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", country: "England",      url: "/football/premier-league" },
  "Champions League":             { emoji: "⭐",          country: "Europe",       url: "/football/champions-league" },
  "La Liga":                      { emoji: "🇪🇸",          country: "Spain",        url: "/football/la-liga" },
  "Serie A":                      { emoji: "🇮🇹",          country: "Italy",        url: "/football/serie-a" },
  "Bundesliga":                   { emoji: "🇩🇪",          country: "Germany",      url: "/football/bundesliga" },
  "Ligue 1":                      { emoji: "🇫🇷",          country: "France",       url: "/football/ligue-1" },
  "Europa League":                { emoji: "🟠",           country: "Europe",       url: "/football/europa-league" },
  "Championship":                 { emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", country: "England",      url: "/football/championship" },
  "CAF Champions League":         { emoji: "🌍",           country: "Africa",       url: "/football/caf-champions-league" },
  "African Cup of Nations":       { emoji: "🌍",           country: "Africa",       url: "/football/afcon" },
  "Egyptian Premier League":      { emoji: "🇪🇬",          country: "Egypt",        url: "/football/egyptian-premier-league" },
  "South African Premier League": { emoji: "🇿🇦",          country: "South Africa", url: "/football/south-african-premier-league" },
};

const LEAGUES = Object.keys(LEAGUE_META);

const formatMatchTime = (iso: string) => {
  const d = new Date(iso);
  if (isToday(d))    return format(d, "HH:mm");
  if (isTomorrow(d)) return `Tomorrow ${format(d, "HH:mm")}`;
  return format(d, "EEE d MMM HH:mm");
};

/* ── League logo from centralised LEAGUE_LOGOS map ──────────── */
const LeagueLogo = ({ name, emoji }: { name: string; emoji: string }) => {
  const [err, setErr] = useState(false);
  const url = LEAGUE_LOGOS[name];
  if (url && !err) {
    return (
      <img
        src={url}
        alt={name}
        className="w-5 h-5 object-contain flex-shrink-0"
        onError={() => setErr(true)}
      />
    );
  }
  return <span className="text-sm flex-shrink-0">{emoji}</span>;
};

/* ── Single match row — Sportybet-style ──────────────────────── */
interface MatchRowProps { match: FixtureMatch }

const MatchRow = ({ match }: MatchRowProps) => {
  const { addSelection } = useBetSlip();
  const hasOdds = match.home_odds || match.draw_odds || match.away_odds;

  const bet = (type: "home" | "draw" | "away", odds: number, val: string) =>
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

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
      {/* Time */}
      <div className="w-[38px] flex-shrink-0 text-center">
        <span className="text-[10px] text-muted-foreground leading-tight block">
          {format(new Date(match.commence_time), "HH:mm")}
        </span>
        {match.status === "LIVE" && (
          <span className="text-[9px] font-bold text-red-500 animate-pulse">LIVE</span>
        )}
      </div>

      {/* Teams */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-[4px]">
          <TeamBadge name={match.home_team} size={22} />
          <span className="text-[11px] font-medium truncate leading-tight">{match.home_team}</span>
        </div>
        <div className="flex items-center gap-2">
          <TeamBadge name={match.away_team} size={22} />
          <span className="text-[11px] text-muted-foreground truncate leading-tight">{match.away_team}</span>
        </div>
      </div>

      {/* Odds */}
      {hasOdds ? (
        <div className="flex gap-[3px] flex-shrink-0">
          {(["home", "draw", "away"] as const).map((type, i) => {
            const odds = type === "home" ? match.home_odds : type === "draw" ? match.draw_odds : match.away_odds;
            const label = ["1", "X", "2"][i];
            const val = ["Home Win", "Draw", "Away Win"][i];
            if (!odds) return (
              <div key={type} className="w-[46px] h-[34px] flex items-center justify-center rounded bg-muted/30 border border-border/30">
                <span className="text-[9px] text-muted-foreground/50">-</span>
              </div>
            );
            return (
              <button
                key={type}
                onClick={() => bet(type, odds, val)}
                className="w-[46px] h-[34px] flex flex-col items-center justify-center rounded bg-muted hover:bg-primary/15 hover:border-primary border border-border/60 transition-all active:scale-95"
              >
                <span className="text-[8px] text-muted-foreground leading-none mb-0.5">{label}</span>
                <span className="text-[11px] font-bold text-primary leading-none tabular-nums">{odds.toFixed(2)}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex-shrink-0 w-[144px] flex items-center justify-center gap-1 text-[10px] text-muted-foreground/60">
          <BarChart2 className="w-3 h-3" /> TBC
        </div>
      )}
    </div>
  );
};

/* ── League section ──────────────────────────────────────────── */
const LeagueSection = ({ leagueName, dateFilter }: { leagueName: string; dateFilter: string }) => {
  const [showAll, setShowAll] = useState(false);
  const meta = LEAGUE_META[leagueName] ?? {
    emoji: "⚽",
    country: "",
    url: `/football/${leagueName.toLowerCase().replace(/\s+/g, "-")}`,
  };

  const { data: allMatches = [], isLoading } = useQuery<FixtureMatch[]>({
    queryKey: ["football-fixtures", leagueName],
    queryFn: async () => {
      const { data } = await api.get("/sports/fixtures", { params: { league: leagueName, days: 14 } });
      return data.data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const now = new Date();
  const matches = allMatches.filter(m => {
    const t = new Date(m.commence_time);
    if (dateFilter === "live")     return m.status === "LIVE";
    if (dateFilter === "today")    return isToday(t);
    if (dateFilter === "tomorrow") return isTomorrow(t);
    if (dateFilter === "week")     return t >= startOfDay(now) && t <= endOfDay(addDays(now, 7));
    return true;
  });

  if (isLoading) return (
    <div className="bg-card rounded-xl border border-border overflow-hidden mb-2">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="h-3 w-32" />
      </div>
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-[52px] w-full border-b border-border/30" />)}
    </div>
  );

  if (!matches.length) return null;

  const visible = showAll ? matches : matches.slice(0, 5);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden mb-2">
      {/* League header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-b border-border/50">
        <Link to={meta.url} className="flex items-center gap-2 hover:text-primary transition-colors min-w-0">
          <LeagueLogo name={leagueName} emoji={meta.emoji} />
          <span className="text-[11px] font-bold truncate">{leagueName}</span>
          {meta.country && (
            <span className="text-[10px] text-muted-foreground flex-shrink-0">{meta.country}</span>
          )}
          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 flex-shrink-0">{matches.length}</Badge>
        </Link>
        <Link to={meta.url} className="flex items-center gap-0.5 text-[10px] text-primary hover:underline flex-shrink-0 ml-2">
          All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Odds column headers */}
      <div className="flex items-center gap-2 px-3 py-1 border-b border-border/30 bg-muted/10">
        <div className="flex-1" />
        <div className="flex gap-[3px] flex-shrink-0">
          {["1", "X", "2"].map(l => (
            <div key={l} className="w-[46px] text-center text-[9px] text-muted-foreground/70 font-medium">{l}</div>
          ))}
        </div>
      </div>

      {/* Match rows */}
      {visible.map(m => <MatchRow key={m.id} match={m} />)}

      {matches.length > 5 && (
        <button
          onClick={() => setShowAll(s => !s)}
          className="w-full text-center text-[11px] text-primary py-2 hover:bg-primary/5 transition-colors border-t border-border/30"
        >
          {showAll ? "Show less ↑" : `+${matches.length - 5} more matches`}
        </button>
      )}
    </div>
  );
};

/* ── Page ────────────────────────────────────────────────────── */
const Football = () => {
  const [dateFilter, setDateFilter] = useState("today");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          {/* Sport header */}
          <div className="bg-gradient-to-r from-green-700 to-emerald-800 px-4 py-2.5 flex items-center gap-2">
            <span className="text-lg">⚽</span>
            <h1 className="text-sm font-bold text-white">Football</h1>
          </div>

          {/* Date tabs */}
          <div className="flex border-b border-border bg-card sticky top-0 z-10">
            {DATE_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setDateFilter(tab.value)}
                className={`flex-1 text-[11px] font-semibold py-2.5 transition-colors border-b-2 ${
                  dateFilter === tab.value
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.value === "live" && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1 mb-0.5" />
                )}
                {tab.label}
              </button>
            ))}
          </div>

          {/* League list */}
          <div className="px-3 py-2">
            {LEAGUES.map(league => (
              <LeagueSection key={league} leagueName={league} dateFilter={dateFilter} />
            ))}
          </div>
        </main>

        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Football;
