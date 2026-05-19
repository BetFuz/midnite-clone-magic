import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { TrendingUp, Activity, ChevronDown, ChevronRight } from "lucide-react";
import GameFlowBar from "./GameFlowBar";
import LiveStats from "./LiveStats";
import MatchEventsTimeline from "./MatchEventsTimeline";
import ExpandedLiveMarkets from "./ExpandedLiveMarkets";
import TeamBadge from "@/components/TeamBadge";
import { LEAGUE_LOGOS } from "@/utils/teamLogos";
import { cn } from "@/lib/utils";

interface LiveMatchCardProps {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: string;
  homeOdds: number;
  drawOdds: number | null;
  awayOdds: number;
  possession?: { home: number; away: number } | null;
  shots?: { home: number; away: number } | null;
  corners?: { home: number; away: number } | null;
  trending?: boolean;
}

const LiveMatchCard = ({
  id, sport, league, homeTeam, awayTeam,
  homeScore, awayScore, minute,
  homeOdds, drawOdds, awayOdds,
  possession, shots, corners, trending,
}: LiveMatchCardProps) => {
  const { addSelection } = useBetSlip();
  const navigate = useNavigate();
  const [showStats, setShowStats]     = useState(false);
  const [showMarkets, setShowMarkets] = useState(false);
  const [showEvents, setShowEvents]   = useState(false);

  const leagueLogo = LEAGUE_LOGOS[league];

  const bet = (type: "home" | "away" | "draw", val: string, odds: number) => {
    addSelection({
      id: `${id}-${type}`,
      matchId: id,
      sport, league, homeTeam, awayTeam,
      selectionType: type,
      selectionValue: val,
      odds,
      matchTime: `LIVE - ${minute}`,
    });
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-border bg-card hover:border-red-500/40 transition-all cursor-pointer group"
      onClick={() => navigate(`/match/${id}?home=${encodeURIComponent(homeTeam)}&away=${encodeURIComponent(awayTeam)}&league=${encodeURIComponent(league)}`)}
    >
      {/* Top live pulse bar */}
      <div className="h-0.5 bg-gradient-to-r from-red-500 via-orange-400 to-red-500 animate-pulse" />

      {/* League header */}
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
        {leagueLogo
          ? <img src={leagueLogo} alt={league} className="w-4 h-4 object-contain shrink-0" />
          : <span className="text-sm">{sport === "Football" ? "⚽" : sport === "Basketball" ? "🏀" : "🎯"}</span>
        }
        <span className="text-[10px] text-muted-foreground truncate flex-1">{league}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {trending && (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[9px] px-1.5 py-0 gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> Hot
            </Badge>
          )}
          <Badge className="bg-red-500/15 text-red-400 border-red-500/20 text-[9px] px-1.5 py-0 animate-pulse gap-0.5">
            <span className="w-1 h-1 bg-red-500 rounded-full" />
            {minute}'
          </Badge>
          <button
            onClick={e => { e.stopPropagation(); setShowStats(s => !s); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Teams — SportyBet layout: logo + name left, score right */}
      <div className="px-3 pb-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <TeamBadge name={homeTeam} size={28} />
          <span className="text-sm font-bold truncate flex-1">{homeTeam}</span>
          <span className="text-xl font-black text-yellow-400 tabular-nums shrink-0">{homeScore}</span>
        </div>
        <div className="flex items-center gap-2">
          <TeamBadge name={awayTeam} size={28} />
          <span className="text-sm font-semibold text-muted-foreground truncate flex-1">{awayTeam}</span>
          <span className="text-xl font-black text-yellow-400/70 tabular-nums shrink-0">{awayScore}</span>
        </div>
      </div>

      {/* Possession bar */}
      {possession && (
        <div className="px-3">
          <GameFlowBar
            homePossession={possession.home}
            awayPossession={possession.away}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />
        </div>
      )}

      {/* Collapsible stats */}
      {showStats && (shots || corners) && (
        <div className="px-3 pb-2">
          <LiveStats possession={possession} shots={shots} corners={corners} />
        </div>
      )}

      {/* Match events */}
      {showEvents && sport === "Football" && (
        <div className="px-3 pb-2">
          <MatchEventsTimeline homeTeam={homeTeam} awayTeam={awayTeam} />
        </div>
      )}

      {/* Expanded markets */}
      {showMarkets && (
        <div className="px-3 pb-2">
          <ExpandedLiveMarkets matchId={id} sport={sport} league={league} homeTeam={homeTeam} awayTeam={awayTeam} />
        </div>
      )}

      {/* Odds row */}
      <div className="grid grid-cols-3 gap-px bg-border border-t border-border" onClick={e => e.stopPropagation()}>
        {[
          { label: "1", type: "home" as const, val: homeTeam, odds: homeOdds },
          ...(drawOdds ? [{ label: "X", type: "draw" as const, val: "Draw", odds: drawOdds }] : []),
          { label: "2", type: "away" as const, val: awayTeam, odds: awayOdds },
        ].map(btn => (
          <button
            key={btn.type}
            onClick={() => bet(btn.type, btn.val, btn.odds)}
            className={cn(
              "flex flex-col items-center py-2 bg-card hover:bg-primary/10 transition-colors",
              !drawOdds && btn.type === "away" && "col-span-1"
            )}
          >
            <span className="text-[9px] text-muted-foreground leading-none">{btn.label}</span>
            <span className="text-sm font-bold text-primary tabular-nums">{btn.odds.toFixed(2)}</span>
          </button>
        ))}
        {!drawOdds && <div className="bg-card" />}
      </div>

      {/* Footer actions */}
      <div className="flex border-t border-border/40" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setShowEvents(s => !s)}
          className="flex-1 py-1.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border-r border-border/40"
        >
          {showEvents ? "Hide" : "Match"} Events
        </button>
        <button
          onClick={() => setShowMarkets(s => !s)}
          className="flex-1 py-1.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors flex items-center justify-center gap-0.5"
        >
          {showMarkets ? "Hide" : "More"} Markets
          <ChevronDown className={cn("w-2.5 h-2.5 transition-transform", showMarkets && "rotate-180")} />
        </button>
        <button
          onClick={() => navigate(`/match/${id}?home=${encodeURIComponent(homeTeam)}&away=${encodeURIComponent(awayTeam)}&league=${encodeURIComponent(league)}`)}
          className="flex-1 py-1.5 text-[10px] text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-0.5 border-l border-border/40"
        >
          Match Centre <ChevronRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};

export default LiveMatchCard;
