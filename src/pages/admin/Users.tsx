import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import {
  Search, Brain, DollarSign, Ban, CheckCircle, X,
  ChevronLeft, ChevronRight, RefreshCw, Users, UserCheck,
  UserX, ShieldCheck, ExternalLink, Filter,
} from 'lucide-react';
import { toast } from 'sonner';

const fmt = (n: number) => `₦${Number(n).toLocaleString()}`;

const STATUS_COLOR: Record<string, string> = {
  active:    'bg-green-500/10 text-green-400 border-green-500/20',
  suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
  banned:    'bg-red-900/20 text-red-300 border-red-900/30',
  pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};
const KYC_COLOR: Record<string, string> = {
  verified: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  pending:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  none:     'bg-gray-500/10 text-gray-500 border-gray-700',
};

const Bdg = ({ text, color }: { text: string; color: string }) => (
  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium capitalize ${color}`}>{text}</span>
);

const Modal = ({ title, onClose, children }: any) => (
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

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kycFilter, setKycFilter]       = useState('');
  const [page, setPage]     = useState(1);
  const [total, setTotal]   = useState(0);
  const limit = 20;

  // stats
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, kycVerified: 0 });

  // modals
  const [creditUser, setCreditUser]     = useState<any>(null);
  const [suspendUser, setSuspendUser]   = useState<any>(null);
  const [aiUser, setAiUser]             = useState<any>(null);
  const [creditAmt, setCreditAmt]       = useState('');
  const [creditNote, setCreditNote]     = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [aiData, setAiData]             = useState<any>(null);
  const [submitting, setSubmitting]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ search, page, limit });
      const list: any[] = res.users ?? res.data ?? [];
      setUsers(list);
      setTotal(res.total ?? 0);
      // derive quick stats from current page + total
      setStats({
        total:       res.total ?? list.length,
        active:      list.filter(u => (u.status ?? 'active') === 'active').length,
        suspended:   list.filter(u => u.status === 'suspended').length,
        kycVerified: list.filter(u => ['verified','approved'].includes(u.kycStatus ?? '')).length,
      });
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const handleCredit = async () => {
    if (!creditUser || !creditAmt) return;
    setSubmitting(true);
    try {
      await adminApi.creditUser(creditUser.id, { amount: Number(creditAmt), note: creditNote });
      toast.success(`₦${Number(creditAmt).toLocaleString()} credited to ${creditUser.email}`);
      setCreditUser(null); setCreditAmt(''); setCreditNote('');
      load();
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Credit failed'); }
    finally { setSubmitting(false); }
  };

  const handleSuspend = async () => {
    if (!suspendUser) return;
    setSubmitting(true);
    try {
      if (suspendUser.status === 'suspended') {
        await adminApi.unsuspendUser(suspendUser.id);
        toast.success('User unsuspended');
      } else {
        await adminApi.suspendUser(suspendUser.id, { reason: suspendReason });
        toast.success('User suspended');
      }
      setSuspendUser(null); setSuspendReason('');
      load();
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Action failed'); }
    finally { setSubmitting(false); }
  };

  const handleAI = async (user: any) => {
    setAiUser(user); setAiData(null);
    try {
      const res = await adminApi.getAIFraudScore(user.id);
      setAiData(res);
    } catch { setAiData({ error: 'AI analysis unavailable.' }); }
  };

  const riskColor = (s: number) => s >= 70 ? 'text-red-400' : s >= 40 ? 'text-yellow-400' : 'text-green-400';
  const riskLabel = (s: number) => s >= 70 ? 'HIGH RISK' : s >= 40 ? 'MEDIUM RISK' : 'LOW RISK';

  // client-side filter on top of server results
  const visible = users.filter(u => {
    if (statusFilter && (u.status ?? 'active') !== statusFilter) return false;
    if (kycFilter   && (u.kycStatus ?? 'none') !== kycFilter)   return false;
    return true;
  });

  const pages = Math.ceil(total / limit);

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="User Management" onRefresh={load} />
        <div className="p-6 space-y-5">

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users',    value: total,            icon: Users,      color: 'text-gray-400' },
              { label: 'Active',         value: stats.active,     icon: UserCheck,  color: 'text-green-400' },
              { label: 'Suspended',      value: stats.suspended,  icon: UserX,      color: 'text-red-400' },
              { label: 'KYC Verified',   value: stats.kycVerified,icon: ShieldCheck,color: 'text-blue-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
                <div>
                  <p className="text-white font-bold text-xl">{value}</p>
                  <p className="text-gray-500 text-xs">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by email, username or name…"
                className="w-full bg-[#111827] border border-[#1f2d3d] rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#00b15c]/50"
              />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#111827] border border-[#1f2d3d] rounded-lg px-3 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-[#00b15c]/50">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
            <select value={kycFilter} onChange={e => setKycFilter(e.target.value)}
              className="bg-[#111827] border border-[#1f2d3d] rounded-lg px-3 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-[#00b15c]/50">
              <option value="">All KYC</option>
              <option value="verified">Verified</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="none">None</option>
            </select>
            <button onClick={load} className="p-2.5 border border-[#1f2d3d] rounded-lg text-gray-400 hover:text-white hover:border-[#00b15c]/30 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="text-gray-500 text-sm">{total} total</span>
          </div>

          {/* Table */}
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1f2d3d]">
                    {['User', 'Email', 'Status', 'KYC', 'Balance', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(8)].map((_, i) => (
                      <tr key={i} className="border-b border-[#1f2d3d]/50">
                        {[...Array(7)].map((_, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-4 bg-[#1f2d3d] rounded animate-pulse w-20" /></td>
                        ))}
                      </tr>
                    ))
                  ) : visible.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-gray-500 py-12">No users found</td></tr>
                  ) : visible.map(u => (
                    <tr
                      key={u.id}
                      className="border-b border-[#1f2d3d]/50 hover:bg-white/2 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/users/${u.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#00b15c]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#00b15c] text-xs font-bold">
                              {(u.firstName?.[0] ?? u.email?.[0] ?? 'U').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm leading-tight">
                              {u.firstName ?? ''} {u.lastName ?? ''}
                            </p>
                            <p className="text-gray-600 text-[10px]">@{u.username ?? u.id?.slice(0,8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{u.email}</td>
                      <td className="px-4 py-3">
                        <Bdg text={u.status ?? 'active'} color={STATUS_COLOR[u.status ?? 'active'] ?? STATUS_COLOR.active} />
                      </td>
                      <td className="px-4 py-3">
                        <Bdg text={u.kycStatus ?? 'none'} color={KYC_COLOR[u.kycStatus ?? 'none'] ?? KYC_COLOR.none} />
                      </td>
                      <td className="px-4 py-3 text-white font-medium text-sm">
                        {fmt(u.wallet?.cashBalance ?? u.wallet?.balance ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button
                            title="View Detail"
                            onClick={() => navigate(`/admin/users/${u.id}`)}
                            className="p-1.5 rounded-lg bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="AI Fraud Score"
                            onClick={() => handleAI(u)}
                            className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all"
                          >
                            <Brain className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Credit Wallet"
                            onClick={() => setCreditUser(u)}
                            className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title={u.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                            onClick={() => setSuspendUser(u)}
                            className={`p-1.5 rounded-lg transition-all ${u.status === 'suspended' ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                          >
                            {u.status === 'suspended' ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#1f2d3d]">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="flex items-center gap-1 text-gray-400 hover:text-white disabled:opacity-40 text-sm transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="text-gray-500 text-xs">Page {page} of {pages}</span>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  className="flex items-center gap-1 text-gray-400 hover:text-white disabled:opacity-40 text-sm transition-colors">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Credit Modal */}
        {creditUser && (
          <Modal title={`Credit Wallet — ${creditUser.email}`} onClose={() => setCreditUser(null)}>
            <div className="space-y-4">
              <div className="bg-[#0d1520] border border-[#1f2d3d] rounded-xl p-3 text-xs text-gray-400">
                Current balance: <span className="text-white font-bold">{fmt(creditUser.wallet?.cashBalance ?? 0)}</span>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Amount</label>
                <input type="number" value={creditAmt} onChange={e => setCreditAmt(e.target.value)} placeholder="5000"
                  className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00b15c]/50" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Note (optional)</label>
                <input type="text" value={creditNote} onChange={e => setCreditNote(e.target.value)} placeholder="Bonus credit, promo…"
                  className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00b15c]/50" />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setCreditUser(null)} className="flex-1 border border-[#1f2d3d] text-gray-400 rounded-lg py-2.5 text-sm hover:text-white transition-all">Cancel</button>
                <button onClick={handleCredit} disabled={submitting || !creditAmt}
                  className="flex-1 bg-[#00b15c] hover:bg-[#00963f] text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 transition-all">
                  {submitting ? 'Processing…' : 'Credit Wallet'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Suspend Modal */}
        {suspendUser && (
          <Modal
            title={suspendUser.status === 'suspended' ? `Unsuspend — ${suspendUser.email}` : `Suspend — ${suspendUser.email}`}
            onClose={() => setSuspendUser(null)}
          >
            <div className="space-y-4">
              {suspendUser.status !== 'suspended' && (
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Reason</label>
                  <input type="text" value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
                    placeholder="Suspicious activity, fraud, etc."
                    className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00b15c]/50" />
                </div>
              )}
              <p className="text-gray-400 text-sm">
                {suspendUser.status === 'suspended'
                  ? 'This will restore the user\'s full access to the platform.'
                  : 'This will immediately lock the user out and prevent new bets.'}
              </p>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setSuspendUser(null)} className="flex-1 border border-[#1f2d3d] text-gray-400 rounded-lg py-2.5 text-sm hover:text-white transition-all">Cancel</button>
                <button onClick={handleSuspend} disabled={submitting}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 transition-all text-white ${suspendUser.status === 'suspended' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  {submitting ? 'Processing…' : suspendUser.status === 'suspended' ? 'Unsuspend User' : 'Suspend User'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* AI Fraud Modal */}
        {aiUser && (
          <Modal title={`AI Fraud Analysis — ${aiUser.email}`} onClose={() => { setAiUser(null); setAiData(null); }}>
            {!aiData ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Analyzing with Claude AI…</p>
              </div>
            ) : aiData.error ? (
              <p className="text-red-400 text-sm">{aiData.error}</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#0d1520] border border-[#1f2d3d] rounded-xl p-4">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Fraud Score</p>
                    <p className={`text-3xl font-bold ${riskColor(aiData.fraudScore ?? 0)}`}>
                      {aiData.fraudScore ?? 0}<span className="text-sm text-gray-500">/100</span>
                    </p>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full border ${riskColor(aiData.fraudScore ?? 0)} border-current bg-current/10`}>
                    {riskLabel(aiData.fraudScore ?? 0)}
                  </span>
                </div>
                {aiData.reasons?.length > 0 && (
                  <ul className="space-y-1.5">
                    {aiData.reasons.map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>{r}
                      </li>
                    ))}
                  </ul>
                )}
                {aiData.recommendation && (
                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
                    <p className="text-purple-400 text-xs uppercase tracking-wider mb-1">Recommendation</p>
                    <p className="text-gray-300 text-sm">{aiData.recommendation}</p>
                  </div>
                )}
              </div>
            )}
          </Modal>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
