import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import {
  Zap, RefreshCw, Search, ChevronDown, ChevronUp, Lock, Unlock,
  TrendingUp, Calendar, AlertCircle, CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const SPORTS = ['All', 'Football', 'Basketball', 'Tennis', 'Cricket', 'Rugby', 'Virtual'];
const STATUSES = ['All', 'UPCOMING', 'LIVE', 'FINISHED'];

const OddsInput = ({
  value, suspended, onSave, onToggleSuspend,
}: {
  value: number;
  suspended: boolean;
  onSave: (v: number) => Promise<void>;
  onToggleSuspend: () => Promise<void>;
}) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(value.toFixed(2));
  const [saving, setSaving]   = useState(false);

  const commit = async () => {
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed < 1.01) { setVal(value.toFixed(2)); setEditing(false); return; }
    setSaving(true);
    try { await onSave(parsed); }
    finally { setSaving(false); setEditing(false); }
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(value.toFixed(2)); setEditing(false); } }}
        className="w-16 bg-[#1f2d3d] border border-[#00b15c]/50 text-[#00b15c] text-center text-xs px-1 py-0.5 rounded focus:outline-none font-mono"
      />
    );
  }

  return (
    <div className="flex items-center gap-1 group">
      <button
        onClick={() => !suspended && setEditing(true)}
        disabled={suspended}
        className={`font-mono text-xs px-2 py-1 rounded border transition-colors ${
          suspended
            ? 'text-gray-600 border-gray-700/50 line-through cursor-not-allowed'
            : 'text-[#00b15c] border-[#00b15c]/20 hover:border-[#00b15c]/50 hover:bg-[#00b15c]/5 cursor-text'
        }`}
      >
        {saving ? '…' : parseFloat(String(value)).toFixed(2)}
      </button>
      <button
        onClick={onToggleSuspend}
        title={suspended ? 'Unsuspend' : 'Suspend'}
        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-yellow-400 transition-all"
      >
        {suspended ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
      </button>
    </div>
  );
};

export default function AdminOdds() {
  const [events, setEvents]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [sport, setSport]         = useState('All');
  const [status, setStatus]       = useState('All');
  const [expanded, setExpanded]   = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getEvents({
        search: search || undefined,
        sport: sport !== 'All' ? sport : undefined,
        status: status !== 'All' ? status : undefined,
        limit: 100,
      });
      const list = res.events ?? res.data ?? [];
      setEvents(list.filter((e: any) => (e.markets?.length ?? 0) > 0));
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  }, [search, sport, status]);

  useEffect(() => { load(); }, [load]);

  const toggle = (id: string) => setExpanded(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const updateOddsValue = async (oddsId: string, value: number) => {
    await adminApi.updateOdds(oddsId, { value });
    toast.success('Odds updated');
    setEvents(prev => prev.map(ev => ({
      ...ev,
      markets: ev.markets?.map((m: any) => ({
        ...m,
        odds: m.odds?.map((o: any) => o.id === oddsId ? { ...o, value } : o),
      })),
    })));
  };

  const toggleSuspend = async (oddsId: string, currentlySuspended: boolean) => {
    await adminApi.updateOdds(oddsId, { isSuspended: !currentlySuspended });
    toast.success(currentlySuspended ? 'Odds reinstated' : 'Odds suspended');
    setEvents(prev => prev.map(ev => ({
      ...ev,
      markets: ev.markets?.map((m: any) => ({
        ...m,
        odds: m.odds?.map((o: any) => o.id === oddsId ? { ...o, isSuspended: !currentlySuspended } : o),
      })),
    })));
  };

  const suspendAllMarket = async (market: any) => {
    try {
      await Promise.all(market.odds.map((o: any) => adminApi.updateOdds(o.id, { isSuspended: true })));
      toast.success(`Market "${market.name}" suspended`);
      load();
    } catch { toast.error('Failed to suspend market'); }
  };

  const liveCount     = events.filter(e => e.status === 'LIVE').length;
  const upcomingCount = events.filter(e => e.status === 'UPCOMING').length;
  const oddsCount     = events.reduce((sum, e) => sum + (e.markets ?? []).reduce((s: number, m: any) => s + (m.odds?.length ?? 0), 0), 0);

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="Odds Management" subtitle="Edit and manage sports betting odds" />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Calendar,   label: 'Events with Odds', value: events.length,  color: 'text-blue-400' },
            { icon: Zap,        label: 'Live Events',       value: liveCount,      color: 'text-green-400' },
            { icon: TrendingUp, label: 'Upcoming',          value: upcomingCount,  color: 'text-purple-400' },
            { icon: CheckCircle,label: 'Total Odds Lines',  value: oddsCount,      color: 'text-[#00b15c]' },
          ].map(s => (
            <div key={s.label} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-gray-400 text-sm">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search events…"
                className="bg-transparent text-white text-sm flex-1 outline-none"
              />
            </div>
            <select value={sport} onChange={e => setSport(e.target.value)}
              className="bg-[#0d1520] border border-[#1f2d3d] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none">
              {SPORTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="bg-[#0d1520] border border-[#1f2d3d] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={load} className="p-2 bg-[#0d1520] border border-[#1f2d3d] text-gray-400 hover:text-white rounded-lg transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Events list */}
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#111827] border border-[#1f2d3d] rounded-xl animate-pulse" />
            ))
          ) : events.length === 0 ? (
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-12 text-center">
              <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No events with odds found</p>
              <p className="text-gray-600 text-xs mt-1">Create events and add markets in the Events section first</p>
            </div>
          ) : events.map(ev => {
            const isOpen = expanded.has(ev.id);
            const statusColor = ev.status === 'LIVE'
              ? 'text-green-400 bg-green-500/10 border-green-500/20'
              : ev.status === 'UPCOMING'
                ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                : 'text-gray-400 bg-gray-500/10 border-gray-500/20';

            return (
              <div key={ev.id} className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
                {/* Event header */}
                <div
                  className="flex items-center gap-4 px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => toggle(ev.id)}
                >
                  <div className="w-5 flex-shrink-0">
                    {ev.status === 'LIVE'
                      ? <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                      : <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">
                      {ev.homeTeam} <span className="text-gray-500">vs</span> {ev.awayTeam}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {ev.sport} · {ev.league} · {new Date(ev.startTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs">{ev.markets?.length ?? 0} markets</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColor}`}>{ev.status}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </div>
                </div>

                {/* Markets panel */}
                {isOpen && (
                  <div className="border-t border-[#1f2d3d] bg-[#0d1520]">
                    {(ev.markets ?? []).map((market: any) => (
                      <div key={market.id} className="border-b border-[#1f2d3d]/50 last:border-0 px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300 text-xs font-semibold">{market.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                              market.status === 'OPEN'
                                ? 'text-green-400 bg-green-500/10 border-green-500/20'
                                : 'text-red-400 bg-red-500/10 border-red-500/20'
                            }`}>{market.status}</span>
                          </div>
                          <button
                            onClick={() => suspendAllMarket(market)}
                            className="text-[10px] text-yellow-500 hover:text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded transition-colors"
                          >
                            Suspend All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {(market.odds ?? []).map((o: any) => (
                            <div key={o.id} className="flex items-center gap-1.5">
                              <span className="text-gray-500 text-xs">{o.name}:</span>
                              <OddsInput
                                value={Number(o.value)}
                                suspended={o.isSuspended}
                                onSave={v => updateOddsValue(o.id, v)}
                                onToggleSuspend={() => toggleSuspend(o.id, o.isSuspended)}
                              />
                            </div>
                          ))}
                          {(market.odds ?? []).length === 0 && (
                            <span className="text-gray-600 text-xs">No odds configured</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {events.length > 0 && (
          <p className="text-center text-gray-600 text-xs mt-4">
            Click an odds value to edit · Hover to suspend · Changes save immediately
          </p>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
