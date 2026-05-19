import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { api } from '@/lib/api/client';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft, ArrowUpRight, RefreshCw, ArrowLeft,
  Download, Search, Filter, TrendingUp, TrendingDown,
  Wallet, Trophy, RotateCcw, Gift,
} from 'lucide-react';

const TYPE_META: Record<string, { label: string; icon: any; color: string; signed: 1 | -1 }> = {
  DEPOSIT:         { label: 'Deposit',         icon: ArrowDownLeft, color: 'text-green-400',  signed:  1 },
  WITHDRAWAL:      { label: 'Withdrawal',      icon: ArrowUpRight,  color: 'text-red-400',    signed: -1 },
  BET_PLACED:      { label: 'Bet Placed',      icon: TrendingDown,  color: 'text-orange-400', signed: -1 },
  BET_WIN:         { label: 'Bet Win',         icon: Trophy,        color: 'text-green-400',  signed:  1 },
  BET_REFUND:      { label: 'Bet Refund',      icon: RotateCcw,     color: 'text-blue-400',   signed:  1 },
  CASHOUT:         { label: 'Cash Out',        icon: Wallet,        color: 'text-purple-400', signed:  1 },
  BONUS:           { label: 'Bonus',           icon: Gift,          color: 'text-yellow-400', signed:  1 },
  COMMISSION:      { label: 'Commission',      icon: TrendingUp,    color: 'text-cyan-400',   signed:  1 },
  ADJUSTMENT:      { label: 'Adjustment',      icon: RefreshCw,     color: 'text-gray-400',   signed:  1 },
};

const STATUS_BADGE: Record<string, string> = {
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
  PENDING:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  FAILED:    'bg-red-500/10 text-red-400 border-red-500/20',
  CANCELLED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const FILTER_TABS = [
  { key: '',            label: 'All' },
  { key: 'DEPOSIT',     label: 'Deposits' },
  { key: 'WITHDRAWAL',  label: 'Withdrawals' },
  { key: 'BET_PLACED',  label: 'Bets' },
  { key: 'BET_WIN',     label: 'Wins' },
];

const fmt = (n: number) => Number(n).toLocaleString();

export default function Transactions() {
  const navigate  = useNavigate();
  const [txns, setTxns]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('');
  const [search, setSearch]   = useState('');
  const [offset, setOffset]   = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 20;

  const load = useCallback(async (reset = false) => {
    const off = reset ? 0 : offset;
    if (reset) setOffset(0);
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(LIMIT), offset: String(off) });
      if (tab) params.set('type', tab);
      const res = await api.get(`/wallet/transactions?${params}`);
      const list: any[] = res.data.data ?? [];
      setTxns(prev => (reset || off === 0) ? list : [...prev, ...list]);
      setHasMore(list.length === LIMIT);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [tab, offset]);

  useEffect(() => { load(true); }, [tab]);

  const filtered = search
    ? txns.filter(t =>
        (t.reference ?? t.id ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (t.description ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : txns;

  const totalIn  = txns.filter(t => TYPE_META[t.type]?.signed === 1  && t.status === 'COMPLETED').reduce((s, t) => s + Number(t.amount), 0);
  const totalOut = txns.filter(t => TYPE_META[t.type]?.signed === -1 && t.status === 'COMPLETED').reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-bold text-xl">Transactions</h1>
          <button
            onClick={() => load(true)}
            className="ml-auto text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownLeft className="w-4 h-4 text-green-400" />
              <p className="text-gray-400 text-xs">Total In</p>
            </div>
            <p className="text-green-400 font-bold text-xl">₦{fmt(totalIn)}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="w-4 h-4 text-red-400" />
              <p className="text-gray-400 text-xs">Total Out</p>
            </div>
            <p className="text-red-400 font-bold text-xl">₦{fmt(totalOut)}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reference or description…"
            className="w-full bg-[#111827] border border-[#1f2d3d] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00b15c]/40"
          />
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-5 scrollbar-hide">
          {FILTER_TABS.map(f => (
            <button
              key={f.key}
              onClick={() => setTab(f.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === f.key
                  ? 'bg-[#00b15c] text-white'
                  : 'bg-[#111827] border border-[#1f2d3d] text-gray-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Transactions list */}
        {loading && txns.length === 0 ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#111827] border border-[#1f2d3d] rounded-xl h-16 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(tx => {
              const meta = TYPE_META[tx.type] ?? TYPE_META.ADJUSTMENT;
              const Icon = meta.icon;
              const signed = meta.signed;
              const statusCls = STATUS_BADGE[tx.status] ?? STATUS_BADGE.PENDING;
              const amount = Number(tx.amount);
              const balAfter = tx.balanceAfter != null ? Number(tx.balanceAfter) : null;

              return (
                <div key={tx.id} className="bg-[#111827] border border-[#1f2d3d] rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-[#0d1520] flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white text-sm font-medium truncate">{meta.label}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium flex-shrink-0 ${statusCls}`}>
                        {tx.status?.charAt(0) + tx.status?.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs truncate">
                      {tx.description ?? tx.reference ?? tx.id?.slice(0, 16)}
                    </p>
                    <p className="text-gray-600 text-[10px] mt-0.5">
                      {new Date(tx.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {balAfter !== null && ` · Bal: ₦${fmt(balAfter)}`}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${signed === 1 ? 'text-green-400' : 'text-red-400'}`}>
                      {signed === 1 ? '+' : '-'}₦{fmt(amount)}
                    </p>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <button
                onClick={() => { setOffset(o => o + LIMIT); load(); }}
                disabled={loading}
                className="w-full py-3 border border-[#1f2d3d] text-gray-400 hover:text-white rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Loading…</> : 'Load More'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
