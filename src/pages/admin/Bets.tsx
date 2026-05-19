import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import {
  Activity, TrendingUp, TrendingDown, Clock, Search, RefreshCw,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X, CheckCircle, XCircle,
  Zap, BarChart2,
} from 'lucide-react';
import { toast } from 'sonner';

const fmt = (n: number) => `XAF ${Number(n).toLocaleString()}`;

const STATUS_COLOR: Record<string, string> = {
  active:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  won:       'bg-green-500/10 text-green-400 border-green-500/20',
  lost:      'bg-red-500/10 text-red-400 border-red-500/20',
  void:      'bg-gray-500/10 text-gray-400 border-gray-500/20',
  cashout:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const SPORTS = ['All Sports', 'Football', 'Basketball', 'Tennis', 'Cricket', 'Rugby', 'Virtual'];

const Badge = ({ text, color }: { text: string; color: string }) => (
  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium capitalize ${color}`}>{text}</span>
);

const StatCard = ({ icon: Icon, label, value, sub, accent }: any) => (
  <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-gray-400 text-sm">{label}</span>
    </div>
    <p className="text-white text-xl font-bold">{value}</p>
    {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
  </div>
);

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-[#111827] border border-[#1f2d3d] rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2d3d]">
        <h3 className="text-white font-semibold">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export default function AdminBets() {
  const [bets, setBets]         = useState<any[]>([]);
  const [stats, setStats]       = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [sport, setSport]       = useState('All Sports');
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionBet, setActionBet]   = useState<any>(null);
  const [actionType, setActionType] = useState<'settle' | 'void' | null>(null);
  const [outcome, setOutcome]       = useState<'won' | 'lost'>('won');
  const [submitting, setSubmitting] = useState(false);
  const limit = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [betsRes, statsRes] = await Promise.all([
        adminApi.getBets({
          page, limit, search: search || undefined,
          status: status || undefined,
          sport: sport !== 'All Sports' ? sport : undefined,
        }),
        adminApi.getBetStats?.() ?? Promise.resolve(null),
      ]);
      setBets(betsRes.bets ?? betsRes.data ?? []);
      setTotal(betsRes.total ?? 0);
      if (statsRes) setStats(statsRes);
    } catch { toast.error('Failed to load bets'); }
    finally { setLoading(false); }
  }, [page, limit, search, status, sport]);

  useEffect(() => { load(); }, [load]);

  const handleSettle = async () => {
    if (!actionBet) return;
    setSubmitting(true);
    try {
      await adminApi.settleBet(actionBet.id, { outcome });
      toast.success(`Bet settled as ${outcome}`);
      setActionBet(null);
      setActionType(null);
      load();
    } catch { toast.error('Settlement failed'); }
    finally { setSubmitting(false); }
  };

  const handleVoid = async () => {
    if (!actionBet) return;
    setSubmitting(true);
    try {
      await adminApi.voidBet(actionBet.id);
      toast.success('Bet voided');
      setActionBet(null);
      setActionType(null);
      load();
    } catch { toast.error('Void failed'); }
    finally { setSubmitting(false); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="Bets" subtitle="Monitor and manage all wagers" />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Activity} label="Total Bets" accent="bg-blue-500/10 text-blue-400"
            value={stats?.totalBets?.toLocaleString() ?? total.toLocaleString()}
            sub="All time"
          />
          <StatCard
            icon={TrendingUp} label="Total Staked" accent="bg-green-500/10 text-green-400"
            value={stats?.totalStake ? fmt(stats.totalStake) : '—'}
            sub="Sum of all stakes"
          />
          <StatCard
            icon={TrendingDown} label="Total Payout" accent="bg-orange-500/10 text-orange-400"
            value={stats?.totalPayout ? fmt(stats.totalPayout) : '—'}
            sub="Winning payouts"
          />
          <StatCard
            icon={Clock} label="Pending Settlement" accent="bg-yellow-500/10 text-yellow-400"
            value={stats?.pending?.toLocaleString() ?? '—'}
            sub="Awaiting result"
          />
        </div>

        {/* House edge banner */}
        {stats?.houseEdge !== undefined && (
          <div className="mb-4 bg-[#00b15c]/5 border border-[#00b15c]/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <BarChart2 className="w-4 h-4 text-[#00b15c]" />
            <span className="text-sm text-gray-300">
              House Edge: <span className="text-[#00b15c] font-bold">{stats.houseEdge.toFixed(2)}%</span>
              {stats.grossRevenue && (
                <span className="ml-4 text-gray-400">
                  Gross Revenue: <span className="text-white font-semibold">{fmt(stats.grossRevenue)}</span>
                </span>
              )}
            </span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by user or bet ID…"
                className="bg-transparent text-white text-sm flex-1 outline-none"
              />
            </div>
            <select
              value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="bg-[#0d1520] border border-[#1f2d3d] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none"
            >
              <option value="">All Status</option>
              {['active', 'pending', 'won', 'lost', 'void', 'cashout'].map(s => (
                <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select
              value={sport} onChange={e => { setSport(e.target.value); setPage(1); }}
              className="bg-[#0d1520] border border-[#1f2d3d] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none"
            >
              {SPORTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-[#0d1520] border border-[#1f2d3d] text-gray-400 hover:text-white rounded-lg text-sm transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-gray-500 text-sm ml-auto">{total.toLocaleString()} bets</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1f2d3d]">
                  {['', 'Bet ID', 'Player', 'Sport', 'Stake', 'Potential Win', 'Odds', 'Status', 'Placed', 'Actions'].map(h => (
                    <th key={h} className="text-left text-gray-400 text-xs uppercase tracking-wider px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2d3d]">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 10 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-[#1f2d3d] rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : bets.length === 0 ? (
                  <tr><td colSpan={10} className="text-center text-gray-500 py-10">No bets found</td></tr>
                ) : bets.map(bet => (
                  <>
                    <tr
                      key={bet.id}
                      className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${
                        (bet.status === 'active' || bet.status === 'pending') ? 'bg-yellow-500/[0.02]' : ''
                      }`}
                      onClick={() => setExpanded(expanded === bet.id ? null : bet.id)}
                    >
                      <td className="px-4 py-3 w-8">
                        {expanded === bet.id
                          ? <ChevronUp className="w-4 h-4 text-gray-500" />
                          : <ChevronDown className="w-4 h-4 text-gray-500" />}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{bet.id?.slice(0, 8)}…</td>
                      <td className="px-4 py-3">
                        <div className="text-white text-sm font-medium">{bet.user?.firstName ?? bet.user?.username ?? '—'}</div>
                        <div className="text-gray-500 text-xs">{bet.user?.email ?? ''}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs">{bet.sport ?? '—'}</td>
                      <td className="px-4 py-3 text-white font-semibold">{fmt(Number(bet.stake))}</td>
                      <td className="px-4 py-3 text-[#00b15c] font-semibold">{fmt(Number(bet.potentialWin ?? bet.possibleWin ?? 0))}</td>
                      <td className="px-4 py-3 text-gray-300">{Number(bet.odds ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <Badge text={bet.status} color={STATUS_COLOR[bet.status] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'} />
                        {(bet.status === 'active' || bet.status === 'pending') && (
                          <Zap className="w-3 h-3 text-yellow-400 inline ml-1" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(bet.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          {(bet.status === 'active' || bet.status === 'pending') && (
                            <>
                              <button
                                onClick={() => { setActionBet(bet); setActionType('settle'); setOutcome('won'); }}
                                className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                title="Settle"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setActionBet(bet); setActionType('void'); }}
                                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Void"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded selections */}
                    {expanded === bet.id && (
                      <tr key={`${bet.id}-exp`}>
                        <td colSpan={10} className="bg-[#0d1520] px-6 py-4">
                          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3 font-medium">Bet Selections</p>
                          {(bet.selections ?? bet.betLegs ?? []).length === 0 ? (
                            <p className="text-gray-500 text-sm">No selection data available</p>
                          ) : (
                            <div className="space-y-2">
                              {(bet.selections ?? bet.betLegs ?? []).map((sel: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 bg-[#111827] border border-[#1f2d3d] rounded-lg px-4 py-2.5">
                                  <div className="flex-1">
                                    <p className="text-white text-sm font-medium">{sel.event ?? sel.eventName ?? sel.match ?? '—'}</p>
                                    <p className="text-gray-400 text-xs mt-0.5">{sel.market ?? sel.marketName ?? ''} · {sel.selection ?? sel.pick ?? ''}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[#00b15c] font-bold text-sm">{Number(sel.odds ?? sel.price ?? 0).toFixed(2)}</p>
                                    <Badge
                                      text={sel.status ?? 'pending'}
                                      color={STATUS_COLOR[sel.status ?? 'pending'] ?? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {bet.metadata && (
                            <div className="mt-3 text-gray-500 text-xs">
                              Type: <span className="text-gray-300">{bet.betType ?? 'Single'}</span>
                              {bet.cashoutAmount && <span className="ml-4">Cashout: <span className="text-purple-400 font-semibold">{fmt(Number(bet.cashoutAmount))}</span></span>}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#1f2d3d]">
              <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settle Modal */}
        {actionBet && actionType === 'settle' && (
          <Modal title="Settle Bet" onClose={() => { setActionBet(null); setActionType(null); }}>
            <div className="space-y-4">
              <div className="bg-[#0d1520] rounded-lg p-3">
                <p className="text-gray-400 text-xs">Player</p>
                <p className="text-white font-medium">{actionBet.user?.firstName ?? actionBet.user?.email}</p>
                <p className="text-gray-400 text-xs mt-2">Stake</p>
                <p className="text-white font-bold">{fmt(Number(actionBet.stake))}</p>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Outcome</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['won', 'lost'] as const).map(o => (
                    <button
                      key={o}
                      onClick={() => setOutcome(o)}
                      className={`py-2.5 rounded-lg border font-medium text-sm transition-all capitalize ${
                        outcome === o
                          ? o === 'won' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400'
                          : 'border-[#1f2d3d] text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSettle} disabled={submitting}
                className="w-full bg-[#00b15c] hover:bg-[#00c96a] text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Settling…' : `Confirm — Mark as ${outcome.toUpperCase()}`}
              </button>
            </div>
          </Modal>
        )}

        {/* Void Modal */}
        {actionBet && actionType === 'void' && (
          <Modal title="Void Bet" onClose={() => { setActionBet(null); setActionType(null); }}>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">Are you sure you want to void this bet? The stake will be refunded to the player's wallet.</p>
              <div className="bg-[#0d1520] rounded-lg p-3">
                <p className="text-gray-400 text-xs">Stake to Refund</p>
                <p className="text-white font-bold text-lg">{fmt(Number(actionBet.stake))}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setActionBet(null); setActionType(null); }} className="flex-1 py-2.5 border border-[#1f2d3d] text-gray-400 hover:text-white rounded-lg text-sm transition-colors">Cancel</button>
                <button onClick={handleVoid} disabled={submitting} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
                  {submitting ? 'Voiding…' : 'Void Bet'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
