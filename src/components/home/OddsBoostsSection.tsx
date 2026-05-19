import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api/client";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { Badge } from "@/components/ui/badge";
import { Zap, ChevronRight } from "lucide-react";
import TeamBadge from "@/components/TeamBadge";
import { LEAGUE_LOGOS } from "@/utils/teamLogos";
import { cn } from "@/lib/utils";

interface BoostMatch {
  id: string;
  match_id: string;
  home_team: string;
  away_team: string;
  league_name: string;
  sport_title: string;
  commence_time: string;
  home_odds: number | null;
  away_odds: number | null;
  draw_odds: number | null;
}

const BOOST_CONFIGS = [
  { selectionFn: (m: BoostMatch) => ({ team: m.home_team,  label: "to Win",        type: "home" as const, baseOdds: m.home_odds }),  boostMult: 1.18 },
  { selectionFn: (m: BoostMatch) => ({ team: m.away_team,  label: "to Win",        type: "away" as const, baseOdds: m.away_odds }),  boostMult: 1.22 },
  { selectionFn: (m: BoostMatch) => ({ team: "Both Teams", label: "To Score",      type: "home" as const, baseOdds: m.home_odds }),  boostMult: 1.14 },
  { selectionFn: (m: BoostMatch) => ({ team: m.home_team,  label: "or Draw",       type: "draw" as const, baseOdds: m.draw_odds ?? m.home_odds }), boostMult: 1.20 },
];

function boostedOdds(base: number, mult: number) {
  return parseFloat(Math.min(base * mult, base + 0.8).toFixed(2));
}

function pctGain(base: number, boosted: number) {
  return Math.round(((boosted - base) / base) * 100);
}

/* ── Single boost card — SportyBet style ─────────────────── */
function BoostCard({ match, configIdx }: { match: BoostMatch; configIdx: number }) {
  const { addSelection } = useBetSlip();
  const cfg   = BOOST_CONFIGS[configIdx % BOOST_CONFIGS.length];
  const sel   = cfg.selectionFn(match);
  const base  = sel.baseOdds ?? 2.0;
  const boost = boostedOdds(base, cfg.boostMult);
  const pct   = pctGain(base, boost);
  const leagueLogo = LEAGUE_LOGOS[match.league_name];

  const handleBet = () => addSelection({
    id: `boost-${match.id}-${configIdx}`,
    matchId: match.match_id,
    homeTeam: match.home_team,
    awayTeam: match.away_team,
    league: match.league_name,
    sport: match.sport_title,
    selectionType: sel.type,
    selectionValue: `${sel.team} ${sel.label} (Boosted)`,
    odds: boost,
    matchTime: match.commence_time,
  });

  return (
    <div className="relative rounded-xl overflow-hidden border border-orange-500/25 hover:border-orange-500/50 transition-all bg-card group">
      {/* Gradient accent bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-950/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/8 rounded-bl-full pointer-events-none" />

      <div className="relative p-3 space-y-2.5">

        {/* League row */}
        <div className="flex items-center gap-1.5">
          {leagueLogo
            ? <img src={leagueLogo} alt={match.league_name} className="w-3.5 h-3.5 object-contain shrink-0" />
            : <span className="w-3.5 h-3.5 rounded-full bg-orange-500/20 shrink-0" />
          }
          <span className="text-[10px] text-muted-foreground truncate flex-1">{match.league_name}</span>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[9px] px-1.5 py-0 font-bold shrink-0">
            +{pct}%
          </Badge>
        </div>

        {/* Teams — logo face-off */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <TeamBadge name={match.home_team} size={32} />
            <span className="text-[9px] text-center leading-tight text-muted-foreground line-clamp-1 w-full">
              {match.home_team}
            </span>
          </div>
          <span className="text-[10px] font-black text-zinc-500 shrink-0 px-1">VS</span>
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <TeamBadge name={match.away_team} size={32} />
            <span className="text-[9px] text-center leading-tight text-muted-foreground line-clamp-1 w-full">
              {match.away_team}
            </span>
          </div>
        </div>

        {/* Selection label */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-2 py-1.5 text-center">
          <p className="text-[11px] font-bold text-orange-300 leading-tight truncate">
            {sel.team} {sel.label}
          </p>
        </div>

        {/* Odds + boost badge */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <span className="text-[10px] text-muted-foreground line-through tabular-nums block">{base.toFixed(2)}</span>
            <span className="text-2xl font-black text-orange-400 tabular-nums leading-none">{boost.toFixed(2)}</span>
          </div>
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-[9px] border-0 shrink-0 self-center">
            ⚡ BOOSTED
          </Badge>
        </div>

        {/* CTA */}
        <button
          onClick={handleBet}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-black text-xs font-bold hover:brightness-110 active:scale-95 transition-all"
        >
          Add {boost.toFixed(2)} to Slip
        </button>
      </div>
    </div>
  );
}

/* ── Main section ─────────────────────────────────────────── */
export const OddsBoostsSection = () => {
  const { data: matches = [] } = useQuery<BoostMatch[]>({
    queryKey: ["boosts-matches"],
    queryFn: async () => {
      const { data } = await api.get("/sports/fixtures", {
        params: { league: "Premier League", days: 4 },
      });
      return (data.data ?? []).slice(0, 4);
    },
    staleTime: 15 * 60 * 1000,
  });

  if (!matches.length) return null;

  return (
    <div className="mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5 text-black" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Odds Boosts</h2>
          <Badge className={cn(
            "text-[9px] px-1.5 py-0 font-bold border-0",
            "bg-gradient-to-r from-orange-500 to-amber-500 text-black"
          )}>
            🔥 HOT
          </Badge>
        </div>
        <Link to="/promotions" className="text-xs text-primary flex items-center gap-0.5 hover:underline">
          View All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 2-col grid on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {matches.slice(0, 4).map((m, i) => (
          <BoostCard key={m.id} match={m} configIdx={i} />
        ))}
      </div>
    </div>
  );
};
