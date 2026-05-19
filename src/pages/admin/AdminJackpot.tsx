import { useEffect, useState } from 'react';
import { Trophy, Plus, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api/client';

interface Round {
  id: string;
  tier: 'MINI' | 'MIDI' | 'MEGA';
  weekLabel: string;
  status: 'OPEN' | 'CLOSED' | 'SETTLED' | 'ROLLED_OVER';
  poolAmount: number;
  guaranteedMin: number;
  matchCount: number;
  closesAt: string;
  rolloverWeeks: number;
  _count?: { jackpot_entries: number };
}

const TIERS = [
  { value: 'MINI', label: 'Mini', fee: 100,  min: 1_000_000,  matches: 8  },
  { value: 'MIDI', label: 'Midi', fee: 200,  min: 5_000_000,  matches: 12 },
  { value: 'MEGA', label: 'Mega', fee: 500,  min: 50_000_000, matches: 17 },
] as const;

const TIER_COLOR: Record<string, string> = { MINI: '#00b15c', MIDI: '#3b82f6', MEGA: '#f59e0b' };
const STATUS_COLOR: Record<string, string> = {
  OPEN: '#00b15c', CLOSED: '#f59e0b', SETTLED: '#6b7280', ROLLED_OVER: '#8b5cf6',
};

function formatPool(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toLocaleString()}`;
}

export default function AdminJackpot() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tier: 'MINI', weekLabel: '', closesAt: '' });

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/jackpot/rounds');
      setRounds(data.data ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createRound = async () => {
    if (!form.weekLabel || !form.closesAt) return;
    const tier = TIERS.find(t => t.value === form.tier)!;
    setCreating(true);
    try {
      await api.post('/admin/jackpot/rounds', {
        tier: form.tier,
        weekLabel: form.weekLabel,
        guaranteedMin: tier.min,
        entryFee: tier.fee,
        matchCount: tier.matches,
        closesAt: form.closesAt,
        matches: [],
      });
      setShowForm(false);
      setForm({ tier: 'MINI', weekLabel: '', closesAt: '' });
      await load();
    } catch {}
    setCreating(false);
  };

  const closeRound = async (id: string) => {
    try {
      await api.post(`/admin/jackpot/rounds/${id}/settle`, {});
      await load();
    } catch {}
  };

  // Pool totals
  const openRounds = rounds.filter(r => r.status === 'OPEN');
  const totalPool = openRounds.reduce((sum, r) => sum + Number(r.poolAmount), 0);
  const totalEntries = openRounds.reduce((sum, r) => sum + (r._count?.jackpot_entries ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00b15c]/15 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-[#00b15c]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Jackpot Manager</h1>
            <p className="text-gray-500 text-sm">Create rounds, manage matches, trigger settlement</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 text-gray-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm(o => !o)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00b15c] hover:bg-[#00b15c]/80 text-white rounded-xl text-sm font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> New Round
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Jackpots', value: openRounds.length, color: '#00b15c' },
          { label: 'Total Pool', value: formatPool(totalPool), color: '#f59e0b' },
          { label: 'Total Entries', value: totalEntries.toLocaleString(), color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Create Jackpot Round</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Tier</label>
              <select
                value={form.tier}
                onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}
                className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00b15c]/40"
              >
                {TIERS.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label} · ₦{t.fee} entry · {t.matches} matches
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Week Label</label>
              <input
                value={form.weekLabel}
                onChange={e => setForm(f => ({ ...f, weekLabel: e.target.value }))}
                placeholder="Week 17 · Apr 21–27"
                className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00b15c]/40"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Closes At</label>
              <input
                type="datetime-local"
                value={form.closesAt}
                onChange={e => setForm(f => ({ ...f, closesAt: e.target.value }))}
                className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00b15c]/40"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={createRound}
              disabled={creating || !form.weekLabel || !form.closesAt}
              className="flex items-center gap-2 px-4 py-2 bg-[#00b15c] text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Round
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-400 hover:text-white text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rounds list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#00b15c]" />
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.map(round => {
            const color = TIER_COLOR[round.tier];
            const statusColor = STATUS_COLOR[round.status];
            return (
              <div key={round.id} className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
                <div className="h-0.5" style={{ background: color }} />
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm truncate">{round.weekLabel}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        <span style={{ color }}>{round.tier}</span>
                        {' · '}
                        {round._count?.jackpot_entries ?? 0} entries
                        {' · '}
                        Pool {formatPool(Number(round.poolAmount))}
                        {round.rolloverWeeks > 0 && (
                          <span className="text-orange-400"> · 🔥 Rollover ×{round.rolloverWeeks}</span>
                        )}
                        {' · '}
                        Closes {new Date(round.closesAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: `${statusColor}20`, color: statusColor }}
                    >
                      {round.status}
                    </span>
                    {round.status === 'OPEN' && (
                      <button
                        onClick={() => closeRound(round.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-semibold transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Close &amp; Settle
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {rounds.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No jackpot rounds yet. Create your first round above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
