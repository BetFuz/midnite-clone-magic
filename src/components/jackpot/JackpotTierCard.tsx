import { useEffect, useState } from 'react';
import { TrendingUp, Users, Clock, Flame } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { JackpotRound } from '@/lib/api/jackpot';

const TIER_COLORS: Record<string, string> = { MINI: '#00b15c', MIDI: '#3b82f6', MEGA: '#f59e0b' };
const TIER_LABELS: Record<string, string> = { MINI: 'Mini Jackpot', MIDI: 'Midi Jackpot', MEGA: 'Mega Jackpot' };

interface Props {
  round: JackpotRound;
  isActive: boolean;
  onClick: () => void;
}

function formatPool(amount: number): string {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}K`;
  return `₦${amount.toLocaleString()}`;
}

function useCountdown(closesAt: string) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = new Date(closesAt).getTime() - Date.now();
      if (diff <= 0) { setLabel('Closed'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setLabel(d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [closesAt]);
  return label;
}

export function JackpotTierCard({ round, isActive, onClick }: Props) {
  const color = TIER_COLORS[round.tier] ?? '#00b15c';
  const countdown = useCountdown(round.closesAt);
  const growth = round.jackpot_matches[0]?.statsSnapshot?.poolGrowth ?? [20, 35, 45, 60, 72, 85, 100];
  const chartData = growth.map((v: number, i: number) => ({ v, i }));

  return (
    <div
      onClick={onClick}
      className="relative flex-shrink-0 w-52 rounded-2xl p-4 cursor-pointer transition-all duration-200"
      style={{
        background: `linear-gradient(135deg, ${color}18, ${color}08)`,
        border: isActive ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isActive ? `0 0 24px ${color}30` : 'none',
      }}
    >
      {round.rolloverWeeks > 0 && (
        <div
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: color, color: '#000' }}
        >
          <Flame className="w-3 h-3" />
          ROLLOVER
        </div>
      )}

      <div className="text-xs font-bold mb-1" style={{ color }}>{TIER_LABELS[round.tier]}</div>
      <div className="text-2xl font-black text-white mb-0.5">{formatPool(round.poolAmount)}</div>
      <div className="text-[10px] text-gray-500 mb-3">Min {formatPool(round.guaranteedMin)}</div>

      <div className="h-10 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`grad-${round.tier}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#grad-${round.tier})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1 text-[11px]">
        <div className="flex items-center justify-between text-gray-400">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{round.matchCount} matches</span>
          <span style={{ color }}>₦{round.entryFee}</span>
        </div>
        <div className="flex items-center justify-between text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{countdown}</span>
          {round.rolloverWeeks > 0 && (
            <span className="flex items-center gap-1 text-orange-400">
              <TrendingUp className="w-3 h-3" />Wk {round.rolloverWeeks}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
