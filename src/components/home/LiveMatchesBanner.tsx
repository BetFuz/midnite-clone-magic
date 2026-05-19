import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api/client";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ChevronRight } from "lucide-react";
import TeamBadge from "@/components/TeamBadge";

interface LiveEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: string;
  league: string;
  sport: string;
  markets: Array<{ id: string; name: string; selections: Array<{ name: string; odds: number; oddsId: string }> }>;
}

const SportIcon: Record<string, string> = {
  football: "⚽", basketball: "🏀", tennis: "🎾", cricket: "🏏",
  rugby: "🏉", americanfootball: "🏈", mma: "🥊", default: "🏟",
};

export const LiveMatchesBanner = () => {
  const { addSelection } = useBetSlip();
  const navigate = useNavigate();
  const { data: events = [], isLoading } = useQuery<LiveEvent[]>({
    queryKey: ["live-events-home"],
    queryFn: async () => {
      const { data } = await api.get("/sports/events/live", { params: { limit: 8 } });
      return data.data ?? data.events ?? [];
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  if (isLoading || !events.length) return null;

  const getOdds = (ev: LiveEvent) => {
    const market = ev.markets?.[0];
    if (!market) return null;
    const home = market.selections.find(s => s.name === ev.homeTeam || s.name.toLowerCase().includes("home") || s.name === "1");
    const draw = market.selections.find(s => s.name === "Draw" || s.name === "X");
    const away = market.selections.find(s => s.name === ev.awayTeam || s.name.toLowerCase().includes("away") || s.name === "2");
    return { home, draw, away, market };
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
        </span>
        <h2 className="text-base font-bold text-foreground">LIVE NOW</h2>
        <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">{events.length}</Badge>
        <Link to="/live" className="ml-auto text-xs text-primary flex items-center gap-0.5 hover:underline">
          View All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
        {events.slice(0, 8).map(ev => {
          const odds = getOdds(ev);
          const icon = SportIcon[ev.sport?.toLowerCase().replace(/\s/g, '')] ?? SportIcon.default;
          return (
            <div
              key={ev.id}
              className="flex-shrink-0 w-[190px] bg-card border border-border rounded-xl overflow-hidden hover:border-red-500/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/match/${ev.id}?home=${encodeURIComponent(ev.homeTeam)}&away=${encodeURIComponent(ev.awayTeam)}&league=${encodeURIComponent(ev.league)}`)}
            >
              {/* League header */}
              <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
                <span className="text-[9px] text-muted-foreground truncate">{icon} {ev.league}</span>
                <Badge className="text-[8px] px-1 py-0 bg-red-500/20 text-red-400 border-red-500/30 leading-tight flex items-center gap-0.5">
                  <Activity className="w-2 h-2" />{ev.minute}'
                </Badge>
              </div>

              {/* Teams — SportyBet style: logo + name + score */}
              <div className="px-2.5 pb-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <TeamBadge name={ev.homeTeam} size={22} />
                  <span className="text-xs font-semibold truncate flex-1 leading-tight">{ev.homeTeam}</span>
                  <span className="text-base font-black text-yellow-400 tabular-nums shrink-0">{ev.homeScore}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TeamBadge name={ev.awayTeam} size={22} />
                  <span className="text-xs text-muted-foreground truncate flex-1 leading-tight">{ev.awayTeam}</span>
                  <span className="text-base font-black text-yellow-400 tabular-nums shrink-0">{ev.awayScore}</span>
                </div>
              </div>

              {/* Odds */}
              {odds && (
                <div className="grid grid-cols-3 gap-px bg-border" onClick={e => e.stopPropagation()}>
                  {[odds.home, odds.draw, odds.away].map((sel, i) => sel ? (
                    <button
                      key={i}
                      className="flex flex-col items-center py-1.5 bg-card hover:bg-primary/10 transition-colors"
                      onClick={() => addSelection({
                        id: `${ev.id}-${sel.name}`,
                        matchId: ev.id,
                        homeTeam: ev.homeTeam,
                        awayTeam: ev.awayTeam,
                        league: ev.league,
                        sport: ev.sport,
                        selectionType: i === 0 ? "home" : i === 1 ? "draw" : "away",
                        selectionValue: sel.name,
                        odds: sel.odds,
                        matchTime: `LIVE ${ev.minute}'`,
                      })}
                    >
                      <span className="text-[9px] text-muted-foreground leading-none">{["1", "X", "2"][i]}</span>
                      <span className="text-xs font-bold text-primary tabular-nums">{sel.odds.toFixed(2)}</span>
                    </button>
                  ) : <div key={i} className="bg-card" />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
