import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import {
  Key, Copy, CheckCircle, XCircle, RefreshCw, Search, Eye, EyeOff,
  Trophy, Newspaper, Brain, Video, Mail, Globe, Wallet, Bitcoin, Zap,
} from 'lucide-react';

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  sports:        { label: 'Sports Data',    icon: Trophy,    color: 'text-green-400' },
  news:          { label: 'News & Search',  icon: Newspaper, color: 'text-blue-400' },
  ai:            { label: 'AI / LLM',       icon: Brain,     color: 'text-purple-400' },
  media:         { label: 'Media & Video',  icon: Video,     color: 'text-orange-400' },
  communication: { label: 'Communication',  icon: Mail,      color: 'text-cyan-400' },
  scraping:      { label: 'Web Scraping',   icon: Globe,     color: 'text-yellow-400' },
  social:        { label: 'Social Media',   icon: Zap,       color: 'text-pink-400' },
  payments:      { label: 'Payments',       icon: Wallet,    color: 'text-emerald-400' },
  crypto:        { label: 'Crypto',         icon: Bitcoin,   color: 'text-amber-400' },
  internal:      { label: 'Internal',       icon: Key,       color: 'text-gray-400' },
};

export default function AdminCredentials() {
  const [credentials, setCredentials] = useState<Record<string, any[]>>({});
  const [stats, setStats]   = useState({ total: 0, configured: 0, missing: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCredentials();
      setCredentials(res?.credentials ?? {});
      setStats(res?.stats ?? { total: 0, configured: 0, missing: 0 });
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleReveal = (key: string) => {
    setRevealed(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredEntries = Object.entries(credentials).filter(([, items]) =>
    !search || items.some(i =>
      i.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.key?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="API Credentials" onRefresh={load} />
        <div className="p-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 text-center">
              <p className="text-white font-bold text-2xl">{stats.total}</p>
              <p className="text-gray-500 text-xs mt-0.5">Total Keys</p>
            </div>
            <div className="bg-[#111827] border border-green-500/20 rounded-xl p-4 text-center">
              <p className="text-green-400 font-bold text-2xl">{stats.configured}</p>
              <p className="text-gray-500 text-xs mt-0.5">Configured</p>
            </div>
            <div className="bg-[#111827] border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-red-400 font-bold text-2xl">{stats.missing}</p>
              <p className="text-gray-500 text-xs mt-0.5">Missing</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              placeholder="Search credentials..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111827] border border-[#1f2d3d] rounded-lg text-white text-sm pl-9 pr-3 py-2 focus:outline-none focus:border-[#00b15c]/50 placeholder:text-gray-600"
            />
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-32 bg-[#111827] border border-[#1f2d3d] rounded-xl animate-pulse" />)}</div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-16 text-gray-600 text-sm">No credentials found</div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map(([category, items]) => {
                const meta = CATEGORY_META[category] ?? { label: category, icon: Key, color: 'text-gray-400' };
                const Icon = meta.icon;
                const filtered = search
                  ? items.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()) || i.key?.toLowerCase().includes(search.toLowerCase()))
                  : items;
                if (!filtered.length) return null;
                const setCount = filtered.filter(i => i.status === 'set').length;

                return (
                  <div key={category} className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#1f2d3d] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4.5 h-4.5 ${meta.color}`} />
                        <span className="text-white font-semibold text-sm">{meta.label}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${setCount === filtered.length ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        {setCount}/{filtered.length} set
                      </span>
                    </div>
                    <div className="divide-y divide-[#1f2d3d]/50">
                      {filtered.map((item: any) => (
                        <div key={item.key} className="flex items-center gap-3 px-5 py-3 hover:bg-white/2 transition-colors">
                          {item.status === 'set'
                            ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}

                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium">{item.name}</p>
                            <p className="text-gray-600 text-xs font-mono">{item.key}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.status === 'set' ? (
                              <>
                                <code className="text-xs bg-[#0d1520] px-2 py-1 rounded border border-[#1f2d3d] font-mono text-gray-300">
                                  {revealed.has(item.key) ? item.value : '••••••••••••'}
                                </code>
                                <button onClick={() => toggleReveal(item.key)} className="p-1.5 text-gray-500 hover:text-white transition-colors">
                                  {revealed.has(item.key) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Not Set</span>
                            )}
                            <button onClick={() => copyKey(item.key)} className="p-1.5 text-gray-500 hover:text-white transition-colors">
                              {copied === item.key ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-400">
            <strong>Security:</strong> Values shown are masked. To update a key, edit <code className="font-mono">/root/betfuz/backend/.env</code> and restart the backend with <code className="font-mono">pm2 restart betfuz-api</code>.
          </div>

        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
