import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { useLeagueMatches, Match } from "@/hooks/useLeagueMatches";
import { Trophy, Calendar, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

/* ── Tabs ────────────────────────────────────────────────── */
const TABS = ["Fixtures", "Groups", "Clubs", "History"] as const;
type Tab = typeof TABS[number];

/* ── Logo URLs (API-Football CDN) ────────────────────────── */
const CAF_LOGO = "https://media.api-sports.io/football/leagues/12.png";

const TEAM_LOGOS: Record<string, string> = {
  "Al Ahly":           "https://media.api-sports.io/football/teams/10.png",
  "Zamalek":           "https://media.api-sports.io/football/teams/87.png",
  "Zamalek SC":        "https://media.api-sports.io/football/teams/87.png",
  "Wydad Casablanca":  "https://media.api-sports.io/football/teams/95.png",
  "Espérance ST":      "https://media.api-sports.io/football/teams/91.png",
  "Mamelodi Sundowns": "https://media.api-sports.io/football/teams/648.png",
  "TP Mazembe":        "https://media.api-sports.io/football/teams/98.png",
  "CR Belouizdad":     "https://media.api-sports.io/football/teams/680.png",
  "USM Alger":         "https://media.api-sports.io/football/teams/681.png",
  "MC Alger":          "https://media.api-sports.io/football/teams/687.png",
  "RS Berkane":        "https://media.api-sports.io/football/teams/2277.png",
  "Pyramids FC":       "https://media.api-sports.io/football/teams/2278.png",
  "Simba SC":          "https://media.api-sports.io/football/teams/8300.png",
  "Young Africans":    "https://media.api-sports.io/football/teams/8301.png",
  "Petro de Luanda":   "https://media.api-sports.io/football/teams/8302.png",
  "ASEC Mimosas":      "https://media.api-sports.io/football/teams/8303.png",
  "Stade d'Abidjan":   "https://media.api-sports.io/football/teams/8304.png",
  "Kaizer Chiefs":     "https://media.api-sports.io/football/teams/2282.png",
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

/* ── Static fixtures (fallback when API returns empty) ───── */
const STATIC_FIXTURES: Match[] = [
  // ── Matchday 5 · 25 Apr 2026 ──────────────────────────────
  { id: "caf-md5-1", match_id: "caf-md5-1", sport_key: "soccer", sport_title: "Football", league_name: "CAF Champions League",
    home_team: "Al Ahly", away_team: "TP Mazembe",
    commence_time: "2026-04-25T17:00:00Z", home_odds: 1.55, draw_odds: 3.50, away_odds: 5.50, status: "upcoming" },
  { id: "caf-md5-2", match_id: "caf-md5-2", sport_key: "soccer", sport_title: "Football", league_name: "CAF Champions League",
    home_team: "CR Belouizdad", away_team: "Petro de Luanda",
    commence_time: "2026-04-25T19:00:00Z", home_odds: 1.80, draw_odds: 3.20, away_odds: 4.50, status: "upcoming" },
  { id: "caf-md5-3", match_id: "caf-md5-3", sport_key: "soccer", sport_title: "Football", league_name: "CAF Champions League",
    home_team: "Wydad Casablanca", away_team: "USM Alger",
    commence_time: "2026-04-25T18:00:00Z", home_odds: 1.70, draw_odds: 3.30, away_odds: 5.00, status: "upcoming" },
  { id: "caf-md5-4", match_id: "caf-md5-4", sport_key: "soccer", sport_title: "Football", league_name: "CAF Champions League",
    home_team: "Espérance ST", away_team: "Stade d'Abidjan",
    commence_time: "2026-04-25T20:00:00Z", home_odds: 1.65, draw_odds: 3.40, away_odds: 5.20, status: "upcoming" },
  { id: "caf-md5-5", match_id: "caf-md5-5", sport_key: "soccer", sport_title: "Football", league_name: "CAF Champions League",
    home_team: "Mamelodi Sundowns", away_team: "Simba SC",
    commence_time: "2026-04-26T16:00:00Z", home_odds: 1.60, draw_odds: 3.40, away_odds: 5.80, status: "upcoming" },
  { id: "caf-md5-6", match_id: "caf-md5-6", sport_key: "soccer", sport_title: "Football", league_name: "CAF Champions League",
    home_team: "Zamalek", away_team: "MC Alger",
    commence_time: "2026-04-26T18:00:00Z", home_odds: 1.75, draw_odds: 3.25, away_odds: 4.80, status: "upcoming" },
  { id: "caf-md5-7", match_id: "caf-md5-7", sport_key: "soccer", sport_title: "Football", league_name: "CAF Champions League",
    home_team: "RS Berkane", away_team: "Young Africans",
    commence_time: "2026-04-26T17:00:00Z", home_odds: 1.72, draw_odds: 3.30, away_odds: 5.00, status: "upcoming" },
  { id: "caf-md5-8", match_id: "caf-md5-8", sport_key: "soccer", sport_title: "Football", league_name: "CAF Champions League",
    home_team: "Pyramids FC", away_team: "ASEC Mimosas",
    commence_time: "2026-04-26T19:00:00Z", home_odds: 1.85, draw_odds: 3.20, away_odds: 4.20, status: "upcoming" },

  // ── Quarter-Finals 1st Leg · 9 May 2026 ───────────────────
  { id: "caf-qf-1", match_id: "caf-qf-1", sport_key: "soccer", sport_title: "Football", league_name: "CAF Champions League",
    home_team: "Al Ahly", away_team: "Wydad Casablanca",
    commence_time: "2026-05-09T18:00:00Z", home_odds: 1.90, draw_odds: 3.20, away_odds: 3.80, status: "upcoming" },
  { id: "caf-qf-2", match_id: "caf-qf-2", sport_key: "soccer", sport_title: "Football", league_name: "CAF Champions League",
    home_team: "Mamelodi Sundowns", away_team: "Espérance ST",
    commence_time: "2026-05-09T16:00:00Z", home_odds: 2.00, draw_odds: 3.10, away_odds: 3.60, status: "upcoming" },
  { id: "caf-qf-3", match_id: "caf-qf-3", sport_key: "soccer", sport_title: "Football", league_name: "CAF Champions League",
    home_team: "RS Berkane", away_team: "CR Belouizdad",
    commence_time: "2026-05-10T18:00:00Z", home_odds: 2.10, draw_odds: 3.10, away_odds: 3.40, status: "upcoming" },
  { id: "caf-qf-4", match_id: "caf-qf-4", sport_key: "soccer", sport_title: "Football", league_name: "CAF Champions League",
    home_team: "Zamalek", away_team: "Pyramids FC",
    commence_time: "2026-05-10T16:00:00Z", home_odds: 2.20, draw_odds: 3.00, away_odds: 3.20, status: "upcoming" },
];

/* ── Groups data ─────────────────────────────────────────── */
const GROUPS = [
  {
    name: "Group A",
    color: "border-green-500",
    accent: "text-green-500",
    teams: [
      { name: "Al Ahly",          country: "Egypt",        flag: "🇪🇬", p: 4, w: 3, d: 1, l: 0, gf: 8, ga: 2, pts: 10 },
      { name: "CR Belouizdad",    country: "Algeria",      flag: "🇩🇿", p: 4, w: 2, d: 1, l: 1, gf: 5, ga: 4, pts: 7  },
      { name: "TP Mazembe",       country: "DR Congo",     flag: "🇨🇩", p: 4, w: 1, d: 1, l: 2, gf: 3, ga: 5, pts: 4  },
      { name: "Petro de Luanda",  country: "Angola",       flag: "🇦🇴", p: 4, w: 0, d: 1, l: 3, gf: 2, ga: 7, pts: 1  },
    ],
  },
  {
    name: "Group B",
    color: "border-yellow-500",
    accent: "text-yellow-500",
    teams: [
      { name: "Wydad Casablanca", country: "Morocco",      flag: "🇲🇦", p: 4, w: 3, d: 0, l: 1, gf: 7, ga: 3, pts: 9  },
      { name: "Espérance ST",     country: "Tunisia",      flag: "🇹🇳", p: 4, w: 2, d: 1, l: 1, gf: 6, ga: 4, pts: 7  },
      { name: "Stade d'Abidjan",  country: "Ivory Coast",  flag: "🇨🇮", p: 4, w: 1, d: 1, l: 2, gf: 4, ga: 6, pts: 4  },
      { name: "USM Alger",        country: "Algeria",      flag: "🇩🇿", p: 4, w: 0, d: 2, l: 2, gf: 3, ga: 7, pts: 2  },
    ],
  },
  {
    name: "Group C",
    color: "border-red-500",
    accent: "text-red-500",
    teams: [
      { name: "Mamelodi Sundowns",country: "South Africa", flag: "🇿🇦", p: 4, w: 3, d: 1, l: 0, gf: 9, ga: 2, pts: 10 },
      { name: "Zamalek",          country: "Egypt",        flag: "🇪🇬", p: 4, w: 2, d: 1, l: 1, gf: 6, ga: 4, pts: 7  },
      { name: "Simba SC",         country: "Tanzania",     flag: "🇹🇿", p: 4, w: 1, d: 0, l: 3, gf: 3, ga: 7, pts: 3  },
      { name: "MC Alger",         country: "Algeria",      flag: "🇩🇿", p: 4, w: 0, d: 2, l: 2, gf: 2, ga: 7, pts: 2  },
    ],
  },
  {
    name: "Group D",
    color: "border-amber-400",
    accent: "text-amber-400",
    teams: [
      { name: "RS Berkane",       country: "Morocco",      flag: "🇲🇦", p: 4, w: 3, d: 1, l: 0, gf: 7, ga: 1, pts: 10 },
      { name: "Pyramids FC",      country: "Egypt",        flag: "🇪🇬", p: 4, w: 2, d: 0, l: 2, gf: 5, ga: 5, pts: 6  },
      { name: "Young Africans",   country: "Tanzania",     flag: "🇹🇿", p: 4, w: 1, d: 1, l: 2, gf: 4, ga: 6, pts: 4  },
      { name: "ASEC Mimosas",     country: "Ivory Coast",  flag: "🇨🇮", p: 4, w: 0, d: 2, l: 2, gf: 2, ga: 6, pts: 2  },
    ],
  },
];

/* ── Clubs data ──────────────────────────────────────────── */
const CLUBS = [
  { name: "Al Ahly",           country: "Egypt",        flag: "🇪🇬", titles: 12, founded: 1907, stadium: "Al Ahly WE Al Salam Stadium" },
  { name: "Zamalek SC",        country: "Egypt",        flag: "🇪🇬", titles: 5,  founded: 1911, stadium: "Cairo International Stadium" },
  { name: "Wydad Casablanca",  country: "Morocco",      flag: "🇲🇦", titles: 3,  founded: 1937, stadium: "Mohammed V Complex" },
  { name: "Espérance ST",      country: "Tunisia",      flag: "🇹🇳", titles: 4,  founded: 1919, stadium: "Stade Olympique de Radès" },
  { name: "Mamelodi Sundowns", country: "South Africa", flag: "🇿🇦", titles: 1,  founded: 1970, stadium: "Loftus Versfeld" },
  { name: "TP Mazembe",        country: "DR Congo",     flag: "🇨🇩", titles: 5,  founded: 1939, stadium: "Stade TP Mazembe" },
  { name: "RS Berkane",        country: "Morocco",      flag: "🇲🇦", titles: 0,  founded: 1938, stadium: "Stade Municipal de Berkane" },
  { name: "Simba SC",          country: "Tanzania",     flag: "🇹🇿", titles: 0,  founded: 1936, stadium: "Benjamin Mkapa Stadium" },
  { name: "Young Africans",    country: "Tanzania",     flag: "🇹🇿", titles: 0,  founded: 1935, stadium: "Benjamin Mkapa Stadium" },
  { name: "CR Belouizdad",     country: "Algeria",      flag: "🇩🇿", titles: 1,  founded: 1921, stadium: "Stade du 20 Août 1955" },
  { name: "Pyramids FC",       country: "Egypt",        flag: "🇪🇬", titles: 0,  founded: 2008, stadium: "Air Defence Stadium" },
  { name: "Petro de Luanda",   country: "Angola",       flag: "🇦🇴", titles: 0,  founded: 1977, stadium: "Estádio 11 de Novembro" },
];

/* ── History data ────────────────────────────────────────── */
const CHAMPIONS = [
  { year: 2024, winner: "Al Ahly",           country: "Egypt",        flag: "🇪🇬", runnerUp: "Espérance ST",      venue: "Cairo" },
  { year: 2023, winner: "Al Ahly",           country: "Egypt",        flag: "🇪🇬", runnerUp: "Wydad Casablanca",  venue: "Cairo" },
  { year: 2022, winner: "Wydad Casablanca",  country: "Morocco",      flag: "🇲🇦", runnerUp: "Al Ahly",           venue: "Casablanca" },
  { year: 2021, winner: "Al Ahly",           country: "Egypt",        flag: "🇪🇬", runnerUp: "Kaizer Chiefs",     venue: "Casablanca" },
  { year: 2020, winner: "Al Ahly",           country: "Egypt",        flag: "🇪🇬", runnerUp: "Zamalek",           venue: "Cairo" },
  { year: 2019, winner: "Espérance ST",      country: "Tunisia",      flag: "🇹🇳", runnerUp: "Wydad Casablanca",  venue: "Tunis" },
  { year: 2018, winner: "Espérance ST",      country: "Tunisia",      flag: "🇹🇳", runnerUp: "Al Ahly",           venue: "Rades" },
  { year: 2017, winner: "Wydad Casablanca",  country: "Morocco",      flag: "🇲🇦", runnerUp: "USM Alger",         venue: "Casablanca" },
  { year: 2016, winner: "Mamelodi Sundowns", country: "South Africa", flag: "🇿🇦", runnerUp: "Zamalek",           venue: "Pretoria" },
  { year: 2015, winner: "TP Mazembe",        country: "DR Congo",     flag: "🇨🇩", runnerUp: "USM Alger",         venue: "Lubumbashi" },
];

/* ── Odds button ─────────────────────────────────────────── */
const OddsBtn = ({ label, odds, onClick }: { label: string; odds: number; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center w-[52px] h-9 rounded bg-muted hover:bg-amber-500/10 hover:border-amber-500 border border-transparent transition-colors active:scale-95"
  >
    <span className="text-[9px] text-muted-foreground leading-none">{label}</span>
    <span className="text-xs font-bold text-amber-500 leading-tight tabular-nums">{odds.toFixed(2)}</span>
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
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40 last:border-0 hover:bg-amber-500/5 transition-colors">
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

/* ── Group table ─────────────────────────────────────────── */
const GroupTable = ({ group }: { group: typeof GROUPS[0] }) => (
  <div className={cn("border rounded-xl overflow-hidden bg-card mb-3", group.color)}>
    <div className="px-3 py-2 bg-muted/30 border-b border-border flex items-center gap-2">
      <span className={cn("text-xs font-bold", group.accent)}>{group.name}</span>
    </div>
    <table className="w-full text-xs">
      <thead>
        <tr className="text-[10px] text-muted-foreground border-b border-border/40">
          <th className="text-left px-3 py-1.5 font-medium">Club</th>
          <th className="text-center px-1 py-1.5 font-medium">P</th>
          <th className="text-center px-1 py-1.5 font-medium">W</th>
          <th className="text-center px-1 py-1.5 font-medium">D</th>
          <th className="text-center px-1 py-1.5 font-medium">L</th>
          <th className="text-center px-1 py-1.5 font-medium">GF</th>
          <th className="text-center px-1 py-1.5 font-medium">GA</th>
          <th className="text-center px-2 py-1.5 font-bold">Pts</th>
        </tr>
      </thead>
      <tbody>
        {group.teams.map((t, i) => (
          <tr
            key={t.name}
            className={cn(
              "border-b border-border/30 last:border-0",
              i < 2 ? "bg-green-500/5" : ""
            )}
          >
            <td className="px-3 py-2">
              <div className="flex items-center gap-2">
                <TeamBadge name={t.name} size={18} flag={t.flag} />
                <span className="font-semibold truncate max-w-[100px]">{t.name}</span>
                {i < 2 && <span className="text-[8px] bg-green-500/20 text-green-500 px-1 rounded flex-shrink-0">QF</span>}
              </div>
            </td>
            <td className="text-center px-1 py-2 text-muted-foreground">{t.p}</td>
            <td className="text-center px-1 py-2">{t.w}</td>
            <td className="text-center px-1 py-2 text-muted-foreground">{t.d}</td>
            <td className="text-center px-1 py-2 text-muted-foreground">{t.l}</td>
            <td className="text-center px-1 py-2">{t.gf}</td>
            <td className="text-center px-1 py-2 text-muted-foreground">{t.ga}</td>
            <td className="text-center px-2 py-2 font-bold">{t.pts}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ── Page ────────────────────────────────────────────────── */
const CAFChampionsLeague = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Fixtures");
  const { data: liveMatches = [], isLoading, isError, refetch } = useLeagueMatches("CAF Champions League", 60);
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
          <div className="relative overflow-hidden bg-gradient-to-br from-green-900 via-yellow-800 to-red-900 px-4 md:px-6 pt-5 pb-6">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,215,0,0.3) 0, rgba(255,215,0,0.3) 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" }} />

            <div className="relative flex items-start gap-4">
              {/* CAF badge */}
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center p-1">
                <img src={CAF_LOGO} alt="CAF Champions League" className="w-full h-full object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).replaceWith(Object.assign(document.createElement("span"), { textContent: "🏆", className: "text-3xl" })); }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-lg font-bold text-white leading-tight">CAF Champions League</h1>
                  <Badge className="bg-yellow-500 text-black border-0 text-[10px] font-bold px-2">2024–25</Badge>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Africa's premier club competition — 16 elite clubs from across the continent battle for continental glory.
                </p>

                <div className="flex gap-3 mt-3 flex-wrap">
                  {[
                    { label: "Clubs",    value: "16" },
                    { label: "Countries",value: "12" },
                    { label: "Prize",    value: "$2.5M" },
                    { label: "Stage",    value: "QF" },
                  ].map(s => (
                    <div key={s.label} className="bg-black/20 rounded-lg px-2.5 py-1.5 text-center">
                      <div className="text-sm font-bold text-yellow-400">{s.value}</div>
                      <div className="text-[9px] text-white/60 leading-tight">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Defending champion strip */}
            <div className="relative mt-4 flex items-center gap-2 bg-black/25 rounded-xl px-3 py-2">
              <TeamBadge name="Al Ahly" size={24} flag="🇪🇬" />
              <div>
                <p className="text-[9px] text-white/50 leading-none">Defending Champions</p>
                <p className="text-xs font-bold text-yellow-400">Al Ahly SC — Cairo, Egypt</p>
              </div>
              <Badge className="ml-auto bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-[9px]">12× Winners</Badge>
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
                    ? "border-yellow-500 text-yellow-500"
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
                      className="flex items-center gap-1.5 text-xs font-semibold text-yellow-500 border border-yellow-500/30 rounded px-3 py-1.5 hover:bg-yellow-500/10">
                      <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                  </div>
                )}
                {!isLoading && (
                  <>
                    {isStatic && (
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <Badge className="bg-yellow-500/15 text-yellow-500 border-yellow-500/30 text-[10px]">Scheduled Fixtures</Badge>
                        <span className="text-[10px] text-muted-foreground">Live odds update when available</span>
                      </div>
                    )}
                    {Object.entries(grouped).map(([key, group]) => (
                      <div key={key} className="mb-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Calendar className="w-3 h-3 text-yellow-500" />
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

            {/* GROUPS */}
            {activeTab === "Groups" && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] text-muted-foreground">Top 2 teams per group qualify for Quarter-Finals</span>
                  <Badge className="ml-auto bg-green-500/15 text-green-500 border-green-500/20 text-[9px] px-1.5">QF = Qualifies</Badge>
                </div>
                {GROUPS.map(g => <GroupTable key={g.name} group={g} />)}
              </div>
            )}

            {/* CLUBS */}
            {activeTab === "Clubs" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CLUBS.map(club => (
                  <div key={club.name}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-3 hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-colors">
                    <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                      <TeamBadge name={club.name} size={36} flag={club.flag} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold truncate">{club.name}</p>
                        {club.titles > 0 && (
                          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-[9px] px-1 flex-shrink-0">
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
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-bold">Past Champions</span>
                </div>
                <div className="border border-border rounded-xl overflow-hidden bg-card">
                  {CHAMPIONS.map((c, i) => (
                    <div key={c.year}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 border-b border-border/40 last:border-0",
                        i === 0 ? "bg-yellow-500/8" : "hover:bg-muted/20"
                      )}>
                      <div className="w-10 text-center flex-shrink-0">
                        <span className={cn("text-xs font-bold tabular-nums", i === 0 ? "text-yellow-500" : "text-muted-foreground")}>
                          {c.year}
                        </span>
                      </div>
                      <TeamBadge name={c.winner} size={28} flag={c.flag} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={cn("text-xs font-bold truncate", i === 0 ? "text-yellow-400" : "")}>{c.winner}</p>
                          {i === 0 && <Badge className="bg-yellow-500 text-black border-0 text-[8px] px-1 py-0">CURRENT</Badge>}
                        </div>
                        <p className="text-[10px] text-muted-foreground">vs {c.runnerUp} · {c.venue}</p>
                      </div>
                      <span className="text-base flex-shrink-0">{c.flag}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Most Titles</p>
                  <div className="space-y-1.5">
                    {[
                      { name: "Al Ahly",          flag: "🇪🇬", titles: 12 },
                      { name: "Zamalek",           flag: "🇪🇬", titles: 5  },
                      { name: "TP Mazembe",        flag: "🇨🇩", titles: 5  },
                      { name: "Espérance ST",      flag: "🇹🇳", titles: 4  },
                      { name: "Wydad Casablanca",  flag: "🇲🇦", titles: 3  },
                    ].map(t => (
                      <div key={t.name} className="flex items-center gap-2">
                        <TeamBadge name={t.name} size={22} flag={t.flag} />
                        <span className="text-xs font-semibold flex-1">{t.name}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: Math.min(t.titles, 12) }).map((_, i) => (
                            <span key={i} className="text-yellow-500 text-[10px]">★</span>
                          ))}
                        </div>
                        <span className="text-xs font-bold text-yellow-500 w-6 text-right">{t.titles}</span>
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

export default CAFChampionsLeague;
