import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import {
  DollarSign, ArrowUpRight, ArrowDownRight, Clock, TrendingUp,
  RefreshCw, CheckCircle, XCircle, X, Search, ChevronLeft, ChevronRight,
  Smartphone, CreditCard, Building2, Bitcoin,
} from 'lucide-react';
import { toast } from 'sonner';

const fmt = (n: number) => `XAF ${Number(n).toLocaleString()}`;

const TX_COLOR: Record<string, string> = {
  deposit:    'bg-green-500/10 text-green-400 border-green-500/20',
  withdrawal: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  bet:        'bg-blue-500/10 text-blue-400 border-blue-500/20',
  win:        'bg-purple-500/10 text-purple-400 border-purple-500/20',
  credit:     'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  refund:     'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  approved:  'bg-green-500/10 text-green-400 border-green-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected:  'bg-red-500/10 text-red-400 border-red-500/20',
  failed:    'bg-red-500/10 text-red-400 border-red-500/20',
};

const METHOD_META: Record<string, { icon: any; label: string; color: string }> = {
  airtel:  { icon: Smartphone, label: 'Airtel Money', color: 'text-red-400' },
  moov:    { icon: Smartphone, label: 'Moov Money',   color: 'text-blue-400' },
  card:    { icon: CreditCard, label: 'Card',         color: 'text-purple-400' },
  bank:    { icon: Building2,  label: 'Bank',         color: 'text-yellow-400' },
  crypto:  { icon: Bitcoin,    label: 'USDT',         color: 'text-orange-400' },
  usdt:    { icon: Bitcoin,    label: 'USDT',         color: 'text-orange-400' },
};

const Badge = ({ text, color }: { text: string; color: string }) => (
  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium capitalize ${color}`}>{text}</span>
);

const StatCard = ({ icon: Icon, label, value, sub, accent, textColor }: any) => (
  <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-gray-400 text-sm">{label}</span>
    </div>
    <p className={`text-xl font-bold ${textColor ?? 'text-white'}`}>{value}</p>
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

const methodFromMetadata = (tx: any) => {
  const raw = tx.metadata?.method ?? tx.method ?? tx.paymentMethod ?? '';
  return raw.toLowerCase();
};

export default function AdminFinances() {
  const [tab, setTab]               = useState<'withdrawals' | 'transactions'>('withdrawals');
  const [withdrawals, setWithdrawals]   = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats]           = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [actionTx, setActionTx]     = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const limit = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'withdrawals') {
        const res = await adminApi.getWithdrawals({ page, limit, search: search || undefined, status: typeFilter || undefined });
        setWithdrawals(res.withdrawals ?? res.data ?? []);
        setTotal(res.total ?? 0);
      } else {
        const res = await adminApi.getTransactions({ page, limit, search: search || undefined, type: typeFilter || undefined });
        setTransactions(res.transactions ?? res.data ?? []);
        setTotal(res.total ?? 0);
      }
      try {
        const s = await adminApi.getFinanceStats?.();
        if (s) setStats(s);
      } catch { /* stats optional */ }
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, [tab, page, limit, search, typeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async () => {
    if (!actionTx) return;
    setSubmitting(true);
    try {
      await adminApi.approveWithdrawal(actionTx.id);
      toast.success('Withdrawal approved');
      setActionTx(null); setActionType(null);
      load();
    } catch { toast.error('Approval failed'); }
    finally { setSubmitting(false); }
  };

  const handleReject = async () => {
    if (!actionTx) return;
    setSubmitting(true);
    try {
      await adminApi.rejectWithdrawal(actionTx.id, rejectReason);
      toast.success('Withdrawal rejected');
      setActionTx(null); setActionType(null); setRejectReason('');
      load();
    } catch { toast.error('Rejection failed'); }
    finally { setSubmitting(false); }
  };

  const totalPages = Math.ceil(total / limit);

  const rows = tab === 'withdrawals' ? withdrawals : transactions;

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="Finances" subtitle="Deposits, withdrawals and transaction ledger" />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={ArrowDownRight} label="Total Deposits" accent="bg-green-500/10 text-green-400" textColor="text-green-400"
            value={stats?.totalDeposits ? fmt(stats.totalDeposits) : '—'}
            sub="All time"
          />
          <StatCard
            icon={ArrowUpRight} label="Total Withdrawals" accent="bg-orange-500/10 text-orange-400" textColor="text-orange-400"
            value={stats?.totalWithdrawals ? fmt(stats.totalWithdrawals) : '—'}
            sub="All time"
          />
          <StatCard
            icon={Clock} label="Pending Payouts" accent="bg-yellow-500/10 text-yellow-400" textColor="text-yellow-400"
            value={stats?.pendingWithdrawals ? fmt(stats.pendingWithdrawals) : '—'}
            sub="Awaiting approval"
          />
          <StatCard
            icon={TrendingUp} label="Net Revenue" accent="bg-[#00b15c]/10 text-[#00b15c]" textColor="text-[#00b15c]"
            value={stats?.netRevenue ? fmt(stats.netRevenue) : '—'}
            sub="Deposits − Withdrawals"
          />
        </div>

        {/* Tabs + Filters */}
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl mb-4 overflow-hidden">
          <div className="flex border-b border-[#1f2d3d]">
            {(['withdrawals', 'transactions'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setPage(1); setTypeFilter(''); }}
                className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${
                  tab === t ? 'text-[#00b15c] border-b-2 border-[#00b15c] bg-[#00b15c]/5' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="p-4 flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search user or reference…"
                className="bg-transparent text-white text-sm flex-1 outline-none"
              />
            </div>
            {tab === 'withdrawals' ? (
              <select
                value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                className="bg-[#0d1520] border border-[#1f2d3d] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none"
              >
                <option value="">All Status</option>
                {['pending', 'approved', 'completed', 'rejected', 'failed'].map(s => (
                  <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            ) : (
              <select
                value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                className="bg-[#0d1520] border border-[#1f2d3d] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none"
              >
                <option value="">All Types</option>
                {['deposit', 'withdrawal', 'bet', 'win', 'credit', 'refund'].map(t => (
                  <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            )}
            <select
              value={methodFilter} onChange={e => setMethodFilter(e.target.value)}
              className="bg-[#0d1520] border border-[#1f2d3d] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none"
            >
              <option value="">All Methods</option>
              {['airtel', 'moov', 'card', 'bank', 'crypto'].map(m => (
                <option key={m} value={m}>{METHOD_META[m]?.label ?? m}</option>
              ))}
            </select>
            <button onClick={load} className="p-2 bg-[#0d1520] border border-[#1f2d3d] text-gray-400 hover:text-white rounded-lg transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-gray-500 text-sm self-center">{total.toLocaleString()} records</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1f2d3d]">
                  {['Player', 'Amount', 'Method', tab === 'withdrawals' ? 'Status' : 'Type', 'Reference', 'Date', tab === 'withdrawals' ? 'Actions' : ''].map(h => (
                    <th key={h} className="text-left text-gray-400 text-xs uppercase tracking-wider px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2d3d]">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-[#1f2d3d] rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-gray-500 py-10">No records found</td></tr>
                ) : rows
                  .filter(tx => !methodFilter || methodFromMetadata(tx).includes(methodFilter))
                  .map(tx => {
                    const method = methodFromMetadata(tx);
                    const meta = METHOD_META[method] ?? null;
                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-white font-medium text-sm">{tx.user?.firstName ?? tx.user?.username ?? '—'}</p>
                          <p className="text-gray-500 text-xs">{tx.user?.email ?? ''}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-bold text-sm ${
                            (tx.type === 'deposit' || tx.type === 'win' || tx.type === 'credit') ? 'text-green-400' : 'text-orange-400'
                          }`}>
                            {fmt(Number(tx.amount))}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {meta ? (
                            <div className="flex items-center gap-1.5">
                              <meta.icon className={`w-3.5 h-3.5 ${meta.color}`} />
                              <span className={`text-xs ${meta.color}`}>{meta.label}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">{method || '—'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            text={tab === 'withdrawals' ? (tx.status ?? '—') : (tx.type ?? '—')}
                            color={
                              tab === 'withdrawals'
                                ? (STATUS_COLOR[tx.status] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20')
                                : (TX_COLOR[tx.type] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20')
                            }
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{tx.reference ?? tx.id?.slice(0, 12) ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {tab === 'withdrawals' && tx.status === 'pending' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => { setActionTx(tx); setActionType('approve'); }}
                                className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setActionTx(tx); setActionType('reject'); setRejectReason(''); }}
                                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#1f2d3d]">
              <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Approve Modal */}
        {actionTx && actionType === 'approve' && (
          <Modal title="Approve Withdrawal" onClose={() => { setActionTx(null); setActionType(null); }}>
            <div className="space-y-4">
              <div className="bg-[#0d1520] rounded-lg p-3 space-y-2">
                <div><p className="text-gray-400 text-xs">Player</p><p className="text-white font-medium">{actionTx.user?.firstName ?? actionTx.user?.email}</p></div>
                <div><p className="text-gray-400 text-xs">Amount</p><p className="text-orange-400 font-bold text-lg">{fmt(Number(actionTx.amount))}</p></div>
                {actionTx.metadata?.phone && <div><p className="text-gray-400 text-xs">Destination</p><p className="text-white">{actionTx.metadata.phone}</p></div>}
              </div>
              <p className="text-gray-400 text-sm">This will trigger an automatic disbursement to the player's mobile money account.</p>
              <div className="flex gap-3">
                <button onClick={() => { setActionTx(null); setActionType(null); }} className="flex-1 py-2.5 border border-[#1f2d3d] text-gray-400 hover:text-white rounded-lg text-sm">Cancel</button>
                <button onClick={handleApprove} disabled={submitting} className="flex-1 bg-[#00b15c] hover:bg-[#00c96a] text-white font-semibold py-2.5 rounded-lg disabled:opacity-50">
                  {submitting ? 'Processing…' : 'Approve & Pay'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Reject Modal */}
        {actionTx && actionType === 'reject' && (
          <Modal title="Reject Withdrawal" onClose={() => { setActionTx(null); setActionType(null); }}>
            <div className="space-y-4">
              <div className="bg-[#0d1520] rounded-lg p-3">
                <p className="text-gray-400 text-xs">Amount to Return</p>
                <p className="text-white font-bold text-lg">{fmt(Number(actionTx.amount))}</p>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Rejection Reason</label>
                <textarea
                  value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (sent to player)…"
                  rows={3}
                  className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-4 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-[#00b15c]/50"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setActionTx(null); setActionType(null); }} className="flex-1 py-2.5 border border-[#1f2d3d] text-gray-400 hover:text-white rounded-lg text-sm">Cancel</button>
                <button onClick={handleReject} disabled={submitting} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50">
                  {submitting ? 'Rejecting…' : 'Reject'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
