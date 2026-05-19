import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { useLeagueMatches, Match } from "@/hooks/useLeagueMatches";
import { Trophy, Calendar, RefreshCw, Star } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

/* ── Tabs ────────────────────────────────────────────────── */
const TABS = ["Fixtures", "Knockout", "Clubs", "History"] as const;
type Tab = typeof TABS[number];

/* ── Logo URLs (API-Football CDN) ────────────────────────── */
const UEL_LOGO = "https://media.api-sports.io/football/leagues/3.png";

const TEAM_LOGOS: Record<string, string> = {
  "Manchester United":   "https://media.api-sports.io/football/teams/33.png",
  "Roma":                "https://media.api-sports.io/football/teams/497.png",
  "Porto":               "https://media.api-sports.io/football/teams/212.png",
  "Eintracht Frankfurt": "https://media.api-sports.io/football/teams/169.png",
  "Ajax":                "https://media.api-sports.io/football/teams/194.png",
  "Athletic Club":       "https://media.api-sports.io/football/teams/531.png",
  "Lyon":                "https://media.api-sports.io/football/teams/80.png",
  "Tottenham":           "https://media.api-sports.io/football/teams/47.png",
  "Braga":               "https://media.api-sports.io/football/teams/228.png",
  "Galatasaray":         "https://media.api-sports.io/football/teams/357.png",
  "Villarreal":          "https://media.api-sports.io/football/teams/533.png",
  "Sevilla":             "https://media.api-sports.io/football/teams/536.png",
  "Juventus":            "https://media.api-sports.io/football/teams/496.png",
  "Inter Milan":         "https://media.api-sports.io/football/teams/505.png",
  "Liverpool":           "https://media.api-sports.io/football/teams/40.png",
  "Atlético Madrid":     "https://media.api-sports.io/football/teams/530.png",
  "Atalanta":            "https://media.api-sports.io/football/teams/499.png",
  "Bayer Leverkusen":    "https://media.api-sports.io/football/teams/168.png",
  "Chelsea":             "https://media.api-sports.io/football/teams/49.png",
  "Arsenal":             "https://media.api-sports.io/football/teams/42.png",
  "Rangers":             "https://media.api-sports.io/football/teams/39.png",
  "Marseille":           "https://media.api-sports.io/football/teams/81.png",
};

/* ── Team badge with fallback ────────────────────────────── */
const TeamBadge = ({ name, size = 28, flag }: { name: string; size?: number; flag?: string }) => {
  const logo = TEAM_LOGOS[name];
  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        width={size}
        height={size}
        className="object-contain flex-shrink-0"
        style={{ width: size, height: size }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  return <span className="flex-shrink-0" style={{ fontSize: size * 0.75 }}>{flag ?? "⚽"}</span>;
};

/* ── Static fixtures ─────────────────────────────────────── */
const STATIC_FIXTURES: Match[] = [
  // ── QF 2nd Leg · 24 Apr 2026 ──────────────────────────────
  { id: "uel-qf2-1", match_id: "uel-qf2-1", sport_key: "soccer", sport_title: "Football",
    league_name: "Europa League", home_team: "Manchester United", away_team: "Lyon",
    commence_time: "2026-04-24T20:00:00Z", home_odds: 1.75, draw_odds: 3.60, away_odds: 4.50, status: "upcoming" },
  { id: "uel-qf2-2", match_id: "uel-qf2-2", sport_key: "soccer", sport_title: "Football",
    league_name: "Europa League", home_team: "Roma", away_team: "Athletic Club",
    commence_time: "2026-04-24T17:45:00Z", home_odds: 1.90, draw_odds: 3.40, away_odds: 4.20, status: "upcoming" },
  { id: "uel-qf2-3", match_id: "uel-qf2-3", sport_key: "soccer", sport_title: "Football",
    league_name: "Europa League", home_team: "Ajax", away_team: "Porto",
    commence_time: "2026-04-24T17:45:00Z", home_odds: 2.10, draw_odds: 3.30, away_odds: 3.40, status: "upcoming" },
  { id: "uel-qf2-4", match_id: "uel-qf2-4", sport_key: "soccer", sport_title: "Football",
    league_name: "Europa League", home_team: "Eintracht Frankfurt", away_team: "Tottenham",
    commence_time: "2026-04-24T20:00:00Z", home_odds: 2.20, draw_odds: 3.20, away_odds: 3.20, status: "upcoming" },

  // ── Semi-Finals 1st Leg · 7 May 2026 ──────────────────────
  { id: "uel-sf1-1", match_id: "uel-sf1-1", sport_key: "soccer", sport_title: "Football",
    league_name: "Europa League", home_team: "Manchester United", away_team: "Roma",
    commence_time: "2026-05-07T20:00:00Z", home_odds: 1.85, draw_odds: 3.40, away_odds: 4.20, status: "upcoming" },
  { id: "uel-sf1-2", match_id: "uel-sf1-2", sport_key: "soccer", sport_title: "Football",
    league_name: "Europa League", home_team: "Porto", away_team: "Eintracht Frankfurt",
    commence_time: "2026-05-07T20:00:00Z", home_odds: 2.05, draw_odds: 3.30, away_odds: 3.50, status: "upcoming" },

  // ── Semi-Finals 2nd Leg · 14 May 2026 ─────────────────────
  { id: "uel-sf2-1", match_id: "uel-sf2-1", sport_key: "soccer", sport_title: "Football",
    league_name: "Europa League", home_team: "Roma", away_team: "Manchester United",
    commence_time: "2026-05-14T20:00:00Z", home_odds: 2.00, draw_odds: 3.30, away_odds: 3.60, status: "upcoming" },
  { id: "uel-sf2-2", match_id: "uel-sf2-2", sport_key: "soccer", sport_title: "Football",
    league_name: "Europa League", home_team: "Eintracht Frankfurt", away_team: "Porto",
    commence_time: "2026-05-14T20:00:00Z", home_odds: 1.95, draw_odds: 3.30, away_odds: 3.80, status: "upcoming" },

  // ── Final · 20 May 2026 · San Mamés, Bilbao ───────────────
  { id: "uel-final", match_id: "uel-final", sport_key: "soccer", sport_title: "Football",
    league_name: "Europa League", home_team: "Manchester United", away_team: "Porto",
    commence_time: "2026-05-20T20:00:00Z", home_odds: 2.00, draw_odds: 3.50, away_odds: 3.60, status: "upcoming" },
];

/* ── Knockout bracket ────────────────────────────────────── */
const BRACKET = [
  {
    round: "Quarter-Finals",
    icon: "⚽",
    ties: [
      { home: "Manchester United", homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", homeScore: "2", away: "Lyon",       awayFlag: "🇫🇷", awayScore: "1", leg: "1st", status: "played" },
      { home: "Lyon",              homeFlag: "🇫🇷", homeScore: "-", away: "Manchester United", awayFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", awayScore: "-", leg: "2nd", status: "upcoming" },
      { home: "Roma",              homeFlag: "🇮🇹", homeScore: "3", away: "Athletic Club", awayFlag: "🇪🇸", awayScore: "1", leg: "1st", status: "played" },
      { home: "Athletic Club",     homeFlag: "🇪🇸", homeScore: "-", away: "Roma",          awayFlag: "🇮🇹", awayScore: "-", leg: "2nd", status: "upcoming" },
      { home: "Porto",             homeFlag: "🇵🇹", homeScore: "1", away: "Ajax",          awayFlag: "🇳🇱", awayScore: "1", leg: "1st", status: "played" },
      { home: "Ajax",              homeFlag: "🇳🇱", homeScore: "-", away: "Porto",          awayFlag: "🇵🇹", awayScore: "-", leg: "2nd", status: "upcoming" },
      { home: "Tottenham",         homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", homeScore: "0", away: "Eintracht Frankfurt", awayFlag: "🇩🇪", awayScore: "2", leg: "1st", status: "played" },
      { home: "Eintracht Frankfurt", homeFlag: "🇩🇪", homeScore: "-", away: "Tottenham",   awayFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", awayScore: "-", leg: "2nd", status: "upcoming" },
    ],
  },
  {
    round: "Semi-Finals",
    icon: "🔥",
    ties: [
      { home: "Manchester United", homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", homeScore: "-", away: "Roma",              awayFlag: "🇮🇹", awayScore: "-", leg: "1st", status: "upcoming" },
      { home: "Porto",             homeFlag: "🇵🇹", homeScore: "-", away: "Eintracht Frankfurt", awayFlag: "🇩🇪", awayScore: "-", leg: "1st", status: "upcoming" },
    ],
  },
  {
    round: "Final",
    icon: "🏆",
    ties: [
      { home: "TBD", homeFlag: "🏟️", homeScore: "-", away: "TBD", awayFlag: "🏟️", awayScore: "-", leg: "Final", status: "upcoming" },
    ],
  },
];

/* ── Clubs ───────────────────────────────────────────────── */
const CLUBS = [
  { name: "Manchester United", country: "England",  flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", titles: 1, founded: 1878, stadium: "Old Trafford" },
  { name: "Roma",              country: "Italy",    flag: "🇮🇹", titles: 0, founded: 1927, stadium: "Stadio Olimpico" },
  { name: "Porto",             country: "Portugal", flag: "🇵🇹", titles: 0, founded: 1893, stadium: "Estádio do Dragão" },
  { name: "Eintracht Frankfurt", country: "Germany",flag: "🇩🇪", titles: 1, founded: 1899, stadium: "Deutsche Bank Park" },
  { name: "Ajax",              country: "Netherlands",flag:"🇳🇱", titles: 0, founded: 1900, stadium: "Johan Cruyff Arena" },
  { name: "Athletic Club",     country: "Spain",    flag: "🇪🇸", titles: 0, founded: 1898, stadium: "San Mamés" },
  { name: "Lyon",              country: "France",   flag: "🇫🇷", titles: 0, founded: 1950, stadium: "Groupama Stadium" },
  { name: "Tottenham",         country: "England",  flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", titles: 0, founded: 1882, stadium: "Tottenham Hotspur Stadium" },
  { name: "Braga",             country: "Portugal", flag: "🇵🇹", titles: 0, founded: 1921, stadium: "Estádio Municipal de Braga" },
  { name: "Galatasaray",       country: "Turkey",   flag: "🇹🇷", titles: 1, founded: 1905, stadium: "Rams Park" },
  { name: "Villarreal",        country: "Spain",    flag: "🇪🇸", titles: 1, founded: 1923, stadium: "Estadio de la Cerámica" },
  { name: "Sevilla",           country: "Spain",    flag: "🇪🇸", titles: 7, founded: 1890, stadium: "Ramón Sánchez-Pizjuán" },
];

/* ── History ─────────────────────────────────────────────── */
const CHAMPIONS = [
  { year: 2025, winner: "Atalanta",          country: "Italy",    flag: "🇮🇹", runnerUp: "Lyon",              venue: "Dublin" },
  { year: 2024, winner: "Atalanta",          country: "Italy",    flag: "🇮🇹", runnerUp: "Bayer Leverkusen",  venue: "Dublin" },
  { year: 2023, winner: "Sevilla",           country: "Spain",    flag: "🇪🇸", runnerUp: "Roma",              venue: "Budapest" },
  { year: 2022, winner: "Eintracht Frankfurt",country:"Germany",  flag: "🇩🇪", runnerUp: "Rangers",           venue: "Seville" },
  { year: 2021, winner: "Villarreal",        country: "Spain",    flag: "🇪🇸", runnerUp: "Manchester United", venue: "Gdańsk" },
  { year: 2020, winner: "Sevilla",           country: "Spain",    flag: "🇪🇸", runnerUp: "Inter Milan",       venue: "Cologne" },
  { year: 2019, winner: "Chelsea",           country: "England",  flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", runnerUp: "Arsenal",           venue: "Baku" },
  { year: 2018, winner: "Atlético Madrid",   country: "Spain",    flag: "🇪🇸", runnerUp: "Marseille",         venue: "Lyon" },
  { year: 2017, winner: "Manchester United", country: "England",  flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", runnerUp: "Ajax",              venue: "Stockholm" },
  { year: 2016, winner: "Sevilla",           country: "Spain",    flag: "🇪🇸", runnerUp: "Liverpool",         venue: "Basel" },
];

/* ── Odds button ─────────────────────────────────────────── */
const OddsBtn = ({ label, odds, onClick }: { label: string; odds: number; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center w-[52px] h-9 rounded bg-muted hover:bg-orange-500/10 hover:border-orange-500 border border-transparent transition-colors active:scale-95"
  >
    <span className="text-[9px] text-muted-foreground leading-none">{label}</span>
    <span className="text-xs font-bold text-orange-500 leading-tight tabular-nums">{odds.toFixed(2)}</span>
  </button>
);

/* ── Match row ───────────────────────────────────────────── */
const MatchRow = ({ match }: { match: Match }) => {
  const { addSelection } = useBetSlip();
  const bet = (type: "home" | "draw" | "away", odds: number, val: string) =>
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

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40 last:border-0 hover:bg-orange-500/5 transition-colors">
      {/* Teams column */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground mb-1">
          {format(new Date(match.commence_time), "EEE d MMM · HH:mm")}
        </p>
        <div className="flex items-center gap-1.5 mb-0.5">
          <TeamBadge name={match.home_team} size={18} />
          <p className="text-xs font-semibold truncate leading-tight">{match.home_team}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <TeamBadge name={match.away_team} size={18} />
          <p className="text-xs text-muted-foreground truncate leading-tight">{match.away_team}</p>
        </div>
      </div>
      {/* Odds */}
      <div className="flex gap-1 flex-shrink-0">
        {match.home_odds != null && (
          <OddsBtn label="1" odds={match.home_odds} onClick={() => bet("home", match.home_odds!, "Home Win")} />
        )}
        {match.draw_odds != null && (
          <OddsBtn label="X" odds={match.draw_odds} onClick={() => bet("draw", match.draw_odds!, "Draw")} />
        )}
        {match.away_odds != null && (
          <OddsBtn label="2" odds={match.away_odds} onClick={() => bet("away", match.away_odds!, "Away Win")} />
        )}
      </div>
    </div>
  );
};

/* ── Page ────────────────────────────────────────────────── */
const EuropaLeague = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Fixtures");
  const { data: liveMatches = [], isLoading, isError, refetch } = useLeagueMatches("Europa League", 60);
  const matches = liveMatches.length > 0 ? liveMatches : STATIC_FIXTURES;
  const isStatic = liveMatches.length === 0 && !isLoading;

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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">

          {/* ── Hero ─────────────────────────────────────── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-900 to-slate-900 px-4 md:px-6 pt-5 pb-6">
            {/* Star field overlay */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

            <div className="relative flex items-start gap-4">
              {/* UEL badge */}
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center p-1">
                <img src={UEL_LOGO} alt="UEFA Europa League" className="w-full h-full object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).replaceWith(Object.assign(document.createElement("span"), { textContent: "🟠", className: "text-3xl" })); }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-lg font-bold text-white leading-tight">UEFA Europa League</h1>
                  <Badge className="bg-orange-500 text-white border-0 text-[10px] font-bold px-2">2025–26</Badge>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Europe's second-largest club competition — 36 elite clubs competing for the iconic orange trophy.
                </p>

                <div className="flex gap-3 mt-3 flex-wrap">
                  {[
                    { label: "Clubs",   value: "36" },
                    { label: "Nations", value: "26" },
                    { label: "Prize",   value: "€600M" },
                    { label: "Stage",   value: "QF" },
                  ].map(s => (
                    <div key={s.label} className="bg-black/20 rounded-lg px-2.5 py-1.5 text-center">
                      <div className="text-sm font-bold text-orange-300">{s.value}</div>
                      <div className="text-[9px] text-white/60 leading-tight">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Final venue strip */}
            <div className="relative mt-4 flex items-center gap-2 bg-black/25 rounded-xl px-3 py-2">
              <span className="text-base">🇪🇸</span>
              <div>
                <p className="text-[9px] text-white/50 leading-none">Final · 20 May 2026</p>
                <p className="text-xs font-bold text-orange-300">San Mamés, Bilbao, Spain</p>
              </div>
              <Badge className="ml-auto bg-orange-500/20 text-orange-300 border-orange-500/30 text-[9px]">
                7× Sevilla
              </Badge>
            </div>
          </div>

          {/* ── Tabs ─────────────────────────────────────── */}
          <div className="flex border-b border-border bg-card sticky top-0 z-10">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 whitespace-nowrap",
                  activeTab === tab
                    ? "border-orange-500 text-orange-500"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="px-4 md:px-6 py-3">

            {/* FIXTURES */}
            {activeTab === "Fixtures" && (
              <div>
                {isLoading && (
                  <div className="space-y-2">
                    {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                  </div>
                )}
                {isError && (
                  <div className="flex flex-col items-center py-12 gap-3 text-center">
                    <p className="text-sm text-muted-foreground">Could not load fixtures</p>
                    <button onClick={() => refetch()}
                      className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 border border-orange-500/30 rounded px-3 py-1.5 hover:bg-orange-500/10">
                      <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                  </div>
                )}
                {!isLoading && (
                  <>
                    {isStatic && (
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <Badge className="bg-orange-500/15 text-orange-500 border-orange-500/30 text-[10px]">Scheduled Fixtures</Badge>
                        <span className="text-[10px] text-muted-foreground">Live odds update when available</span>
                      </div>
                    )}
                    {Object.entries(grouped).map(([key, group]) => (
                      <div key={key} className="mb-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Calendar className="w-3 h-3 text-orange-500" />
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{group.label}</span>
                          <span className="text-[10px] text-muted-foreground/60">· {group.matches.length} match{group.matches.length !== 1 ? "es" : ""}</span>
                        </div>
                        <div className="border border-border rounded-xl overflow-hidden bg-card">
                          {group.matches.map(m => <MatchRow key={m.id} match={m} />)}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* KNOCKOUT */}
            {activeTab === "Knockout" && (
              <div className="space-y-4">
                {BRACKET.map(round => (
                  <div key={round.round}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{round.icon}</span>
                      <span className="text-xs font-bold">{round.round}</span>
                    </div>
                    <div className="border border-border rounded-xl overflow-hidden bg-card">
                      {round.ties.map((tie, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2.5 border-b border-border/40 last:border-0",
                            tie.status === "upcoming" ? "hover:bg-orange-500/5" : "opacity-70"
                          )}
                        >
                          {/* Leg badge */}
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 w-8 text-center",
                            tie.leg === "Final" ? "bg-orange-500 text-white" :
                            tie.status === "played" ? "bg-muted text-muted-foreground" :
                            "bg-orange-500/15 text-orange-500"
                          )}>
                            {tie.leg}
                          </span>

                          {/* Home */}
                          <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                            <span className="text-xs font-semibold truncate">{tie.home}</span>
                            <TeamBadge name={tie.home} size={22} flag={tie.homeFlag} />
                          </div>

                          {/* Score */}
                          <div className={cn(
                            "flex-shrink-0 w-12 text-center text-xs font-bold tabular-nums rounded px-1.5 py-0.5",
                            tie.status === "played"
                              ? "bg-muted text-foreground"
                              : "bg-orange-500/10 text-orange-400"
                          )}>
                            {tie.homeScore} – {tie.awayScore}
                          </div>

                          {/* Away */}
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <TeamBadge name={tie.away} size={22} flag={tie.awayFlag} />
                            <span className="text-xs font-semibold truncate">{tie.away}</span>
                          </div>

                          {/* Status pill */}
                          <Badge className={cn(
                            "text-[8px] flex-shrink-0 border-0 px-1.5",
                            tie.status === "played" ? "bg-muted text-muted-foreground" : "bg-orange-500/15 text-orange-500"
                          )}>
                            {tie.status === "played" ? "FT" : "Soon"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Tournament path info */}
                <div className="bg-card border border-border rounded-xl px-3 py-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">2025–26 Format</p>
                  <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
                    {["League Phase\n36 clubs", "Knockout\nPlayoff", "R16", "QF\n◀ Now", "SF", "Final\n20 May"].map((stage, i) => (
                      <div key={i} className="flex items-center flex-shrink-0">
                        <div className={cn(
                          "text-center px-2 py-1.5 rounded text-[9px] leading-tight font-semibold whitespace-pre-line",
                          stage.includes("Now") ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                        )}>
                          {stage}
                        </div>
                        {i < 5 && <span className="text-muted-foreground/40 mx-1 text-[10px]">›</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CLUBS */}
            {activeTab === "Clubs" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CLUBS.map(club => (
                  <div key={club.name}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-3 hover:border-orange-500/40 hover:bg-orange-500/5 transition-colors">
                    <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                      <TeamBadge name={club.name} size={36} flag={club.flag} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold truncate">{club.name}</p>
                        {club.titles > 0 && (
                          <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 text-[9px] px-1 flex-shrink-0">
                            {club.titles}× 🏆
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight">{club.country} · Est. {club.founded}</p>
                      <p className="text-[10px] text-muted-foreground/60 truncate leading-tight">{club.stadium}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* HISTORY */}
            {activeTab === "History" && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold">Past Champions</span>
                </div>
                <div className="border border-border rounded-xl overflow-hidden bg-card">
                  {CHAMPIONS.map((c, i) => (
                    <div key={c.year}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 border-b border-border/40 last:border-0",
                        i === 0 ? "bg-orange-500/8" : "hover:bg-muted/20"
                      )}>
                      <div className="w-10 text-center flex-shrink-0">
                        <span className={cn("text-xs font-bold tabular-nums", i === 0 ? "text-orange-500" : "text-muted-foreground")}>
                          {c.year}
                        </span>
                      </div>
                      <TeamBadge name={c.winner} size={28} flag={c.flag} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={cn("text-xs font-bold truncate", i === 0 ? "text-orange-400" : "")}>{c.winner}</p>
                          {i === 0 && <Badge className="bg-orange-500 text-white border-0 text-[8px] px-1 py-0">LATEST</Badge>}
                        </div>
                        <p className="text-[10px] text-muted-foreground">vs {c.runnerUp} · {c.venue}</p>
                      </div>
                      <span className="text-base flex-shrink-0">{c.flag}</span>
                    </div>
                  ))}
                </div>

                {/* Most titles */}
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Most Titles</p>
                  <div className="space-y-1.5">
                    {[
                      { name: "Sevilla",           flag: "🇪🇸", titles: 7 },
                      { name: "Juventus",           flag: "🇮🇹", titles: 3 },
                      { name: "Inter Milan",        flag: "🇮🇹", titles: 3 },
                      { name: "Liverpool",          flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", titles: 3 },
                      { name: "Atlético Madrid",    flag: "🇪🇸", titles: 3 },
                    ].map(t => (
                      <div key={t.name} className="flex items-center gap-2">
                        <TeamBadge name={t.name} size={22} flag={t.flag} />
                        <span className="text-xs font-semibold flex-1">{t.name}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: t.titles }).map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-orange-500 text-orange-500" />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-orange-500 w-4 text-right">{t.titles}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>

        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default EuropaLeague;
