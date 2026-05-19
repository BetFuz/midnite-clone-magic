import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

const fmtK = (n: number) => n >= 1000000 ? `XAF ${(n/1000000).toFixed(1)}M` : n >= 1000 ? `XAF ${(n/1000).toFixed(0)}K` : `XAF ${n}`;
const SPORT_COLORS = ['#00b15c','#7c3aed','#0891b2','#f97316','#ec4899','#eab308','#6366f1','#14b8a6'];

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1520] border border-[#1f2d3d] rounded-lg p-3 text-xs">
      <p className="text-gray-400 mb-1.5">{label}</p>
      {payload.map((p: any) => <p key={p.name} style={{ color: p.color }} className="font-medium">{p.name}: {typeof p.value === 'number' && p.value > 100 ? fmtK(p.value) : (p.value ?? 0).toLocaleString()}</p>)}
    </div>
  );
};

const KPICard = ({ label, value, change, sub }: any) => (
  <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5">
    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">{label}</p>
    <p className="text-white font-bold text-2xl mb-1">{value}</p>
    <div className="flex items-center gap-1.5">
      {change >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-green-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
      <span className={`text-xs font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{change >= 0 ? '+' : ''}{change}% vs last month</span>
    </div>
    {sub && <p className="text-gray-600 text-xs mt-0.5">{sub}</p>}
  </div>
);

export default function AdminReports() {
  const [weekly, setWeekly]     = useState<any[]>([]);
  const [sports, setSports]     = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [summary, setSummary]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [w, s, t, sum] = await Promise.all([
        adminApi.getWeeklyAnalytics(),
        adminApi.getSportsBreakdown(),
        adminApi.getTopUsers(),
        adminApi.getAnalyticsSummary(),
      ]);
      setWeekly(w?.days ?? []);
      setSports(s?.sports ?? []);
      setTopUsers(t?.topBettors ?? []);
      setSummary(sum);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const chartData = weekly.map(d => ({
    date: new Date(d.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric' }),
    Deposits: d.deposits, Withdrawals: d.withdrawals, 'Net Revenue': d.netRevenue,
    Bets: d.bets, 'New Users': d.newUsers,
  }));

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="Analytics & Reports" onRefresh={load} />
        <div className="p-6 space-y-6">

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">{[...Array(5)].map((_,i) => <div key={i} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5 h-28 animate-pulse" />)}</div>
          ) : summary && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <KPICard label="Deposits"    value={fmtK(summary.thisMonth?.deposits ?? 0)}    change={summary.changes?.deposits ?? 0} sub="this month" />
              <KPICard label="Withdrawals" value={fmtK(summary.thisMonth?.withdrawals ?? 0)} change={summary.changes?.withdrawals ?? 0} />
              <KPICard label="Net Revenue" value={fmtK(summary.thisMonth?.netRevenue ?? 0)}  change={summary.changes?.netRevenue ?? 0} />
              <KPICard label="Bets Placed" value={(summary.thisMonth?.bets ?? 0).toLocaleString()} change={summary.changes?.bets ?? 0} />
              <KPICard label="New Users"   value={(summary.thisMonth?.newUsers ?? 0).toLocaleString()} change={summary.changes?.newUsers ?? 0} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">7-Day Revenue Trend</h3>
                <button onClick={load} className="p-1.5 text-gray-500 hover:text-white transition-all"><RefreshCw className="w-3.5 h-3.5" /></button>
              </div>
              {loading ? <div className="h-52 bg-[#1f2d3d]/30 rounded-lg animate-pulse" /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="rGd" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00b15c" stopOpacity={0.3}/><stop offset="95%" stopColor="#00b15c" stopOpacity={0}/></linearGradient>
                      <linearGradient id="rGw" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient>
                      <linearGradient id="rGn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0891b2" stopOpacity={0.3}/><stop offset="95%" stopColor="#0891b2" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2d3d" />
                    <XAxis dataKey="date" tick={{ fill:'#6b7280', fontSize:10 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmtK} tick={{ fill:'#6b7280', fontSize:10 }} axisLine={false} tickLine={false} width={55} />
                    <Tooltip content={<ChartTip />} />
                    <Legend wrapperStyle={{ fontSize:11, color:'#9ca3af' }} />
                    <Area type="monotone" dataKey="Deposits"    stroke="#00b15c" strokeWidth={2} fill="url(#rGd)" dot={false} />
                    <Area type="monotone" dataKey="Withdrawals" stroke="#f97316" strokeWidth={2} fill="url(#rGw)" dot={false} />
                    <Area type="monotone" dataKey="Net Revenue" stroke="#0891b2" strokeWidth={2} fill="url(#rGn)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Daily Bets & New Users</h3>
              {loading ? <div className="h-52 bg-[#1f2d3d]/30 rounded-lg animate-pulse" /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2d3d" />
                    <XAxis dataKey="date" tick={{ fill:'#6b7280', fontSize:10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'#6b7280', fontSize:10 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={<ChartTip />} />
                    <Legend wrapperStyle={{ fontSize:11, color:'#9ca3af' }} />
                    <Bar dataKey="Bets" fill="#7c3aed" radius={[3,3,0,0]} />
                    <Bar dataKey="New Users" fill="#0891b2" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Bets by Sport (30 days)</h3>
              {loading ? <div className="h-52 bg-[#1f2d3d]/30 rounded-lg animate-pulse" /> : sports.length === 0 ? (
                <div className="h-52 flex items-center justify-center text-gray-600 text-sm">No sports data yet</div>
              ) : (
                <div className="flex items-center gap-5">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={sports} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="count" paddingAngle={2}>
                        {sports.map((_: any, i: number) => <Cell key={i} fill={SPORT_COLORS[i % SPORT_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => [v.toLocaleString(), 'Bets']} contentStyle={{ background:'#0d1520', border:'1px solid #1f2d3d', borderRadius:8, fontSize:12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {sports.map((s: any, i: number) => (
                      <div key={s.sport} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: SPORT_COLORS[i % SPORT_COLORS.length] }} />
                          <span className="text-gray-300 text-sm">{s.sport}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white text-sm font-medium">{s.count.toLocaleString()}</span>
                          <p className="text-gray-500 text-[10px]">{fmtK(s.volume ?? 0)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1f2d3d]">
                <h3 className="text-white font-semibold text-sm">Top Bettors</h3>
                <p className="text-gray-500 text-xs">By total stake volume (all time)</p>
              </div>
              {loading ? <div className="p-4 space-y-2">{[...Array(6)].map((_,i) => <div key={i} className="h-10 bg-[#1f2d3d] rounded animate-pulse" />)}</div>
              : topUsers.length === 0 ? <div className="text-center text-gray-600 py-10 text-sm">No data</div>
              : topUsers.map((b: any, i: number) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-[#1f2d3d]/50 hover:bg-white/2 transition-colors">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-[#1f2d3d] text-gray-500'}`}>{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{b.user?.email ?? 'Unknown'}</p>
                    <p className="text-gray-500 text-xs">{b.betCount} bets · {b.user?.kycTier ?? ''}</p>
                  </div>
                  <p className="text-[#00b15c] font-bold text-sm">{fmtK(b.totalStake ?? 0)}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
