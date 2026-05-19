import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNBAStandings } from "@/hooks/useNBAStandings";
import { useNBALeaders } from "@/hooks/useNBALeaders";
import { NBAStandingEntry } from "@/lib/espn";

function seedColor(rank: number) {
  if (rank <= 6) return "border-l-[#00b15c]";
  if (rank <= 8) return "border-l-orange-400";
  if (rank <= 10) return "border-l-yellow-400";
  return "border-l-transparent";
}

function seedLabel(rank: number): string | null {
  if (rank <= 6) return null;
  if (rank <= 8) return "Play-In";
  if (rank <= 10) return "Bubble";
  return null;
}

const StandingsTable = ({ entries }: { entries: NBAStandingEntry[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs">
      <thead>
        <tr className="text-muted-foreground/60 border-b border-border/40">
          <th className="text-left py-2 pl-3 w-6">#</th>
          <th className="text-left py-2">Team</th>
          <th className="text-center py-2 w-10">W</th>
          <th className="text-center py-2 w-10">L</th>
          <th className="text-center py-2 w-12">PCT</th>
          <th className="text-center py-2 w-10">GB</th>
          <th className="text-center py-2 w-12">L10</th>
          <th className="text-center py-2 w-14">Streak</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(e => {
          const label = seedLabel(e.rank);
          return (
            <tr
              key={e.team.id}
              className={cn(
                "border-b border-border/20 hover:bg-muted/30 transition-colors border-l-2",
                seedColor(e.rank)
              )}
            >
              <td className="py-2 pl-3 text-muted-foreground/60">{e.rank}</td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  {e.team.logo ? (
                    <img src={e.team.logo} alt={e.team.name} className="w-5 h-5 object-contain" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-[8px] font-bold">{e.team.abbreviation}</span>
                    </div>
                  )}
                  <span className="font-medium truncate max-w-[110px]">{e.team.name}</span>
                  {label && (
                    <span className="text-[8px] px-1 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
                      {label}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-2 text-center font-bold text-[#00b15c]">{e.wins}</td>
              <td className="py-2 text-center text-muted-foreground">{e.losses}</td>
              <td className="py-2 text-center">{e.pct.toFixed(3)}</td>
              <td className="py-2 text-center text-muted-foreground">{e.gamesBehind === 0 ? "—" : e.gamesBehind}</td>
              <td className="py-2 text-center">{e.last10}</td>
              <td className="py-2 text-center">
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[9px] font-bold",
                  e.streak.startsWith("W") ? "bg-[#00b15c]/10 text-[#00b15c]" : "bg-red-500/10 text-red-400"
                )}>
                  {e.streak}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const PlayoffPicture = ({ entries }: { entries: NBAStandingEntry[] }) => (
  <div className="px-4 py-3 border-t border-border/40">
    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Playoff Picture</p>
    <div className="flex flex-wrap gap-1.5">
      {entries.slice(0, 10).map(e => (
        <div
          key={e.team.id}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border",
            e.rank <= 6
              ? "bg-[#00b15c]/10 text-[#00b15c] border-[#00b15c]/20"
              : e.rank <= 8
              ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
          )}
        >
          <span className="text-[8px] opacity-60">{e.rank}</span>
          <span>{e.team.abbreviation}</span>
          {e.rank >= 7 && e.rank <= 10 && <span className="text-[8px] opacity-70">PI</span>}
        </div>
      ))}
    </div>
  </div>
);

const LeadersPanel = () => {
  const { data: leaders } = useNBALeaders();
  const cats = [
    { key: "points" as const,   label: "Scoring",  unit: "PPG" },
    { key: "rebounds" as const, label: "Rebounds", unit: "RPG" },
    { key: "assists" as const,  label: "Assists",  unit: "APG" },
  ];

  return (
    <div className="px-4 py-4 border-t border-border/40">
      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-3">Conference Leaders</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cats.map(({ key, label, unit }) => (
          <div key={key}>
            <p className="text-xs font-bold text-white mb-2">{label}</p>
            <div className="space-y-2">
              {(leaders?.[key] ?? []).slice(0, 5).map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground/50 w-3 shrink-0">{l.rank}</span>
                  {l.headshot ? (
                    <img src={l.headshot} alt={l.displayName} className="w-6 h-6 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-muted shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold truncate">{l.displayName}</p>
                    <p className="text-[9px] text-muted-foreground">{l.teamAbbr}</p>
                  </div>
                  <span className="text-xs font-black text-primary shrink-0">{l.value.toFixed(1)}</span>
                  <span className="text-[8px] text-muted-foreground/50">{unit}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const NBAStandings = () => {
  const [conf, setConf] = useState<"east" | "west">("east");
  const { data, isLoading } = useNBAStandings();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const entries = (conf === "east" ? data?.east : data?.west) ?? [];

  return (
    <div className="py-3">
      <div className="flex border-b border-border/40 px-4 mb-0">
        {(["east", "west"] as const).map(c => (
          <button
            key={c}
            onClick={() => setConf(c)}
            className={cn(
              "px-4 py-2 text-xs font-semibold capitalize border-b-2 transition-colors",
              conf === c ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {c === "east" ? "Eastern Conference" : "Western Conference"}
          </button>
        ))}
      </div>
      <StandingsTable entries={entries} />
      <PlayoffPicture entries={entries} />
      <LeadersPanel />
    </div>
  );
};
