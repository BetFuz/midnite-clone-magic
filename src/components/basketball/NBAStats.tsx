import { useState } from "react";
import { Loader2, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNBAStandings } from "@/hooks/useNBAStandings";
import { useNBALeaders } from "@/hooks/useNBALeaders";
import { NBAStandingEntry } from "@/lib/espn";

type SortKey = "name" | "wins" | "losses" | "pct";

const TeamRankings = () => {
  const { data, isLoading } = useNBAStandings();
  const [sortKey, setSortKey] = useState<SortKey>("wins");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  const allTeams: NBAStandingEntry[] = [...(data?.east ?? []), ...(data?.west ?? [])];
  const sorted = [...allTeams].sort((a, b) => {
    const av: number | string = sortKey === "name" ? a.team.name : a[sortKey as keyof NBAStandingEntry] as number;
    const bv: number | string = sortKey === "name" ? b.team.name : b[sortKey as keyof NBAStandingEntry] as number;
    if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const toggle = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th className="py-2 px-2 text-center cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => toggle(k)}>
      <span className="flex items-center justify-center gap-0.5">
        {label}
        <ArrowUpDown className={cn("w-2.5 h-2.5", sortKey === k ? "text-primary" : "opacity-30")} />
      </span>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted-foreground/60 border-b border-border/40">
            <th className="text-left py-2 pl-4">
              <button onClick={() => toggle("name")} className="flex items-center gap-0.5 hover:text-foreground">
                Team <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />
              </button>
            </th>
            <Th k="wins" label="W" />
            <Th k="losses" label="L" />
            <Th k="pct" label="PCT" />
            <th className="text-center py-2 px-2">Conf</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t, i) => (
            <tr key={t.team.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
              <td className="py-2 pl-4">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground/40 w-4 text-right">{i + 1}</span>
                  {t.team.logo ? (
                    <img src={t.team.logo} alt={t.team.name} className="w-5 h-5 object-contain" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-muted" />
                  )}
                  <span className="font-medium truncate max-w-[120px]">{t.team.name}</span>
                </div>
              </td>
              <td className="py-2 text-center font-bold text-[#00b15c]">{t.wins}</td>
              <td className="py-2 text-center text-muted-foreground">{t.losses}</td>
              <td className="py-2 text-center">{t.pct.toFixed(3)}</td>
              <td className="py-2 text-center">
                <span className={cn(
                  "text-[9px] font-semibold px-1.5 py-0.5 rounded",
                  t.conference === "east" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                )}>
                  {t.conference === "east" ? "East" : "West"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const NBA_TEAMS = [
  "Atlanta Hawks","Boston Celtics","Brooklyn Nets","Charlotte Hornets","Chicago Bulls",
  "Cleveland Cavaliers","Dallas Mavericks","Denver Nuggets","Detroit Pistons","Golden State Warriors",
  "Houston Rockets","Indiana Pacers","LA Clippers","Los Angeles Lakers","Memphis Grizzlies",
  "Miami Heat","Milwaukee Bucks","Minnesota Timberwolves","New Orleans Pelicans","New York Knicks",
  "Oklahoma City Thunder","Orlando Magic","Philadelphia 76ers","Phoenix Suns","Portland Trail Blazers",
  "Sacramento Kings","San Antonio Spurs","Toronto Raptors","Utah Jazz","Washington Wizards",
];

const SeasonLeaders = () => {
  const { data: leaders, isLoading } = useNBALeaders();

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  const cats = [
    { key: "points" as const,        label: "Points",     unit: "PPG" },
    { key: "rebounds" as const,      label: "Rebounds",   unit: "RPG" },
    { key: "assists" as const,       label: "Assists",    unit: "APG" },
    { key: "steals" as const,        label: "Steals",     unit: "SPG" },
    { key: "blocks" as const,        label: "Blocks",     unit: "BPG" },
    { key: "threePointers" as const, label: "3-Pointers", unit: "3PM" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {cats.map(({ key, label, unit }) => (
        <div key={key} className="bg-card border border-border rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-white">{label}</p>
            <span className="text-[9px] text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">{unit}</span>
          </div>
          <div className="space-y-2">
            {(leaders?.[key] ?? []).slice(0, 10).map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[9px] text-muted-foreground/40 w-4 text-right shrink-0">{l.rank}</span>
                {l.headshot ? (
                  <img src={l.headshot} alt={l.displayName} className="w-6 h-6 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold truncate">{l.displayName}</p>
                  <p className="text-[9px] text-muted-foreground">{l.teamAbbr}</p>
                </div>
                <span className={cn(
                  "text-sm font-black tabular-nums shrink-0",
                  i === 0 ? "text-[#00b15c]" : "text-foreground"
                )}>
                  {l.value.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const H2HLookup = () => {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");

  const selectCls = "bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/40 w-full";

  return (
    <div className="p-4 border-t border-border/40">
      <p className="text-xs font-bold text-white mb-3">Head-to-Head Lookup</p>
      <div className="flex items-center gap-2 mb-4">
        <select value={home} onChange={e => setHome(e.target.value)} className={selectCls}>
          <option value="">Home team</option>
          {NBA_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="text-muted-foreground text-xs shrink-0">vs</span>
        <select value={away} onChange={e => setAway(e.target.value)} className={selectCls}>
          <option value="">Away team</option>
          {NBA_TEAMS.filter(t => t !== home).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {home && away ? (
        <div className="text-center py-6 text-muted-foreground text-xs border border-border/40 rounded-xl bg-muted/20">
          H2H history for <span className="text-white font-medium">{home}</span> vs <span className="text-white font-medium">{away}</span> will display here when connected to a historical stats source.
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground/50 text-center">Select both teams to see head-to-head history</p>
      )}
    </div>
  );
};

export const NBAStats = () => (
  <div className="py-3">
    <div className="px-4 pb-2">
      <p className="text-sm font-bold text-white">Team Rankings</p>
      <p className="text-[10px] text-muted-foreground">All 30 teams · click column to sort</p>
    </div>
    <TeamRankings />
    <div className="px-4 pt-4 pb-2 border-t border-border/40 mt-4">
      <p className="text-sm font-bold text-white">Season Leaders</p>
      <p className="text-[10px] text-muted-foreground">Top 10 per statistical category</p>
    </div>
    <SeasonLeaders />
    <H2HLookup />
  </div>
);
