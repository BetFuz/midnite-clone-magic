import { useState } from "react";
import { Link } from "react-router-dom";
import { useLeagueMatchCounts } from "@/hooks/useLeagueMatchCounts";
import { LEAGUE_LOGOS } from "@/utils/teamLogos";
import { ChevronRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Competition catalogue ───────────────────────────────── */
interface Competition {
  name: string;
  url: string;
  country: string;
  flag: string;
  sport: string;
}

const COMPETITIONS: Competition[] = [
  /* ── Football: Europe ──────────────────────────────────── */
  { name: "Premier League",       url: "/football/premier-league",            country: "England",     flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", sport: "Football" },
  { name: "Champions League",     url: "/football/champions-league",          country: "UEFA",        flag: "🇪🇺", sport: "Football" },
  { name: "La Liga",              url: "/football/la-liga",                   country: "Spain",       flag: "🇪🇸", sport: "Football" },
  { name: "Bundesliga",           url: "/football/bundesliga",                country: "Germany",     flag: "🇩🇪", sport: "Football" },
  { name: "Serie A",              url: "/football/serie-a",                   country: "Italy",       flag: "🇮🇹", sport: "Football" },
  { name: "Ligue 1",              url: "/football/ligue-1",                   country: "France",      flag: "🇫🇷", sport: "Football" },
  { name: "Europa League",        url: "/football/europa-league",             country: "UEFA",        flag: "🇪🇺", sport: "Football" },
  { name: "Conference League",    url: "/sports/football",                    country: "UEFA",        flag: "🇪🇺", sport: "Football" },
  { name: "Championship",         url: "/football/championship",              country: "England",     flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", sport: "Football" },
  { name: "Eredivisie",           url: "/sports/football",                    country: "Netherlands", flag: "🇳🇱", sport: "Football" },
  { name: "Scottish Premiership", url: "/sports/football",                    country: "Scotland",    flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", sport: "Football" },
  { name: "Belgian Pro League",   url: "/sports/football",                    country: "Belgium",     flag: "🇧🇪", sport: "Football" },
  { name: "Primeira Liga",        url: "/sports/football",                    country: "Portugal",    flag: "🇵🇹", sport: "Football" },
  { name: "Süper Lig",            url: "/sports/football",                    country: "Turkey",      flag: "🇹🇷", sport: "Football" },
  /* ── Football: World ───────────────────────────────────── */
  { name: "World Cup",            url: "/football/world-cup",                 country: "Global",      flag: "🌍", sport: "Football" },
  { name: "Copa América",         url: "/sports/football",                    country: "S. America",  flag: "🌎", sport: "Football" },
  { name: "African Cup of Nations", url: "/football/african-cup-of-nations", country: "Africa",      flag: "🌍", sport: "Football" },
  { name: "CAF Champions League", url: "/football/caf-champions-league",     country: "Africa",      flag: "🌍", sport: "Football" },
  { name: "Copa Libertadores",    url: "/sports/football",                    country: "S. America",  flag: "🌎", sport: "Football" },
  { name: "MLS",                  url: "/sports/football",                    country: "USA",         flag: "🇺🇸", sport: "Football" },
  { name: "Liga MX",              url: "/sports/football",                    country: "Mexico",      flag: "🇲🇽", sport: "Football" },
  { name: "Saudi Pro League",     url: "/sports/football",                    country: "Saudi Arabia",flag: "🇸🇦", sport: "Football" },
  { name: "Brazilian Série A",    url: "/sports/football",                    country: "Brazil",      flag: "🇧🇷", sport: "Football" },
  { name: "Argentine Primera",    url: "/sports/football",                    country: "Argentina",   flag: "🇦🇷", sport: "Football" },
  /* ── Football: Africa ──────────────────────────────────── */
  { name: "Nigerian NPFL",        url: "/sports/football",                    country: "Nigeria",     flag: "🇳🇬", sport: "Football" },
  { name: "Egyptian Premier League", url: "/football/egyptian-premier-league", country: "Egypt",     flag: "🇪🇬", sport: "Football" },
  { name: "South African Premier League", url: "/football/south-african-premier-league", country: "S. Africa", flag: "🇿🇦", sport: "Football" },
  { name: "Ghanaian Premier League", url: "/sports/football",                 country: "Ghana",       flag: "🇬🇭", sport: "Football" },
  { name: "Moroccan Botola",      url: "/sports/football",                    country: "Morocco",     flag: "🇲🇦", sport: "Football" },
  /* ── Football: Asia/Oceania ────────────────────────────── */
  { name: "J1 League",            url: "/sports/football",                    country: "Japan",       flag: "🇯🇵", sport: "Football" },
  { name: "K League",             url: "/sports/football",                    country: "South Korea", flag: "🇰🇷", sport: "Football" },
  { name: "Chinese Super League", url: "/sports/football",                    country: "China",       flag: "🇨🇳", sport: "Football" },
  { name: "Indian Super League",  url: "/sports/football",                    country: "India",       flag: "🇮🇳", sport: "Football" },
  { name: "A-League",             url: "/sports/football",                    country: "Australia",   flag: "🇦🇺", sport: "Football" },
  /* ── Basketball ────────────────────────────────────────── */
  { name: "NBA",                  url: "/basketball/nba",                     country: "USA",         flag: "🇺🇸", sport: "Basketball" },
  { name: "EuroLeague",           url: "/basketball/euroleague",              country: "Europe",      flag: "🇪🇺", sport: "Basketball" },
  { name: "WNBA",                 url: "/basketball/wnba",                    country: "USA",         flag: "🇺🇸", sport: "Basketball" },
  { name: "Spanish ACB",          url: "/sports/basketball",                  country: "Spain",       flag: "🇪🇸", sport: "Basketball" },
  /* ── American Football ─────────────────────────────────── */
  { name: "NFL",                  url: "/sports/american-football",           country: "USA",         flag: "🇺🇸", sport: "Am. Football" },
  /* ── Tennis ────────────────────────────────────────────── */
  { name: "ATP",                  url: "/sports/tennis",                      country: "Global",      flag: "🎾", sport: "Tennis" },
  { name: "WTA",                  url: "/sports/tennis",                      country: "Global",      flag: "🎾", sport: "Tennis" },
  /* ── Cricket ───────────────────────────────────────────── */
  { name: "IPL",                  url: "/sports/cricket",                     country: "India",       flag: "🇮🇳", sport: "Cricket" },
  { name: "BBL",                  url: "/sports/cricket",                     country: "Australia",   flag: "🇦🇺", sport: "Cricket" },
  /* ── Rugby ─────────────────────────────────────────────── */
  { name: "Super Rugby",          url: "/sports/rugby",                       country: "Global",      flag: "🏉", sport: "Rugby" },
  { name: "Premiership Rugby",    url: "/sports/rugby",                       country: "England",     flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", sport: "Rugby" },
  { name: "NRL",                  url: "/sports/rugby",                       country: "Australia",   flag: "🇦🇺", sport: "Rugby" },
  /* ── Combat ────────────────────────────────────────────── */
  { name: "UFC",                  url: "/sports/mma",                         country: "Global",      flag: "🥊", sport: "MMA" },
];

const SPORT_TABS = [
  { id: "All",          label: "All" },
  { id: "Football",     label: "⚽ Football" },
  { id: "Basketball",   label: "🏀 Basketball" },
  { id: "Am. Football", label: "🏈 NFL" },
  { id: "Tennis",       label: "🎾 Tennis" },
  { id: "Cricket",      label: "🏏 Cricket" },
  { id: "Rugby",        label: "🏉 Rugby" },
  { id: "MMA",          label: "🥊 MMA" },
];

/* ── Single competition tile ─────────────────────────────── */
function CompTile({ comp, count }: { comp: Competition; count: number }) {
  const logo = LEAGUE_LOGOS[comp.name];

  return (
    <Link
      to={comp.url}
      className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-muted/30 transition-all active:scale-[0.98]"
    >
      {/* Logo */}
      <div className="w-8 h-8 shrink-0 flex items-center justify-center">
        {logo ? (
          <img
            src={logo}
            alt={comp.name}
            className="w-7 h-7 object-contain group-hover:scale-110 transition-transform"
            onError={e => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <span className={cn("text-lg", logo ? "hidden" : "")}>{comp.flag}</span>
      </div>

      {/* Name + country */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-foreground leading-tight truncate group-hover:text-primary transition-colors">
          {comp.name}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[9px] text-muted-foreground/60 truncate">{comp.flag} {comp.country}</span>
        </div>
      </div>

      {/* Match count OR chevron */}
      <div className="shrink-0">
        {count > 0 ? (
          <span className="text-[9px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full tabular-nums">
            {count}
          </span>
        ) : (
          <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
        )}
      </div>
    </Link>
  );
}

/* ── Main widget ─────────────────────────────────────────── */
export const PopularLeaguesBar = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const { data: counts = {} } = useLeagueMatchCounts(COMPETITIONS.map(c => c.name), 7);

  const filtered = activeTab === "All"
    ? COMPETITIONS
    : COMPETITIONS.filter(c => c.sport === activeTab);

  /* Sort: match count descending, then alphabetical */
  const sorted = [...filtered].sort((a, b) => {
    const ca = counts[a.name] ?? 0;
    const cb = counts[b.name] ?? 0;
    return cb - ca || a.name.localeCompare(b.name);
  });

  const visible = showAll ? sorted : sorted.slice(0, 24);

  return (
    <div className="mb-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Trophy className="w-3 h-3 text-primary" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Popular Competitions</h2>
        </div>
        <Link to="/sports/football" className="text-xs text-primary flex items-center gap-0.5 hover:underline shrink-0">
          All Sports <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Sport filter tabs — horizontal scroll */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 mb-3">
        {SPORT_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setShowAll(false); }}
            className={cn(
              "shrink-0 text-[10px] font-semibold px-3 py-1.5 rounded-full border transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Competition grid — 2 columns */}
      <div className="grid grid-cols-2 gap-1.5">
        {visible.map(comp => (
          <CompTile
            key={comp.name}
            comp={comp}
            count={counts[comp.name] ?? 0}
          />
        ))}
      </div>

      {/* Show more / less toggle */}
      {sorted.length > 24 && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="mt-3 w-full py-2 text-xs font-semibold text-primary border border-primary/20 rounded-xl hover:bg-primary/5 transition-all flex items-center justify-center gap-1"
        >
          {showAll ? "Show Less" : `Show All ${sorted.length} Competitions`}
          <ChevronRight className={cn("w-3 h-3 transition-transform", showAll ? "-rotate-90" : "rotate-90")} />
        </button>
      )}
    </div>
  );
};
