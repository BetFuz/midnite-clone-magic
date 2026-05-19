import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Activity } from "lucide-react";
import { Link } from "react-router-dom";

interface LiveEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: string;
  sport: string;
  league: string;
}

export const LiveScoreTicker = () => {
  const { data: events = [] } = useQuery<LiveEvent[]>({
    queryKey: ["live-ticker"],
    queryFn: async () => {
      const { data } = await api.get("/sports/events/live", { params: { limit: 20 } });
      return data.data ?? data.events ?? [];
    },
    refetchInterval: 20_000,
    staleTime: 10_000,
  });

  if (!events.length) return null;

  // Duplicate for seamless loop
  const items = [...events, ...events];

  return (
    <div className="bg-card border-b border-border py-1.5 -mx-4 px-4 md:mx-0 md:px-0 mb-4 overflow-hidden">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 flex-shrink-0 pr-2 border-r border-border">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <Activity className="w-3 h-3 text-red-400" />
          <span className="text-[10px] font-bold text-red-400 uppercase">Live</span>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide" style={{ maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)" }}>
          <div className="flex gap-6 animate-[ticker_30s_linear_infinite]" style={{ animationPlayState: "running" }}>
            {items.map((ev, i) => (
              <Link
                key={`${ev.id}-${i}`}
                to="/live"
                className="flex items-center gap-1.5 flex-shrink-0 text-[11px] hover:text-primary transition-colors"
              >
                <span className="font-semibold text-foreground">{ev.homeTeam}</span>
                <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[12px] tabular-nums">
                  {ev.homeScore} - {ev.awayScore}
                </span>
                <span className="font-semibold text-foreground">{ev.awayTeam}</span>
                <span className="text-red-400 text-[10px]">{ev.minute}'</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
