import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, Activity, DollarSign, TrendingUp, AlertTriangle, ShieldCheck,
  ArrowRight, Brain, RefreshCw, ArrowUpRight, ArrowDownRight,
  Database, Zap, Server, Calendar, Radio,
} from 'lucide-react';


const fmt = (n: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
const fmtNum = (n: number) => new Intl.NumberFormat().format(n);
const fmtK = (n: number) => n >= 1000000 ? `₦${(n/1000000).toFixed(1)}M` : n >= 1000 ? `₦${(n/1000).toFixed(0)}K` : `₦${n}`;

const StatCard = ({ icon: Icon, label, value, sub, color, change, onClick }: any) => (
  <div
    onClick={onClick}
    className={`bg-[#111827] border border-[#1f2d3d] rounded-xl p-5 ${onClick ? 'cursor-pointer hover:border-[#00b15c]/30 transition-all' : ''}`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-4.5 h-4.5 text-white" />
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-0.5 text-xs font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      )}
      {onClick && change === undefined && <ArrowRight className="w-4 h-4 text-gray-600" />}
    </div>
    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
    <p className="text-white font-bold text-2xl">{value}</p>
    {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
  </div>
);

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1520] border border-[#1f2d3d] rounded-lg p-3 text-xs">
      <p className="text-gray-400 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">{p.name}: {p.name.includes('Revenue') || p.name.includes('Deposit') || p.name.includes('Withdrawal') ? fmtK(p.value) : fmtNum(p.value)}</p>
      ))}
    </div>
  );
};

const ServiceDot = ({ ok, label }: { ok: boolean | undefined; label: string }) => (
  <div className="flex items-center gap-2">
    <span className={`w-2 h-2 rounded-full ${ok === undefined ? 'bg-gray-600' : ok ? 'bg-[#00b15c]' : 'bg-red-500'}`} />
    <span className={`text-xs ${ok ? 'text-gray-400' : ok === false ? 'text-red-400' : 'text-gray-600'}`}>{label}</span>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]         = useState<any>(null);
  const [weekly, setWeekly]       = useState<any[]>([]);
  const [summary, setSummary]     = useState<any>(null);
  const [health, setHealth]       = useState<any>(null);
  const [insights, setInsights]   = useState<string>('');
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [syncing, setSyncing]     = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingAI, setLoadingAI]       = useState(false);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch { /* silent */ }
    finally { setLoadingStats(false); }
  }, []);

  const loadCharts = useCallback(async () => {
    setLoadingCharts(true);
    try {
      const [w, s, h, evRes] = await Promise.all([
        adminApi.getWeeklyAnalytics(),
        adminApi.getAnalyticsSummary(),
        adminApi.getHealth(),
        adminApi.getEvents({ status: 'LIVE', limit: 10 }),
      ]);
      setWeekly(w?.days ?? []);
      setSummary(s);
      setHealth(h);
      setLiveEvents(evRes?.events ?? evRes?.data ?? []);
    } catch { /* silent */ }
    finally { setLoadingCharts(false); }
  }, []);

  const handleSyncOdds = async () => {
    setSyncing(true);
    try {
      const res = await adminApi.syncOdds();
      const evRes = await adminApi.getEvents({ status: 'LIVE', limit: 10 });
      setLiveEvents(evRes?.events ?? []);
      const msg = res.activeEvents !== undefined
        ? `Synced — ${res.activeEvents} active events`
        : 'Odds synced successfully';
      toast.success(msg);
    } catch {
      toast.error('Sync failed');
    } finally { setSyncing(false); }
  };

  const loadInsights = async () => {
    setLoadingAI(true);
    try {
      const data = await adminApi.getAIInsights();
      setInsights(data?.insights ?? data ?? 'No insights returned.');
    } catch { setInsights('Unable to load AI insights — check your Anthropic API key.'); }
    finally { setLoadingAI(false); }
  };

  useEffect(() => { loadStats(); loadCharts(); }, [loadStats, loadCharts]);

  const handleRefresh = () => { loadStats(); loadCharts(); };

  const chartData = weekly.map(d => ({
    date: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    Deposits: d.deposits,
    Withdrawals: d.withdrawals,
    'Net Revenue': d.netRevenue,
    Bets: d.bets,
    'New Users': d.newUsers,
  }));

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="Dashboard" onRefresh={handleRefresh} />
        <div className="p-6 space-y-6">

          {/* Alert Banner */}
          {stats && (stats.pending?.withdrawals > 0 || stats.pending?.kyc > 0 || stats.pending?.fraudFlags > 0) && (
            <div className="bg-[#1a1000] border border-yellow-500/20 rounded-xl p-4 flex flex-wrap gap-2 items-center">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-semibold">Action Required:</span>
              {stats.pending.withdrawals > 0 && (
                <button onClick={() => navigate('/admin/finances')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium hover:opacity-80 transition-all">
                  <DollarSign className="w-3 h-3" />{stats.pending.withdrawals} pending withdrawals
                </button>
              )}
              {stats.pending.kyc > 0 && (
                <button onClick={() => navigate('/admin/kyc')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:opacity-80 transition-all">
                  <ShieldCheck className="w-3 h-3" />{stats.pending.kyc} KYC pending
                </button>
              )}
              {stats.pending.fraudFlags > 0 && (
                <button onClick={() => navigate('/admin/users')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:opacity-80 transition-all">
                  <AlertTriangle className="w-3 h-3" />{stats.pending.fraudFlags} fraud flags
                </button>
              )}
            </div>
          )}

          {/* KPI Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loadingStats ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5 animate-pulse">
                  <div className="w-9 h-9 bg-[#1f2d3d] rounded-lg mb-3" />
                  <div className="h-3 bg-[#1f2d3d] rounded w-20 mb-2" />
                  <div className="h-7 bg-[#1f2d3d] rounded w-24" />
                </div>
              ))
            ) : stats ? (
              <>
                <StatCard icon={Users}       label="Total Users"       value={fmtNum(stats.users?.total ?? 0)}           sub={`+${stats.users?.newToday ?? 0} today`}             color="bg-blue-500/20"    change={summary?.changes?.newUsers}   onClick={() => navigate('/admin/users')}    />
                <StatCard icon={Activity}    label="Total Bets"        value={fmtNum(stats.bets?.total ?? 0)}            sub={`${fmtNum(stats.bets?.active ?? 0)} active`}        color="bg-purple-500/20"  change={summary?.changes?.bets}       onClick={() => navigate('/admin/bets')}     />
                <StatCard icon={TrendingUp}  label="Today's Bets"      value={fmtNum(stats.bets?.today ?? 0)}            sub="placed today"                                       color="bg-[#00b15c]/20"   />
                <StatCard icon={Users}       label="Suspended"         value={fmtNum(stats.users?.suspended ?? 0)}       sub="accounts"                                           color="bg-red-500/20"     onClick={() => navigate('/admin/users')}    />
                <StatCard icon={DollarSign}  label="Total Deposits"    value={fmt(stats.revenue?.totalDeposits ?? 0)}    sub={`+${fmt(stats.revenue?.todayDeposits ?? 0)} today`} color="bg-emerald-500/20" change={summary?.changes?.deposits}    onClick={() => navigate('/admin/finances')} />
                <StatCard icon={DollarSign}  label="Total Withdrawals" value={fmt(stats.revenue?.totalWithdrawals ?? 0)} sub={`+${fmt(stats.revenue?.todayWithdrawals ?? 0)} today`} color="bg-orange-500/20" change={summary?.changes?.withdrawals} onClick={() => navigate('/admin/finances')} />
                <StatCard icon={TrendingUp}  label="Net Revenue"       value={fmt(stats.revenue?.netRevenue ?? 0)}       sub="deposits − withdrawals"                             color="bg-cyan-500/20"    change={summary?.changes?.netRevenue}  />
                <StatCard icon={ShieldCheck} label="Pending KYC"       value={fmtNum(stats.pending?.kyc ?? 0)}           sub={`${stats.pending?.withdrawals ?? 0} withdrawals`}   color="bg-yellow-500/20"  onClick={() => navigate('/admin/kyc')}      />
              </>
            ) : (
              <div className="col-span-4 text-center text-gray-500 py-8">Failed to load. <button onClick={loadStats} className="text-[#00b15c] hover:underline">Retry</button></div>
            )}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Revenue Chart */}
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">7-Day Revenue</h3>
                <span className="text-gray-500 text-xs">Deposits vs Withdrawals</span>
              </div>
              {loadingCharts ? (
                <div className="h-40 bg-[#1f2d3d]/30 rounded-lg animate-pulse" />
              ) : chartData.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-gray-600 text-sm">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="gDeposit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00b15c" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00b15c" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gWithdraw" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2d3d" />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => fmtK(v)} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={55} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="Deposits"    stroke="#00b15c" strokeWidth={2} fill="url(#gDeposit)"  dot={false} />
                    <Area type="monotone" dataKey="Withdrawals" stroke="#f97316" strokeWidth={2} fill="url(#gWithdraw)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Bets + New Users Chart */}
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">7-Day Activity</h3>
                <span className="text-gray-500 text-xs">Bets & New Users</span>
              </div>
              {loadingCharts ? (
                <div className="h-40 bg-[#1f2d3d]/30 rounded-lg animate-pulse" />
              ) : chartData.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-gray-600 text-sm">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2d3d" />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="Bets" fill="#7c3aed" radius={[3,3,0,0]} />
                    <Bar dataKey="New Users" fill="#0891b2" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Live Games Panel */}
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-green-400" />
                <h3 className="text-white font-semibold text-sm">Live Events</h3>
                {liveEvents.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncOdds} disabled={syncing}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-[#1f2d3d] px-2.5 py-1 rounded-lg transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing…' : 'Sync Odds'}
                </button>
                <button onClick={() => navigate('/admin/events')} className="text-[#00b15c] text-xs hover:underline">
                  All events →
                </button>
              </div>
            </div>
            {liveEvents.length === 0 ? (
              <div className="text-center py-5">
                <Calendar className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-600 text-xs">No live events right now</p>
                <button onClick={handleSyncOdds} disabled={syncing} className="mt-2 text-[#00b15c] text-xs hover:underline">
                  Sync from odds API →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {liveEvents.slice(0, 6).map((ev: any) => (
                  <div key={ev.id} className="flex items-center justify-between px-3 py-2 bg-[#0d1520] rounded-lg border border-green-500/10">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{ev.homeTeam} vs {ev.awayTeam}</p>
                      <p className="text-gray-500 text-[10px]">{ev.league}</p>
                    </div>
                    {(ev.homeScore != null || ev.awayScore != null) && (
                      <div className="text-green-400 font-bold text-sm tabular-nums ml-2">
                        {ev.homeScore ?? 0} – {ev.awayScore ?? 0}
                      </div>
                    )}
                    {ev.minute != null && (
                      <span className="ml-2 text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">
                        {ev.minute}'
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Row: Quick Actions + System Health + AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Quick Actions */}
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Manage Users',    to: '/admin/users',     color: 'text-blue-400',    bg: 'hover:bg-blue-500/5' },
                  { label: 'Review Bets',     to: '/admin/bets',      color: 'text-purple-400',  bg: 'hover:bg-purple-500/5' },
                  { label: 'KYC Queue',       to: '/admin/kyc',       color: 'text-yellow-400',  bg: 'hover:bg-yellow-500/5' },
                  { label: 'Withdrawals',     to: '/admin/finances',  color: 'text-emerald-400', bg: 'hover:bg-emerald-500/5' },
                  { label: 'Bonus Manager',   to: '/admin/bonus',     color: 'text-pink-400',    bg: 'hover:bg-pink-500/5' },
                  { label: 'Events & Odds',   to: '/admin/events',    color: 'text-green-400',   bg: 'hover:bg-green-500/5' },
                ].map(a => (
                  <button key={a.to} onClick={() => navigate(a.to)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-[#1f2d3d] ${a.bg} transition-all text-left`}>
                    <span className={`text-sm font-medium ${a.color}`}>{a.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">System Health</h3>
                {health && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${health.status === 'healthy' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {health.status ?? 'unknown'}
                  </span>
                )}
              </div>
              {loadingCharts ? (
                <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-8 bg-[#1f2d3d] rounded animate-pulse" />)}</div>
              ) : health ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Database className="w-3.5 h-3.5 text-gray-500" /><span className="text-gray-400 text-sm">PostgreSQL</span></div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">{health.services?.database?.responseMs}ms</span>
                      <ServiceDot ok={health.services?.database?.ok} label="" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-gray-500" /><span className="text-gray-400 text-sm">Redis</span></div>
                    <div className="flex items-center gap-2">
                      {health.services?.redis?.hitRate != null && <span className="text-gray-500 text-xs">{health.services.redis.hitRate}% hit</span>}
                      <ServiceDot ok={health.services?.redis?.ok} label="" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-orange-400" /><span className="text-gray-400 text-sm">n8n</span></div>
                    <ServiceDot ok={health.services?.n8n?.ok} label="" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Server className="w-3.5 h-3.5 text-gray-500" /><span className="text-gray-400 text-sm">API Server</span></div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">{Math.floor(health.uptime / 3600)}h uptime</span>
                      <span className="text-gray-500 text-xs">{health.node?.memUsedMb}MB</span>
                      <ServiceDot ok={true} label="" />
                    </div>
                  </div>
                  <div className="pt-1 border-t border-[#1f2d3d]">
                    <button onClick={() => navigate('/admin/credentials')} className="text-[#00b15c] text-xs hover:underline">View credentials →</button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-sm text-center py-4">Health check failed</p>
              )}
            </div>

            {/* AI Insights */}
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold text-sm">AI Insights</h3>
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Claude</span>
                </div>
                <button onClick={loadInsights} disabled={loadingAI} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white border border-[#1f2d3d] px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50">
                  {loadingAI ? <><span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />...</> : <><RefreshCw className="w-3 h-3" />Analyze</>}
                </button>
              </div>
              {insights ? (
                <div className="text-gray-300 text-xs leading-relaxed whitespace-pre-line max-h-52 overflow-y-auto pr-1">{insights}</div>
              ) : (
                <div className="text-center py-6">
                  <Brain className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-600 text-xs">Click Analyze for Claude AI platform insights</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
