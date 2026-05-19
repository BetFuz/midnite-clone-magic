import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import { ShieldAlert, RefreshCw, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const RISK_COLORS: Record<string, string> = {
  HIGH:   'bg-red-500/10 text-red-400 border-red-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  LOW:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const FLAG_LABELS: Record<string, string> = {
  RAPID_DEPOSITS:          'Rapid Deposits',
  LOSS_CHASING:            'Loss Chasing',
  LARGE_BET_RATIO:         'Large Bet Ratio',
  SESSION_DURATION:        'Long Session',
  DEPOSIT_FREQUENCY:       'High Deposit Freq.',
  SELF_EXCLUSION_OVERRIDE: 'Self-Exclusion Override',
};

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

export default function AdminRG() {
  const [flags, setFlags]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const limit = 20;

  const [exModal, setExModal]   = useState<any>(null);
  const [exReason, setExReason] = useState('');
  const [exDur, setExDur]       = useState('30d');
  const [exLoading, setExLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getRGFlags({ page, limit });
      setFlags(res?.flags ?? res?.data ?? res ?? []);
      setTotal(res?.total ?? 0);
    } catch {
      toast.error('Failed to load RG flags');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleExclude = useCallback(async () => {
    if (!exModal) return;
    setExLoading(true);
    try {
      await adminApi.forceSelfExclude(exModal.userId, { reason: exReason, duration: exDur });
      toast.success('User self-excluded successfully');
      setExModal(null);
      setExReason('');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to self-exclude user');
    } finally {
      setExLoading(false);
    }
  }, [exModal, exReason, exDur, load]);

  const pages = Math.ceil(total / limit);

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="Responsible Gambling" onRefresh={load} />
        <div className="p-6 space-y-6">

          {/* Summary banner */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-300 text-sm font-semibold">Responsible Gambling Monitoring</p>
              <p className="text-yellow-400/80 text-xs mt-0.5">
                Users below are flagged by our automated risk engine for problematic gambling patterns.
                Review each case and take action where necessary.
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1f2d3d] flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-sm">Flagged Users</h3>
                <p className="text-gray-500 text-xs">{total} total flags</p>
              </div>
              <button onClick={load} className="p-1.5 text-gray-500 hover:text-white transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="p-4 space-y-2">{[...Array(6)].map((_,i) => <div key={i} className="h-14 bg-[#1f2d3d] rounded animate-pulse" />)}</div>
            ) : flags.length === 0 ? (
              <div className="py-16 text-center">
                <ShieldAlert className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No RG flags found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1f2d3d]">
                      {['User', 'Flag Type', 'Risk Level', 'Details', 'Flagged', 'Status', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {flags.map((f: any, i: number) => (
                      <tr key={f.id ?? i} className="border-b border-[#1f2d3d]/50 hover:bg-white/2 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-white text-xs font-medium truncate max-w-[120px]">{f.user?.email ?? f.userId?.slice(0,8)}</p>
                          <p className="text-gray-600 text-[10px]">{f.userId?.slice(0,8)}...</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-300 text-xs">{FLAG_LABELS[f.flagType] ?? f.flagType}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${RISK_COLORS[f.riskLevel] ?? RISK_COLORS.LOW}`}>
                            {f.riskLevel ?? 'MEDIUM'}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[180px]">
                          <p className="text-gray-400 text-xs truncate">{f.details ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {f.createdAt ? fmtDate(f.createdAt) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${f.resolved ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                            {f.resolved ? 'Resolved' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {!f.resolved && (
                            <button
                              onClick={() => { setExModal(f); setExReason(''); setExDur('30d'); }}
                              className="text-xs px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors whitespace-nowrap"
                            >
                              Self-Exclude
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pages > 1 && (
              <div className="px-5 py-3 border-t border-[#1f2d3d] flex items-center justify-between">
                <span className="text-gray-500 text-xs">Page {page} of {pages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-xs bg-[#1f2d3d] text-gray-300 rounded disabled:opacity-40 hover:bg-[#2a3d52] transition-colors">Prev</button>
                  <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1 text-xs bg-[#1f2d3d] text-gray-300 rounded disabled:opacity-40 hover:bg-[#2a3d52] transition-colors">Next</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </AdminLayout>

      {exModal && (
        <Modal title="Force Self-Exclusion" onClose={() => setExModal(null)}>
          <div className="space-y-4">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-300 text-xs font-medium">User: {exModal.user?.email ?? exModal.userId}</p>
              <p className="text-red-400/70 text-xs mt-0.5">Flag: {FLAG_LABELS[exModal.flagType] ?? exModal.flagType}</p>
            </div>

            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Duration</label>
              <select
                value={exDur}
                onChange={e => setExDur(e.target.value)}
                className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg text-white text-sm px-3 py-2.5 focus:outline-none focus:border-[#00b15c]/50"
              >
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
                <option value="180d">6 Months</option>
                <option value="365d">1 Year</option>
                <option value="permanent">Permanent</option>
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Reason</label>
              <textarea
                value={exReason}
                onChange={e => setExReason(e.target.value)}
                rows={2}
                placeholder="Reason for exclusion (shown to user)..."
                className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg text-white text-sm px-3 py-2.5 focus:outline-none focus:border-[#00b15c]/50 placeholder:text-gray-600 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setExModal(null)} className="flex-1 px-4 py-2 bg-[#1f2d3d] text-gray-300 rounded-lg text-sm hover:bg-[#2a3d52] transition-colors">Cancel</button>
              <button
                onClick={handleExclude}
                disabled={exLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {exLoading ? 'Excluding...' : 'Confirm Exclusion'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminGuard>
  );
}
