import { Tv2, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { EspnEvent } from "@/lib/espn";
import { Match } from "@/hooks/useLeagueMatches";
import { SGPLeg } from "./NBAOddsRow";
import { NBAGameCard } from "./NBAGameCard";

function normTeam(s: string) {
  return s.toLowerCase().replace(/\s+(jr\.|sr\.|ii|iii|iv)\.?$/i, "").trim();
}

function findEspnGame(events: EspnEvent[], home: string, away: string) {
  const h = normTeam(home), a = normTeam(away);
  return events.find(e => {
    const eh = normTeam(e.homeTeam.name), ea = normTeam(e.awayTeam.name);
    return (eh.includes(h) || h.includes(eh)) && (ea.includes(a) || a.includes(ea));
  });
}

interface DateGroup { label: string; matches: Match[] }

interface NBAFixturesProps {
  matches: Match[];
  espnEvents: EspnEvent[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  sgpMap: Map<string, Set<string>>;
  onSGPToggle: (gameId: string, leg: SGPLeg) => void;
}

export const NBAFixtures = ({
  matches, espnEvents, isLoading, isError, refetch, sgpMap, onSGPToggle,
}: NBAFixturesProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center py-12 gap-3">
        <p className="text-sm text-muted-foreground">Could not load games</p>
        <button
          onClick={refetch}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 rounded px-3 py-1.5 hover:bg-primary/10"
        >
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <Tv2 className="w-7 h-7 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-semibold">No upcoming NBA games</p>
        <p className="text-xs text-muted-foreground">Check back closer to the next game day</p>
      </div>
    );
  }

  const grouped = matches.reduce<Record<string, DateGroup>>((acc, m) => {
    const d = new Date(m.commence_time);
    const key = format(d, "yyyy-MM-dd");
    const diff = Math.floor((d.getTime() - Date.now()) / 86400000);
    if (!acc[key]) acc[key] = {
      label: diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : format(d, "EEEE d MMMM yyyy"),
      matches: [],
    };
    acc[key].matches.push(m);
    return acc;
  }, {});

  for (const g of Object.values(grouped)) {
    g.matches.sort((a, b) => {
      const ea = findEspnGame(espnEvents, a.home_team, a.away_team);
      const eb = findEspnGame(espnEvents, b.home_team, b.away_team);
      const aLive = ea?.status.type.name === "STATUS_IN_PROGRESS" ? 0 : 1;
      const bLive = eb?.status.type.name === "STATUS_IN_PROGRESS" ? 0 : 1;
      return aLive - bLive;
    });
  }

  return (
    <div className="px-3 md:px-4 py-3">
      {Object.entries(grouped).map(([key, group]) => (
        <div key={key} className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{group.label}</span>
            <span className="text-[10px] text-muted-foreground/50">· {group.matches.length} game{group.matches.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {group.matches.map(m => (
              <NBAGameCard
                key={m.id}
                match={m}
                espn={findEspnGame(espnEvents, m.home_team, m.away_team)}
                sgpKeys={sgpMap.get(m.match_id) ?? new Set()}
                onSGPToggle={onSGPToggle}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
