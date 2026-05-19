import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import { toast } from 'sonner';
import { DollarSign, RefreshCw, CheckCircle, XCircle, Search, Clock } from 'lucide-react';

const fmt = (n: number) => `₦${Number(n).toLocaleString()}`;

const STATUS_CLS: Record<string, string> = {
  PENDING:    'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  PROCESSING: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  COMPLETED:  'text-green-400 bg-green-500/10 border-green-500/20',
  FAILED:     'text-red-400 bg-red-500/10 border-red-500/20',
  CANCELLED:  'text-gray-400 bg-gray-500/10 border-gray-500/20',
};

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [status, setStatus]           = useState('PENDING');
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [acting, setActing]           = useState<string | null>(null);
  const LIMIT = 20;

  const load = useCallback(async (reset = false) => {
    const p = reset ? 1 : page;
    if (reset) setPage(1);
    setLoading(true);
    try {
      const res = await adminApi.getWithdrawals({
        status: status || undefined,
        search: search || undefined,
        limit: LIMIT,
        page: p,
      });
      const list = res.data ?? res.withdrawals ?? [];
      setWithdrawals(prev => (reset || p === 1) ? list : [...prev, ...list]);
      setTotal(res.total ?? list.length);
    } catch { toast.error('Failed to load withdrawals'); }
    finally { setLoading(false); }
  }, [status, search, page]);

  useEffect(() => { load(true); }, [status, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const approve = async (id: string) => {
    setActing(id);
    try {
      await adminApi.approveWithdrawal(id);
      toast.success('Withdrawal approved');
      load(true);
    } catch { toast.error('Approval failed'); }
    finally { setActing(null); }
  };

  const reject = async (id: string) => {
    setActing(id);
    try {
      await adminApi.rejectWithdrawal(id, 'Rejected by admin');
      toast.success('Withdrawal rejected');
      load(true);
    } catch { toast.error('Rejection failed'); }
    finally { setActing(null); }
  };

  const pendingCount = withdrawals.filter(w => w.status === 'PENDING').length;

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="Withdrawals" subtitle="Review and process withdrawal requests" />
        <div className="p-6 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Pending', value: pendingCount,        color: 'text-yellow-400' },
              { label: 'Showing', value: withdrawals.length,  color: 'text-white' },
              { label: 'Total',   value: total,               color: 'text-gray-400' },
            ].map(s => (
              <div key={s.label} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[180px] flex items-center gap-2 bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search user, ref…"
                className="bg-transparent text-white text-sm flex-1 outline-none"
              />
            </div>
            <select
              value={status} onChange={e => setStatus(e.target.value)}
              className="bg-[#0d1520] border border-[#1f2d3d] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
            <button onClick={() => load(true)} className="p-2 bg-[#0d1520] border border-[#1f2d3d] text-gray-400 hover:text-white rounded-lg">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Table */}
          {loading && withdrawals.length === 0 ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 bg-[#111827] border border-[#1f2d3d] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-12 text-center">
              <DollarSign className="w-10 h-10 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No withdrawals found</p>
            </div>
          ) : (
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
              <div className="hidden sm:grid grid-cols-[1fr_100px_120px_110px_160px] gap-4 px-5 py-2.5 text-gray-600 text-xs uppercase tracking-wider border-b border-[#1f2d3d]">
                <span>User</span>
                <span className="text-right">Amount</span>
                <span>Method</span>
                <span className="text-center">Status</span>
                <span className="text-center">Actions</span>
              </div>
              <div className="divide-y divide-[#1f2d3d]/50">
                {withdrawals.map((w: any) => (
                  <div key={w.id} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_120px_110px_160px] gap-2 sm:gap-4 px-5 py-3.5 items-center hover:bg-white/[0.01]">
                    <div>
                      <p className="text-white text-sm font-medium">{w.user?.email ?? w.userId}</p>
                      <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(w.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-white text-sm font-bold text-right">{fmt(w.amount)}</p>
                    <p className="text-gray-400 text-sm">{w.paymentMethod ?? '—'}</p>
                    <div className="flex justify-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_CLS[w.status] ?? STATUS_CLS.PENDING}`}>
                        {w.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      {w.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => approve(w.id)} disabled={acting === w.id}
                            className="flex items-center gap-1 text-xs text-green-400 border border-green-500/20 px-2.5 py-1.5 rounded-lg hover:bg-green-500/10 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => reject(w.id)} disabled={acting === w.id}
                            className="flex items-center gap-1 text-xs text-red-400 border border-red-500/20 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {withdrawals.length < total && (
                <div className="px-5 py-3 border-t border-[#1f2d3d]">
                  <button
                    onClick={() => { setPage(p => p + 1); load(); }} disabled={loading}
                    className="text-[#00b15c] text-xs hover:underline disabled:opacity-50"
                  >
                    Load more ({total - withdrawals.length} remaining) →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
