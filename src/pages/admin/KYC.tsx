import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import {
  ShieldCheck, Clock, XCircle, CheckCircle, Eye, X,
  RefreshCw, FileText, User, ChevronLeft, ChevronRight, Search,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLOR: Record<string, string> = {
  pending:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const TIER_COLOR: Record<string, string> = {
  '0': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  '1': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  '2': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  '3': 'bg-[#00b15c]/10 text-[#00b15c] border-[#00b15c]/20',
};

const Badge = ({ text, color }: { text: string; color: string }) => (
  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium capitalize ${color}`}>{text}</span>
);

const StatCard = ({ icon: Icon, label, value, accent, textColor }: any) => (
  <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-gray-400 text-sm">{label}</span>
    </div>
    <p className={`text-2xl font-bold ${textColor ?? 'text-white'}`}>{value}</p>
  </div>
);

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-[#111827] border border-[#1f2d3d] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2d3d] sticky top-0 bg-[#111827]">
        <h3 className="text-white font-semibold">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export default function AdminKYC() {
  const [docs, setDocs]           = useState<any[]>([]);
  const [stats, setStats]         = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [selected, setSelected]   = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getKyc({
        status: filter === 'all' ? undefined : filter,
        page, limit,
        search: search || undefined,
      });
      setDocs(res.documents ?? res.data ?? []);
      setTotal(res.total ?? 0);
      try {
        const s = await adminApi.getKycStats?.();
        if (s) setStats(s);
        else {
          // compute from response if no dedicated endpoint
          const all = res.stats ?? {};
          setStats(all);
        }
      } catch { /* stats optional */ }
    } catch { toast.error('Failed to load KYC data'); }
    finally { setLoading(false); }
  }, [filter, page, limit, search]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => {
    setSubmitting(true);
    try {
      await adminApi.approveKyc(id);
      toast.success('KYC approved');
      setSelected(null);
      load();
    } catch { toast.error('Approval failed'); }
    finally { setSubmitting(false); }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    setSubmitting(true);
    try {
      await adminApi.rejectKyc(id, rejectReason);
      toast.success('KYC rejected');
      setSelected(null);
      setRejectReason('');
      load();
    } catch { toast.error('Rejection failed'); }
    finally { setSubmitting(false); }
  };

  const totalPages = Math.ceil(total / limit);

  const TABS: { key: typeof filter; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'all', label: 'All' },
  ];

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="KYC & Compliance" subtitle="Identity verification and document review" />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Clock} label="Pending Review" accent="bg-yellow-500/10 text-yellow-400" textColor="text-yellow-400"
            value={stats?.pending ?? docs.filter(d => d.status === 'pending').length}
          />
          <StatCard
            icon={CheckCircle} label="Approved" accent="bg-green-500/10 text-green-400" textColor="text-green-400"
            value={stats?.approved ?? '—'}
          />
          <StatCard
            icon={XCircle} label="Rejected" accent="bg-red-500/10 text-red-400" textColor="text-red-400"
            value={stats?.rejected ?? '—'}
          />
          <StatCard
            icon={ShieldCheck} label="Verified Users" accent="bg-[#00b15c]/10 text-[#00b15c]" textColor="text-[#00b15c]"
            value={stats?.verified ?? stats?.approved ?? '—'}
          />
        </div>

        {/* Filters */}
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl mb-4 overflow-hidden">
          <div className="flex border-b border-[#1f2d3d]">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setFilter(key); setPage(1); }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  filter === key ? 'text-[#00b15c] border-b-2 border-[#00b15c] bg-[#00b15c]/5' : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="p-4 flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name or email…"
                className="bg-transparent text-white text-sm flex-1 outline-none"
              />
            </div>
            <button onClick={load} className="p-2 bg-[#0d1520] border border-[#1f2d3d] text-gray-400 hover:text-white rounded-lg transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-gray-500 text-sm self-center">{total} submissions</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1f2d3d]">
                  {['Player', 'KYC Tier', 'Document Type', 'Documents', 'Status', 'Submitted', 'Actions'].map(h => (
                    <th key={h} className="text-left text-gray-400 text-xs uppercase tracking-wider px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2d3d]">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-[#1f2d3d] rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : docs.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-gray-500 py-12">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No {filter === 'all' ? '' : filter} KYC submissions
                  </td></tr>
                ) : docs.map(doc => {
                  const tier = String(doc.kycTier ?? doc.tier ?? doc.user?.kycTier ?? 0);
                  const docCount = (doc.documents ?? doc.files ?? []).length;
                  return (
                    <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#00b15c]/10 border border-[#00b15c]/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-[#00b15c]" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{doc.user?.firstName ?? doc.firstName ?? '—'} {doc.user?.lastName ?? doc.lastName ?? ''}</p>
                            <p className="text-gray-500 text-xs">{doc.user?.email ?? doc.email ?? ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge text={`Tier ${tier}`} color={TIER_COLOR[tier] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'} />
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {doc.documentType ?? doc.type ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <FileText className="w-3.5 h-3.5" />
                          {docCount} file{docCount !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge text={doc.status} color={STATUS_COLOR[doc.status] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'} />
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setSelected(doc); setRejectReason(''); }}
                            className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Review"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {doc.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(doc.id)}
                                className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                title="Quick approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setSelected(doc); setRejectReason(''); }}
                                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
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

        {/* Review Modal */}
        {selected && (
          <Modal title="KYC Review" onClose={() => setSelected(null)}>
            <div className="space-y-5">
              {/* Player info */}
              <div className="bg-[#0d1520] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#00b15c]/10 border border-[#00b15c]/20 flex items-center justify-center">
                    <span className="text-[#00b15c] font-bold">
                      {(selected.user?.firstName ?? selected.firstName ?? 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{selected.user?.firstName ?? selected.firstName ?? '—'} {selected.user?.lastName ?? selected.lastName ?? ''}</p>
                    <p className="text-gray-400 text-sm">{selected.user?.email ?? selected.email ?? ''}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Document Type</p>
                    <p className="text-white">{selected.documentType ?? selected.type ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">KYC Tier</p>
                    <p className="text-white">Tier {selected.kycTier ?? selected.tier ?? selected.user?.kycTier ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Status</p>
                    <Badge text={selected.status} color={STATUS_COLOR[selected.status] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Submitted</p>
                    <p className="text-white">{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : '—'}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {(selected.documents ?? selected.files ?? []).length > 0 && (
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Documents</p>
                  <div className="space-y-2">
                    {(selected.documents ?? selected.files ?? []).map((doc: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm flex-1 truncate">{doc.name ?? doc.type ?? `Document ${i + 1}`}</span>
                        {(doc.url ?? doc.fileUrl) && (
                          <a
                            href={doc.url ?? doc.fileUrl} target="_blank" rel="noreferrer"
                            className="text-[#00b15c] text-xs hover:underline flex-shrink-0"
                          >
                            View
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {selected.status === 'pending' && (
                <>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Rejection Reason (required to reject)</label>
                    <textarea
                      value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection…"
                      rows={3}
                      className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-4 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-[#00b15c]/50"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReject(selected.id)} disabled={submitting || !rejectReason.trim()}
                      className="flex-1 py-2.5 bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                    >
                      <XCircle className="w-4 h-4 inline mr-1.5" />
                      {submitting ? 'Rejecting…' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleApprove(selected.id)} disabled={submitting}
                      className="flex-1 py-2.5 bg-[#00b15c] hover:bg-[#00c96a] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1.5" />
                      {submitting ? 'Approving…' : 'Approve KYC'}
                    </button>
                  </div>
                </>
              )}

              {selected.status !== 'pending' && (
                <div className={`rounded-lg p-3 border ${STATUS_COLOR[selected.status]}`}>
                  <p className="text-sm font-medium capitalize">{selected.status}</p>
                  {selected.reviewedAt && (
                    <p className="text-xs opacity-70 mt-0.5">Reviewed: {new Date(selected.reviewedAt).toLocaleDateString()}</p>
                  )}
                  {selected.rejectionReason && (
                    <p className="text-xs mt-1 opacity-80">Reason: {selected.rejectionReason}</p>
                  )}
                </div>
              )}
            </div>
          </Modal>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
