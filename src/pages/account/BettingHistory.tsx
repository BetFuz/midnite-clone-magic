import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { api } from '@/lib/api/client';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, X, Clock, ArrowLeft, RefreshCw,
  Search, ChevronDown, ChevronUp, Download,
} from 'lucide-react';

const STATUS: Record<string, { label: string; cls: string }> = {
  WON:     { label: 'Won',     cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
  LOST:    { label: 'Lost',    cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
  ACTIVE:  { label: 'Running', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  VOID:    { label: 'Void',    cls: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
  CASHOUT: { label: 'Cashout', cls: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
};

const fmt  = (n: number) => Number(n).toLocaleString();
const odds = (n: number) => Number(n).toFixed(2);

export default function BettingHistory() {
  const navigate  = useNavigate();
  const [bets, setBets]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 15;

  const load = useCallback(async (reset = false) => {
    const p = reset ? 1 : page;
    if (reset) setPage(1);
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
      if (status) params.set('status', status);
      const res = await api.get(`/bet/my-bets?${params}`);
      const data = res.data.data ?? res.data ?? [];
      const list: any[] = Array.isArray(data) ? data : data.bets ?? [];
      setBets(prev => (reset || p === 1) ? list : [...prev, ...list]);
      setHasMore(list.length === LIMIT);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [status, page]);

  useEffect(() => { load(true); }, [status]);

  const toggle = (id: string) => setExpanded(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const filtered = search
    ? bets.filter(b =>
        (b.reference ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (b.betType ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : bets;

  const totalStaked = bets.reduce((s, b) => s + Number(b.stake), 0);
  const totalWon    = bets.filter(b => b.status === 'WON').reduce((s, b) => s + Number(b.actualPayout ?? 0), 0);
  const winRate     = bets.length ? Math.round(bets.filter(b => b.status === 'WON').length / bets.length * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-bold text-xl">Betting History</h1>
          <button onClick={() => load(true)} className="ml-auto text-gray-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total Bets', value: bets.length.toString() },
            { label: 'Win Rate', value: `${winRate}%` },
            { label: 'Net P&L', value: `₦${fmt(totalWon - totalStaked)}`, colored: true, pnl: totalWon - totalStaked },
          ].map(s => (
            <div key={s.label} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-3 text-center">
              <p className={`font-bold text-lg ${s.colored ? (s.pnl! >= 0 ? 'text-green-400' : 'text-red-400') : 'text-white'}`}>{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reference…"
              className="w-full bg-[#111827] border border-[#1f2d3d] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00b15c]/40"
            />
          </div>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="bg-[#111827] border border-[#1f2d3d] rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
          >
            <option value="">All</option>
            <option value="ACTIVE">Running</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
            <option value="VOID">Void</option>
          </select>
        </div>

        {/* Table */}
        {loading && bets.length === 0 ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-[#111827] border border-[#1f2d3d] rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No bets found</p>
          </div>
        ) : (
          <>
            {/* Header row */}
            <div className="hidden sm:grid grid-cols-[1fr_80px_80px_90px_80px_40px] gap-2 px-4 py-2 text-gray-600 text-xs uppercase tracking-wider mb-1">
              <span>Bet</span><span className="text-right">Stake</span><span className="text-right">Odds</span>
              <span className="text-right">Return</span><span className="text-center">Status</span><span />
            </div>

            <div className="space-y-1.5">
              {filtered.map(bet => {
                const cfg = STATUS[bet.status] ?? STATUS.ACTIVE;
                const isOpen = expanded.has(bet.id);
                const payout = bet.status === 'WON' ? Number(bet.actualPayout ?? 0) : Number(bet.potentialPayout ?? 0);

                return (
                  <div key={bet.id} className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
                    <div
                      className="grid grid-cols-[1fr_80px_80px_90px_80px_40px] gap-2 px-4 py-3.5 items-center cursor-pointer hover:bg-[#1a2535] transition-colors"
                      onClick={() => toggle(bet.id)}
                    >
                      <div>
                        <p className="text-white text-sm font-medium">{bet.betType ?? 'Single'}</p>
                        <p className="text-gray-500 text-xs">{new Date(bet.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-white text-sm text-right">₦{fmt(bet.stake)}</p>
                      <p className="text-[#00b15c] text-sm text-right font-bold">{odds(bet.totalOdds ?? 1)}</p>
                      <p className={`text-sm text-right font-bold ${bet.status === 'WON' ? 'text-green-400' : bet.status === 'LOST' ? 'text-red-400' : 'text-white'}`}>
                        ₦{fmt(payout)}
                      </p>
                      <div className="flex justify-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cfg.cls}`}>{cfg.label}</span>
                      </div>
                      <div className="flex justify-center text-gray-500">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {isOpen && bet.selections?.length > 0 && (
                      <div className="border-t border-[#1f2d3d] bg-[#0d1520]">
                        {bet.selections.map((sel: any, i: number) => (
                          <div key={i} className="flex items-center justify-between px-5 py-2.5 border-b border-[#1f2d3d]/30 last:border-0">
                            <div>
                              <p className="text-white text-xs font-medium">{sel.teamHome ?? sel.event ?? `Selection ${i + 1}`}</p>
                              <p className="text-gray-500 text-xs">{sel.market ?? ''} · {sel.selection ?? ''}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[#00b15c] font-bold text-sm">{odds(sel.odds ?? 0)}</span>
                              <span className={`w-1.5 h-1.5 rounded-full ${sel.status === 'WON' ? 'bg-green-400' : sel.status === 'LOST' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <button
                onClick={() => { setPage(p => p + 1); load(); }}
                disabled={loading}
                className="w-full mt-3 py-3 border border-[#1f2d3d] text-gray-400 hover:text-white rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Loading…</> : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
