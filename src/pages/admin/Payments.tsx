import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import { api } from '@/lib/api/client';
import {
  Smartphone, Building2, CreditCard, Bitcoin, Zap,
  CheckCircle, XCircle, RefreshCw, TrendingUp, Clock, AlertTriangle,
} from 'lucide-react';

const fmtXAF = (n: number) => `${n.toLocaleString()} XAF`;
const fmtPct = (n: number) => `${n.toFixed(1)}%`;

const PROVIDER_META: Record<string, { icon: React.ElementType; color: string; priority: string }> = {
  airtel: { icon: Smartphone, color: 'text-red-400',    priority: 'Priority 1' },
  moov:   { icon: Smartphone, color: 'text-blue-400',   priority: 'Priority 2' },
  bgfi:   { icon: Building2,  color: 'text-emerald-400',priority: 'Priority 3' },
  card:   { icon: CreditCard, color: 'text-purple-400', priority: 'Priority 4' },
  crypto: { icon: Bitcoin,    color: 'text-yellow-400', priority: 'Optional' },
};

const StatusDot = ({ ok }: { ok: boolean }) => (
  <span className={`inline-block w-2 h-2 rounded-full ${ok ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' : 'bg-red-400'}`} />
);

export default function AdminPayments() {
  const [providers, setProviders] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [provRes, wdRes, txRes] = await Promise.all([
        api.get('/wallet/gabon/providers/status').then(r => r.data.data?.providers ?? []).catch(() => []),
        adminApi.getWithdrawals({ status: 'PENDING', limit: 20 }),
        adminApi.getTransactions({ limit: 30 }),
      ]);
      setProviders(provRes);
      setWithdrawals(wdRes?.withdrawals ?? wdRes?.data ?? []);
      const txList = txRes?.transactions ?? txRes?.data ?? [];
      setTransactions(txList);

      // Compute quick stats from transactions
      const deposits  = txList.filter((t: any) => t.type === 'DEPOSIT'    && t.status === 'COMPLETED');
      const wdDone    = txList.filter((t: any) => t.type === 'WITHDRAWAL' && t.status === 'COMPLETED');
      setStats({
        totalDeposits:    deposits.reduce((s: number, t: any) => s + Number(t.amount), 0),
        totalWithdrawals: wdDone.reduce((s: number, t: any) => s + Number(t.amount), 0),
        pendingCount:     wdRes?.total ?? wdRes?.withdrawals?.length ?? 0,
        successRate:      txList.length ? fmtPct(((deposits.length + wdDone.length) / txList.length) * 100) : '—',
      });
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmtDate = (d: string) => new Date(d).toLocaleString('fr-GA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  const methodLabel: Record<string, string> = {
    airtel: 'Airtel Money', moov: 'Moov (Flooz)', bank: 'Bank Transfer',
    crypto: 'USDT Crypto', card: 'Card',
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="Payments & Wallet" onRefresh={load} />
        <div className="p-6 space-y-6">

          {/* ─── KPI Row ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Deposits',    value: loading ? '…' : fmtXAF(stats?.totalDeposits    ?? 0), icon: TrendingUp, color: 'text-green-400' },
              { label: 'Total Withdrawals', value: loading ? '…' : fmtXAF(stats?.totalWithdrawals ?? 0), icon: TrendingUp, color: 'text-orange-400' },
              { label: 'Pending Payouts',   value: loading ? '…' : String(stats?.pendingCount ?? 0),      icon: Clock,       color: 'text-yellow-400' },
              { label: 'Success Rate',      value: loading ? '…' : (stats?.successRate ?? '—'),           icon: CheckCircle, color: 'text-blue-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-white font-bold text-xl">{value}</p>
              </div>
            ))}
          </div>

          {/* ─── Payment Providers ─── */}
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1f2d3d] flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-sm">Payment Providers — Gabon</h3>
                <p className="text-gray-500 text-xs">Live configuration status</p>
              </div>
              <button onClick={load} className="p-1.5 text-gray-500 hover:text-white transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="p-4 space-y-2">{[...Array(5)].map((_,i) => <div key={i} className="h-14 bg-[#1f2d3d] rounded animate-pulse" />)}</div>
            ) : (
              <div className="divide-y divide-[#1f2d3d]/50">
                {(providers.length ? providers : [
                  { id:'airtel', name:'Airtel Money',       configured: false },
                  { id:'moov',   name:'Moov Money (Flooz)', configured: false },
                  { id:'bgfi',   name:'BGFI Bank / UBA',    configured: false },
                  { id:'card',   name:'Visa / Mastercard',  configured: false },
                  { id:'crypto', name:'USDT (Crypto)',      configured: false },
                ]).map((p: any) => {
                  const meta = PROVIDER_META[p.id] ?? { icon: Zap, color: 'text-gray-400', priority: '' };
                  const Icon = meta.icon;
                  return (
                    <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
                      <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${meta.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium">{p.name}</p>
                          <span className="text-[10px] text-gray-600 border border-gray-700 px-1.5 py-0.5 rounded">{meta.priority}</span>
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {p.id === 'airtel' && 'Dominant mobile money · instant settlement'}
                          {p.id === 'moov'   && 'Second largest · Flooz network'}
                          {p.id === 'bgfi'   && 'Bank transfer for high rollers'}
                          {p.id === 'card'   && 'Visa & Mastercard via processor'}
                          {p.id === 'crypto' && 'USDT on-chain · for withdrawals/reserves'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusDot ok={p.configured} />
                        <span className={`text-xs font-medium ${p.configured ? 'text-green-400' : 'text-red-400'}`}>
                          {p.configured ? 'Live' : 'Not Configured'}
                        </span>
                        {!p.configured && (
                          <span className="text-[10px] text-gray-600 ml-1">Set env vars → pm2 restart</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ─── Unified Wallet badge ─── */}
          <div className="bg-gradient-to-r from-[#00b15c]/10 to-[#00b15c]/5 border border-[#00b15c]/20 rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#00b15c] flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Unified Wallet Active</p>
              <p className="text-gray-400 text-xs mt-0.5">
                Players deposit once via any method and bet across all markets — sports, casino, virtuals, jackpot — from one balance.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#00b15c]/20 border border-[#00b15c]/30 rounded-lg px-3 py-2">
              <Clock className="w-3.5 h-3.5 text-[#00b15c]" />
              <span className="text-[#00b15c] text-xs font-bold">⚡ &lt;5 min withdrawals</span>
            </div>
          </div>

          {/* ─── Pending Payouts ─── */}
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1f2d3d] flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-sm">Pending Payouts</h3>
                <p className="text-gray-500 text-xs">Requires manual processing or API confirmation</p>
              </div>
              {(stats?.pendingCount ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-2.5 py-1">
                  <AlertTriangle className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-medium">{stats.pendingCount} pending</span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="p-4 space-y-2">{[...Array(4)].map((_,i) => <div key={i} className="h-12 bg-[#1f2d3d] rounded animate-pulse" />)}</div>
            ) : withdrawals.length === 0 ? (
              <div className="py-12 text-center text-gray-600 text-sm">No pending payouts</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1f2d3d]">
                      {['User', 'Method', 'Amount', 'Reference', 'Requested', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w: any, i: number) => {
                      const meta = w.metadata as any;
                      const method = meta?.method ?? 'bank';
                      return (
                        <tr key={w.id ?? i} className="border-b border-[#1f2d3d]/50 hover:bg-white/2 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-white text-xs truncate max-w-[120px]">{w.user?.email ?? w.userId?.slice(0,8)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-300 text-xs">{methodLabel[method] ?? method}</span>
                          </td>
                          <td className="px-4 py-3 text-[#00b15c] font-bold text-xs">{fmtXAF(Number(w.amount))}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs font-mono">{w.reference?.slice(0,16)}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{w.createdAt ? fmtDate(w.createdAt) : '—'}</td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] px-2 py-0.5 rounded-full border font-medium bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                              Pending
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ─── Recent Transactions ─── */}
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1f2d3d]">
              <h3 className="text-white font-semibold text-sm">Recent Transactions</h3>
            </div>
            {loading ? (
              <div className="p-4 space-y-2">{[...Array(5)].map((_,i) => <div key={i} className="h-10 bg-[#1f2d3d] rounded animate-pulse" />)}</div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center text-gray-600 text-sm">No transactions</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1f2d3d]">
                      {['Type', 'Amount', 'User', 'Description', 'Status', 'Date'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t: any, i: number) => (
                      <tr key={t.id ?? i} className="border-b border-[#1f2d3d]/50 hover:bg-white/2 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${t.type === 'DEPOSIT' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                            {t.type === 'DEPOSIT' ? '↑ DEP' : '↓ WDR'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 font-bold text-xs ${t.type === 'DEPOSIT' ? 'text-green-400' : 'text-orange-400'}`}>
                          {t.type === 'DEPOSIT' ? '+' : '-'}{fmtXAF(Number(t.amount))}
                        </td>
                        <td className="px-4 py-3 text-gray-300 text-xs truncate max-w-[100px]">{t.user?.email ?? t.userId?.slice(0,8)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[180px]">{t.description}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${t.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : t.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{t.createdAt ? fmtDate(t.createdAt) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ─── Env Config Checklist ─── */}
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Environment Variable Checklist</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {[
                { group: 'Airtel Money Gabon', vars: ['AIRTEL_CLIENT_ID', 'AIRTEL_CLIENT_SECRET', 'AIRTEL_PIN_ENCRYPTED'] },
                { group: 'Moov Money (Flooz)', vars: ['MOOV_MERCHANT_ID', 'MOOV_API_KEY', 'MOOV_API_SECRET'] },
                { group: 'BGFI / UBA Bank',    vars: ['BGFI_API_KEY', 'BGFI_MERCHANT_CODE'] },
                { group: 'Card Processing',    vars: ['FLUTTERWAVE_SECRET_KEY', 'FLUTTERWAVE_PUBLIC_KEY', 'FLUTTERWAVE_WEBHOOK_HASH'] },
                { group: 'Crypto (USDT)',       vars: ['CRYPTO_WALLET_ADDRESS', 'CRYPTO_NETWORK'] },
              ].map(({ group, vars }) => (
                <div key={group} className="bg-[#0d1520] rounded-lg p-3">
                  <p className="text-gray-300 font-medium mb-2">{group}</p>
                  <div className="space-y-1">
                    {vars.map(v => (
                      <div key={v} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0" />
                        <code className="text-gray-500 font-mono">{v}</code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-xs mt-3">
              Edit <code className="font-mono">/root/betfuz/backend/.env</code> then run <code className="font-mono">pm2 restart betfuz-api</code>
            </p>
          </div>

        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
