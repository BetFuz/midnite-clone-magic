import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, ChevronRight, Users } from 'lucide-react';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { toast } from 'sonner';
import { LEAGUE_LOGOS } from '@/utils/teamLogos';
import { cn } from '@/lib/utils';

/* ── ESPN player headshot CDNs ───────────────────────────── */
const ESPN_PLAYER_SOCCER = (id: number) =>
  `https://a.espncdn.com/i/headshots/soccer/players/full/${id}.png`;
const ESPN_PLAYER_NBA = (id: number) =>
  `https://a.espncdn.com/i/headshots/nba/players/full/${id}.png`;
const ESPN_TEAM_SOCCER = (id: number) =>
  `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`;
const ESPN_NBA_TEAM = (abbr: string) =>
  `https://a.espncdn.com/i/teamlogos/nba/500/${abbr}.png`;

interface FlashOdd {
  id: string;
  sport: 'football' | 'basketball' | 'tennis' | 'boxing';
  homeTeam: string;
  awayTeam: string;
  homeTeamLogoUrl: string;
  awayTeamLogoUrl: string;
  league: string;
  selection: string;
  selectionShort: string;
  normalOdds: number;
  flashOdds: number;
  expiresAt: Date;
  takenCount: number;
  totalSlots: number;
  /* Hero player photo — transparent PNG cut-out */
  playerPhotoUrl: string;
  playerName: string;
  /* Card colour theme */
  gradFrom: string;
  gradTo: string;
  accentColor: string;   /* hex for inline top-border */
}

const FLASH_DATA: FlashOdd[] = [
  /* 1 — Man City vs Arsenal · Haaland */
  {
    id: 'flash1',
    sport: 'football',
    homeTeam: 'Man City', awayTeam: 'Arsenal',
    homeTeamLogoUrl: ESPN_TEAM_SOCCER(382),
    awayTeamLogoUrl: ESPN_TEAM_SOCCER(359),
    league: 'Premier League',
    selection: 'Man City to Win',
    selectionShort: 'Home Win',
    normalOdds: 2.10, flashOdds: 3.20,
    expiresAt: new Date(Date.now() + 14 * 60 * 1000 + 37 * 1000),
    takenCount: 843, totalSlots: 1000,
    playerPhotoUrl: ESPN_PLAYER_SOCCER(4319051),  /* Haaland */
    playerName: 'Haaland',
    gradFrom: '#1a3a6e', gradTo: '#0d1117',
    accentColor: '#6cbbf7',
  },
  /* 2 — Barca vs Real · Vinicius */
  {
    id: 'flash2',
    sport: 'football',
    homeTeam: 'Barcelona', awayTeam: 'Real Madrid',
    homeTeamLogoUrl: ESPN_TEAM_SOCCER(83),
    awayTeamLogoUrl: ESPN_TEAM_SOCCER(86),
    league: 'La Liga',
    selection: 'Both Teams Score',
    selectionShort: 'BTTS',
    normalOdds: 1.75, flashOdds: 2.50,
    expiresAt: new Date(Date.now() + 7 * 60 * 1000 + 12 * 1000),
    takenCount: 612, totalSlots: 750,
    playerPhotoUrl: ESPN_PLAYER_SOCCER(4316875),  /* Vinicius Jr */
    playerName: 'Vinícius Jr',
    gradFrom: '#7f1d1d', gradTo: '#0d1117',
    accentColor: '#fbbf24',
  },
  /* 3 — NBA Playoffs · Giannis */
  {
    id: 'flash3',
    sport: 'basketball',
    homeTeam: 'Milwaukee', awayTeam: 'Boston',
    homeTeamLogoUrl: ESPN_NBA_TEAM('mil'),
    awayTeamLogoUrl: ESPN_NBA_TEAM('bos'),
    league: 'NBA',
    selection: 'Bucks to Win',
    selectionShort: 'Home Win',
    normalOdds: 2.40, flashOdds: 3.60,
    expiresAt: new Date(Date.now() + 19 * 60 * 1000 + 44 * 1000),
    takenCount: 1024, totalSlots: 1500,
    playerPhotoUrl: ESPN_PLAYER_NBA(3032977),  /* Giannis */
    playerName: 'Giannis',
    gradFrom: '#14532d', gradTo: '#0d1117',
    accentColor: '#4ade80',
  },
  /* 4 — NBA · Luka Doncic */
  {
    id: 'flash4',
    sport: 'basketball',
    homeTeam: 'Dallas', awayTeam: 'Oklahoma City',
    homeTeamLogoUrl: ESPN_NBA_TEAM('dal'),
    awayTeamLogoUrl: ESPN_NBA_TEAM('okc'),
    league: 'NBA',
    selection: 'Luka 30+ Points',
    selectionShort: 'Player Prop',
    normalOdds: 1.90, flashOdds: 2.80,
    expiresAt: new Date(Date.now() + 31 * 60 * 1000),
    takenCount: 778, totalSlots: 1000,
    playerPhotoUrl: ESPN_PLAYER_NBA(3945274),  /* Luka Doncic */
    playerName: 'Luka Dončić',
    gradFrom: '#1e3a5f', gradTo: '#0d1117',
    accentColor: '#60a5fa',
  },
  /* 5 — Liverpool vs Chelsea · Salah */
  {
    id: 'flash5',
    sport: 'football',
    homeTeam: 'Liverpool', awayTeam: 'Chelsea',
    homeTeamLogoUrl: ESPN_TEAM_SOCCER(364),
    awayTeamLogoUrl: ESPN_TEAM_SOCCER(363),
    league: 'Premier League',
    selection: 'Over 2.5 Goals',
    selectionShort: 'Over 2.5',
    normalOdds: 1.85, flashOdds: 2.75,
    expiresAt: new Date(Date.now() + 22 * 60 * 1000 + 55 * 1000),
    takenCount: 389, totalSlots: 500,
    playerPhotoUrl: ESPN_PLAYER_SOCCER(131062),  /* Salah */
    playerName: 'Salah',
    gradFrom: '#7f1d1d', gradTo: '#0d1117',
    accentColor: '#f87171',
  },
  /* 6 — Bayern vs Dortmund · Kane */
  {
    id: 'flash6',
    sport: 'football',
    homeTeam: 'Bayern', awayTeam: 'Dortmund',
    homeTeamLogoUrl: ESPN_TEAM_SOCCER(132),
    awayTeamLogoUrl: ESPN_TEAM_SOCCER(124),
    league: 'Bundesliga',
    selection: 'Bayern Win & Kane Scores',
    selectionShort: 'Home Win + BTTS',
    normalOdds: 2.20, flashOdds: 3.50,
    expiresAt: new Date(Date.now() + 38 * 60 * 1000),
    takenCount: 334, totalSlots: 600,
    playerPhotoUrl: ESPN_PLAYER_SOCCER(203460),  /* Harry Kane */
    playerName: 'Kane',
    gradFrom: '#7f1d1d', gradTo: '#1c1917',
    accentColor: '#ef4444',
  },
];

/* ── Countdown hook ──────────────────────────────────────── */
function useCountdowns(data: FlashOdd[]) {
  const [times, setTimes] = useState<Record<string, number>>({});
  useEffect(() => {
    const tick = () => {
      const next: Record<string, number> = {};
      data.forEach(o => {
        next[o.id] = Math.max(0, Math.floor((o.expiresAt.getTime() - Date.now()) / 1000));
      });
      setTimes(next);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data]);
  return times;
}

function mm_ss(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
function boostPct(n: number, f: number) {
  return Math.round(((f - n) / n) * 100);
}

/* ── Single Flash Card ───────────────────────────────────── */
function FlashCard({ odd, remaining, onAdd }: {
  odd: FlashOdd;
  remaining: number;
  onAdd: () => void;
}) {
  const isExpired = remaining <= 0;
  const isUrgent  = !isExpired && remaining < 3 * 60;
  const leagueLogo = LEAGUE_LOGOS[odd.league];
  const boost = boostPct(odd.normalOdds, odd.flashOdds);
  const slotsPct = odd.takenCount / odd.totalSlots;
  const slotsLeft = odd.totalSlots - odd.takenCount;

  const accent = isExpired ? '#555' : isUrgent ? '#ef4444' : odd.accentColor;

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden border transition-all duration-300 flex-shrink-0 w-[168px] md:w-auto cursor-pointer",
        isExpired  ? "opacity-50 grayscale border-border"
        : isUrgent ? "border-red-500/60 shadow-[0_0_28px_rgba(239,68,68,0.3)]"
                   : "border-white/10 hover:border-white/25 hover:shadow-[0_4px_32px_rgba(0,0,0,0.5)]"
      )}
      style={{ background: `linear-gradient(155deg, ${odd.gradFrom} 0%, ${odd.gradTo} 100%)` }}
    >
      {/* ── Accent top border ── */}
      <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

      {/* ── Player photo — full-bleed right-anchored cut-out ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {/* Colour wash */}
        <div
          className="absolute inset-0 opacity-25"
          style={{ background: `radial-gradient(ellipse at 80% 40%, ${odd.accentColor}60, transparent 70%)` }}
        />
        {/* Player PNG */}
        <img
          src={odd.playerPhotoUrl}
          alt={odd.playerName}
          className="absolute bottom-0 right-0 h-[85%] w-auto object-contain object-bottom"
          style={{ filter: isExpired ? 'grayscale(1)' : 'drop-shadow(0 0 18px rgba(0,0,0,0.9))' }}
          onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
        />
        {/* Left-side content gradient — keeps text readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        {/* Bottom gradient for CTA area */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
      </div>

      {/* ── Content layer ── */}
      <div className="relative flex flex-col h-[268px] p-3">

        {/* Row 1 — League + Timer */}
        <div className="flex items-center justify-between mb-auto">
          <div className="flex items-center gap-1.5">
            {leagueLogo
              ? <img src={leagueLogo} alt={odd.league} className="w-4 h-4 object-contain shrink-0" />
              : <span className="text-xs">⚽</span>
            }
            <span className="text-[9px] text-white/60 font-semibold truncate max-w-[60px]">{odd.league}</span>
          </div>

          <div className={cn(
            "flex items-center gap-0.5 text-[10px] font-black tabular-nums px-2 py-0.5 rounded-full",
            isExpired ? "bg-white/10 text-white/30"
            : isUrgent ? "bg-red-500/30 text-red-400 animate-pulse"
                       : "bg-black/50 text-yellow-400 border border-yellow-500/30"
          )}>
            <Clock className="w-2.5 h-2.5 shrink-0" />
            {isExpired ? "END" : mm_ss(remaining)}
          </div>
        </div>

        {/* Player name chip — floats in middle */}
        <div className="mt-2 mb-auto">
          <span
            className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-black"
            style={{ background: accent }}
          >
            {odd.playerName}
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center gap-1.5 mt-auto mb-1">
          <img
            src={odd.homeTeamLogoUrl}
            alt={odd.homeTeam}
            className="w-4 h-4 object-contain shrink-0"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="text-[10px] font-bold text-white truncate">{odd.homeTeam}</span>
          <span className="text-[9px] text-white/30 shrink-0">vs</span>
          <img
            src={odd.awayTeamLogoUrl}
            alt={odd.awayTeam}
            className="w-4 h-4 object-contain shrink-0"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        {/* Selection */}
        <p className="text-[10px] text-white/70 font-semibold mb-2 truncate">{odd.selection}</p>

        {/* Odds row */}
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-[9px] text-white/30 line-through tabular-nums block leading-none">{odd.normalOdds.toFixed(2)}</span>
            <span
              className="text-[28px] font-black tabular-nums leading-none"
              style={{ color: isExpired ? '#555' : accent }}
            >
              {odd.flashOdds.toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-black"
              style={{ background: `linear-gradient(90deg, ${accent}, #f59e0b)` }}
            >
              ⚡ +{boost}%
            </span>
            {!isExpired && slotsLeft > 0 && (
              <span className="text-[8px] text-white/30 tabular-nums">{slotsLeft} left</span>
            )}
          </div>
        </div>

        {/* Slot bar */}
        {!isExpired && (
          <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${slotsPct * 100}%`,
                background: slotsPct > 0.8 ? '#ef4444' : slotsPct > 0.5 ? '#f59e0b' : '#22c55e',
              }}
            />
          </div>
        )}

        {/* CTA */}
        <button
          disabled={isExpired}
          onClick={onAdd}
          className={cn(
            "w-full py-2 rounded-xl text-xs font-black transition-all active:scale-95",
            isExpired ? "bg-white/5 text-white/20 cursor-not-allowed" : "text-black hover:brightness-110"
          )}
          style={!isExpired ? {
            background: isUrgent
              ? 'linear-gradient(90deg, #ef4444, #f97316)'
              : `linear-gradient(90deg, ${accent}, #f59e0b)`,
            boxShadow: isUrgent
              ? '0 2px 14px rgba(239,68,68,0.45)'
              : `0 2px 14px ${accent}55`,
          } : undefined}
        >
          {isExpired ? 'Ended' : `⚡ Grab ${odd.flashOdds.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */
const FlashOdds = () => {
  const { addSelection } = useBetSlip();
  const times = useCountdowns(FLASH_DATA);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeCount = FLASH_DATA.filter(o => (times[o.id] ?? 0) > 0).length;

  const handleAdd = (odd: FlashOdd) => {
    if ((times[odd.id] ?? 0) <= 0) {
      toast.error('Flash Odds Ended', { description: 'This deal has expired — check other offers!' });
      return;
    }
    const selectionType = odd.selection.toLowerCase().includes('away') ? 'away'
      : odd.selection.toLowerCase().includes('draw') ? 'draw' : 'home';
    addSelection({
      id: `flash-${odd.id}-${Date.now()}`,
      matchId: odd.id,
      homeTeam: odd.homeTeam,
      awayTeam: odd.awayTeam,
      sport: odd.sport === 'basketball' ? 'Basketball' : 'Football',
      league: odd.league,
      selectionType,
      selectionValue: `${odd.selection} · Flash ${odd.flashOdds}`,
      odds: odd.flashOdds,
      matchTime: odd.expiresAt.toISOString(),
    });
    toast.success('⚡ Flash Odds locked in!', {
      description: `${odd.homeTeam} vs ${odd.awayTeam} · ${odd.selectionShort} @ ${odd.flashOdds}`,
    });
  };

  return (
    <div className="mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 opacity-40 animate-pulse" />
            <div className="relative w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-black fill-black" />
            </div>
          </div>
          <h2 className="text-sm font-black text-foreground tracking-tight">Flash Odds</h2>
          {activeCount > 0 && (
            <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30 text-[9px] font-bold px-1.5 tabular-nums">
              {activeCount} live
            </Badge>
          )}
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[9px] font-black border-0 px-1.5 animate-pulse">
            LIMITED
          </Badge>
        </div>
        <button className="text-xs text-primary flex items-center gap-0.5 hover:underline shrink-0">
          All Boosts <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Horizontal scroll — cards are taller portrait style */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
      >
        {FLASH_DATA.map(odd => (
          <div key={odd.id} className="snap-start shrink-0 w-[168px]">
            <FlashCard
              odd={odd}
              remaining={times[odd.id] ?? 0}
              onAdd={() => handleAdd(odd)}
            />
          </div>
        ))}
      </div>

      <p className="text-[9px] text-muted-foreground/40 text-center mt-1.5">
        ← swipe · limited slots · refreshed hourly →
      </p>
    </div>
  );
};

export default FlashOdds;
