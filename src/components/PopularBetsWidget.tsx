import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Clock, Flame } from 'lucide-react';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { toast } from 'sonner';
import TeamBadge from '@/components/TeamBadge';
import { LEAGUE_LOGOS } from '@/utils/teamLogos';
import { cn } from '@/lib/utils';

interface PopularBet {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  selection: string;
  odds: number;
  percentage: number;
  betCount: number;
  timeRemaining: string;
  hot?: boolean;
}

const POPULAR_BETS: PopularBet[] = [
  {
    id: 'pb1',
    homeTeam: 'Manchester City',
    awayTeam: 'Arsenal',
    league: 'Premier League',
    selection: 'Home Win',
    odds: 2.10,
    percentage: 78,
    betCount: 12453,
    timeRemaining: '2h 15m',
    hot: true,
  },
  {
    id: 'pb2',
    homeTeam: 'Barcelona',
    awayTeam: 'Real Madrid',
    league: 'La Liga',
    selection: 'Both Teams to Score',
    odds: 1.70,
    percentage: 85,
    betCount: 18721,
    timeRemaining: '5h 30m',
    hot: true,
  },
  {
    id: 'pb3',
    homeTeam: 'Liverpool',
    awayTeam: 'Chelsea',
    league: 'Premier League',
    selection: 'Over 2.5 Goals',
    odds: 1.85,
    percentage: 72,
    betCount: 9842,
    timeRemaining: '1h 45m',
  },
  {
    id: 'pb4',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    league: 'Bundesliga',
    selection: 'Home Win',
    odds: 1.65,
    percentage: 81,
    betCount: 14235,
    timeRemaining: '3h 20m',
  },
];

function formatCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function TrendingBar({ pct, hot }: { pct: number; hot?: boolean }) {
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all",
          hot ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-primary"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ── Single trending card — SportyBet style ──────────────── */
function TrendingCard({ bet }: { bet: PopularBet }) {
  const { addSelection } = useBetSlip();
  const leagueLogo = LEAGUE_LOGOS[bet.league];

  const handleAdd = () => {
    const selectionType =
      bet.selection.toLowerCase().includes('away') ? 'away' :
      bet.selection.toLowerCase().includes('draw') ? 'draw' : 'home';

    addSelection({
      id: `trending-${bet.id}-${Date.now()}`,
      matchId: bet.id,
      homeTeam: bet.homeTeam,
      awayTeam: bet.awayTeam,
      sport: 'Football',
      league: bet.league,
      selectionType,
      selectionValue: bet.selection,
      odds: bet.odds,
      matchTime: new Date(Date.now() + Math.random() * 86400000).toISOString(),
    });
    toast.success('Added to Bet Slip!', {
      description: `${bet.homeTeam} vs ${bet.awayTeam} · ${bet.selection}`,
    });
  };

  return (
    <div className={cn(
      "relative rounded-xl overflow-hidden border bg-card transition-all hover:border-primary/40 group",
      bet.hot ? "border-orange-500/30" : "border-border"
    )}>
      {/* Hot shimmer top bar */}
      {bet.hot && (
        <div className="h-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500" />
      )}

      <div className="p-3 flex items-center gap-3">

        {/* Left: league logo + teams */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Team logos stacked */}
          <div className="relative shrink-0 w-10">
            <TeamBadge name={bet.homeTeam} size={26} className="absolute top-0 left-0 ring-2 ring-background rounded-full" />
            <TeamBadge name={bet.awayTeam} size={26} className="absolute top-3 left-3 ring-2 ring-background rounded-full" />
            <div className="h-[42px]" />
          </div>

          {/* Match info */}
          <div className="flex-1 min-w-0">
            {/* League */}
            <div className="flex items-center gap-1 mb-0.5">
              {leagueLogo
                ? <img src={leagueLogo} alt={bet.league} className="w-3 h-3 object-contain shrink-0" />
                : null
              }
              <span className="text-[9px] text-muted-foreground truncate">{bet.league}</span>
              {bet.hot && (
                <Flame className="w-2.5 h-2.5 text-orange-500 shrink-0" />
              )}
            </div>

            {/* Teams */}
            <p className="text-xs font-bold truncate leading-tight">
              {bet.homeTeam} <span className="text-muted-foreground font-normal">vs</span> {bet.awayTeam}
            </p>

            {/* Selection pill */}
            <span className={cn(
              "inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5",
              bet.hot
                ? "bg-orange-500/15 text-orange-400"
                : "bg-primary/10 text-primary"
            )}>
              {bet.selection}
            </span>

            {/* Popularity bar */}
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <Users className="w-2.5 h-2.5" />
                  <span>{formatCount(bet.betCount)} bets</span>
                </div>
                <span className={cn(
                  "text-[9px] font-bold",
                  bet.percentage >= 80 ? "text-orange-400" : "text-primary"
                )}>
                  {bet.percentage}% backing
                </span>
              </div>
              <TrendingBar pct={bet.percentage} hot={bet.hot} />
            </div>
          </div>
        </div>

        {/* Right: odds + add button */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <Clock className="w-2.5 h-2.5" />
            <span>{bet.timeRemaining}</span>
          </div>
          <button
            onClick={handleAdd}
            className={cn(
              "flex flex-col items-center justify-center w-[58px] h-12 rounded-xl border transition-all active:scale-95",
              bet.hot
                ? "bg-orange-500/10 border-orange-500/40 hover:bg-orange-500/20"
                : "bg-muted border-border hover:bg-primary/10 hover:border-primary"
            )}
          >
            <span className="text-[8px] text-muted-foreground leading-none">odds</span>
            <span className={cn(
              "text-base font-black tabular-nums leading-tight",
              bet.hot ? "text-orange-400" : "text-primary"
            )}>
              {bet.odds.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main widget ─────────────────────────────────────────── */
const PopularBetsWidget = () => (
  <div className="space-y-2">
    {POPULAR_BETS.map(bet => (
      <TrendingCard key={bet.id} bet={bet} />
    ))}
    <p className="text-[10px] text-muted-foreground text-center pt-1">
      Updated live · Based on real bettor activity
    </p>
  </div>
);

export default PopularBetsWidget;
