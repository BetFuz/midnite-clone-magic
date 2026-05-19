import { useAllLiveScores } from "@/hooks/useEspnScoreboard";
import { EspnEvent, ESPN_LEAGUES } from "@/lib/espn";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const REVERSE_LEAGUES: Record<string, string> = Object.fromEntries(
  Object.entries(ESPN_LEAGUES).map(([name, slug]) => [slug, name])
);

function TickerMatch({ event }: { event: EspnEvent }) {
  const navigate = useNavigate();
  const { homeTeam, awayTeam, status } = event;
  const clock = status.displayClock;
  const isLive = status.type.name === "STATUS_IN_PROGRESS";

  const open = () => {
    const league = REVERSE_LEAGUES[event.leagueSlug] ?? event.leagueName;
    navigate(`/match/${event.id}?league=${encodeURIComponent(league)}&espn=1`);
  };

  return (
    <button
      onClick={open}
      className="flex items-center gap-2 px-4 py-1 border-r border-white/10 hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
    >
      {isLive && (
        <span className="text-[9px] font-bold text-red-400 bg-red-500/20 px-1 rounded animate-pulse">LIVE</span>
      )}
      <span className="text-[10px] text-white/60">{clock}&apos;</span>
      <span className="text-[11px] font-semibold text-white">{homeTeam.abbreviation}</span>
      <span className={cn(
        "text-sm font-bold tabular-nums",
        isLive ? "text-yellow-400" : "text-white"
      )}>
        {homeTeam.score ?? "0"} – {awayTeam.score ?? "0"}
      </span>
      <span className="text-[11px] font-semibold text-white">{awayTeam.abbreviation}</span>
    </button>
  );
}

export default function LiveTicker() {
  const { data: events = [], isLoading } = useAllLiveScores();

  if (isLoading || !events.length) return null;

  // Duplicate for seamless loop
  const items = [...events, ...events];

  return (
    <div className="bg-[#0d1117] border-b border-white/5 overflow-hidden h-8 flex items-center">
      <div className="flex items-center shrink-0 px-3 border-r border-white/10 h-full">
        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">● Live</span>
      </div>
      <div className="overflow-hidden flex-1">
        <div
          className="flex animate-ticker"
          style={{ width: "max-content" }}
        >
          {items.map((ev, i) => (
            <TickerMatch key={`${ev.id}-${i}`} event={ev} />
          ))}
        </div>
      </div>
    </div>
  );
}
