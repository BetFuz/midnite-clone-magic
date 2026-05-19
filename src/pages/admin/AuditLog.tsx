import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import { Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const actionColor: Record<string, string> = {
  create:  'bg-green-500/10 text-green-400 border-green-500/20',
  update:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  delete:  'bg-red-500/10 text-red-400 border-red-500/20',
  suspend: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  approve: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  reject:  'bg-red-500/10 text-red-400 border-red-500/20',
  login:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const Badge = ({ text }: { text: string }) => {
  const action = text?.toLowerCase()?.split('_')?.[0] ?? text;
  const color = actionColor[action] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  return <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${color}`}>{text}</span>;
};

export default function AdminAuditLog() {
  const [logs, setLogs]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const limit = 30;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs({ search, page, limit });
      setLogs(res.logs ?? res.data ?? []);
      setTotal(res.total ?? 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const pages = Math.ceil(total / limit);

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="Audit Log" onRefresh={load} />
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by admin or action..." className="w-full bg-[#111827] border border-[#1f2d3d] rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#00b15c]/50" />
            </div>
            <button onClick={load} className="p-2.5 border border-[#1f2d3d] rounded-lg text-gray-400 hover:text-white transition-all"><RefreshCw className="w-4 h-4" /></button>
            <span className="text-gray-500 text-sm">{total} entries</span>
          </div>

          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1f2d3d]">
                    {['Admin', 'Action', 'Entity', 'Details', 'IP', 'Time'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(10)].map((_, i) => <tr key={i} className="border-b border-[#1f2d3d]/50">{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[#1f2d3d] rounded animate-pulse w-20" /></td>)}</tr>)
                  ) : logs.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-gray-500 py-10">No audit logs found</td></tr>
                  ) : logs.map((log, i) => (
                    <tr key={log.id ?? i} className="border-b border-[#1f2d3d]/50 hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white text-sm">{log.adminEmail ?? log.admin?.email ?? 'System'}</p>
                        <p className="text-gray-500 text-xs capitalize">{log.admin?.role ?? ''}</p>
                      </td>
                      <td className="px-4 py-3"><Badge text={log.action ?? 'unknown'} /></td>
                      <td className="px-4 py-3 text-gray-300 capitalize">{log.entityType ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">{log.details ?? log.description ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">{log.ipAddress ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#1f2d3d]">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 text-gray-400 hover:text-white disabled:opacity-40 text-sm"><ChevronLeft className="w-4 h-4" /> Prev</button>
                <span className="text-gray-500 text-xs">Page {page} of {pages}</span>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="flex items-center gap-1 text-gray-400 hover:text-white disabled:opacity-40 text-sm">Next <ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
