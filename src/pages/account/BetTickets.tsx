import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import {
  Trophy, Clock, X, ChevronDown, ChevronUp, RefreshCw,
  Zap, ArrowLeft, Share2, RotateCcw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  ACTIVE:   { label: 'Running', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400 animate-pulse' },
  WON:      { label: 'Won', cls: 'bg-green-500/10 text-green-400 border-green-500/20', dot: 'bg-green-400' },
  LOST:     { label: 'Lost', cls: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
  PENDING:  { label: 'Pending', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-400' },
  VOID:     { label: 'Void', cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20', dot: 'bg-gray-400' },
  CASHOUT:  { label: 'Cashed Out', cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20', dot: 'bg-purple-400' },
};

const TABS = ['ALL', 'ACTIVE', 'WON', 'LOST'];

const fmt = (n: number) => Number(n).toLocaleString();

export default function BetTickets() {
  const navigate = useNavigate();
  const [bets, setBets]         = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('ALL');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [cashingOut, setCashingOut] = useState<string | null>(null);
  const [cashoutValues, setCashoutValues] = useState<Record<string, number>>({});
  const [page, setPage]         = useState(1);
  const [hasMore, setHasMore]   = useState(false);
  const LIMIT = 10;

  const load = useCallback(async (reset = false) => {
    const p = reset ? 1 : page;
    if (reset) setPage(1);
    setLoading(true);
    try {
      const status = tab === 'ALL' ? '' : tab;
      const res = await api.get(`/bet/my-bets?page=${p}&limit=${LIMIT}${status ? `&status=${status}` : ''}`);
      const data = res.data.data ?? res.data ?? [];
      const list = Array.isArray(data) ? data : data.bets ?? [];
      setBets(prev => (reset || p === 1) ? list : [...prev, ...list]);
      setHasMore(list.length === LIMIT);

      // Fetch cashout values for active bets
      const activeBets = list.filter((b: any) => b.status === 'ACTIVE');
      activeBets.forEach(async (bet: any) => {
        try {
          const co = await api.get(`/bet/cashout-value/${bet.id}`);
          setCashoutValues(prev => ({ ...prev, [bet.id]: co.data.data?.cashoutValue ?? 0 }));
        } catch { /* no cashout available */ }
      });
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [tab, page]);

  useEffect(() => { load(true); }, [tab]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCashout = async (bet: any) => {
    setCashingOut(bet.id);
    try {
      const res = await api.post('/bet/cashout', { betId: bet.id });
      const { cashoutAmount } = res.data.data ?? {};
      toast.success(`Cashed out ${fmt(cashoutAmount)} successfully!`);
      load(true);
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? 'Cashout failed');
    } finally { setCashingOut(null); }
  };

  const handleShare = (bet: any) => {
    const text = bet.status === 'WON'
      ? `I just won ${fmt(bet.actualPayout)} on BetFuz! 🏆 Odds: ${Number(bet.totalOdds).toFixed(2)}`
      : `Watching my bet on BetFuz — ${Number(bet.totalOdds).toFixed(2)} odds, ${fmt(bet.stake)} staked!`;
    if (navigator.share) {
      navigator.share({ title: 'BetFuz', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    }
  };

  const filtered = bets;

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-bold text-xl">My Bet Tickets</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#111827] border border-[#1f2d3d] rounded-xl p-1 mb-5">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === t ? 'bg-[#00b15c] text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'ACTIVE' ? 'Running' : t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Bet list */}
        {loading && bets.length === 0 ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No bets found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((bet: any) => {
              const cfg = STATUS_CFG[bet.status] ?? STATUS_CFG.PENDING;
              const isExpanded = expanded.has(bet.id);
              const coValue = cashoutValues[bet.id];
              const canCashout = bet.status === 'ACTIVE' && coValue > 0;

              return (
                <div key={bet.id} className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
                  {/* Main row */}
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${cfg.cls}`}>{cfg.label}</span>
                        <span className="text-gray-500 text-xs">{bet.betType ?? 'Single'}</span>
                      </div>
                      <span className="text-gray-500 text-xs">{new Date(bet.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-gray-500 text-xs mb-0.5">Stake</p>
                        <p className="text-white font-bold">{fmt(bet.stake)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-0.5">Odds</p>
                        <p className="text-[#00b15c] font-bold">{Number(bet.totalOdds ?? bet.odds ?? 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-0.5">
                          {bet.status === 'WON' ? 'Won' : bet.status === 'CASHOUT' ? 'Cashed Out' : 'Potential'}
                        </p>
                        <p className={`font-bold ${bet.status === 'WON' ? 'text-green-400' : bet.status === 'LOST' ? 'text-red-400' : 'text-white'}`}>
                          {fmt(bet.status === 'WON' ? (bet.actualPayout ?? bet.potentialPayout) : bet.status === 'CASHOUT' ? bet.actualPayout : bet.potentialPayout)}
                        </p>
                      </div>
                    </div>

                    {/* Cashout bar */}
                    {canCashout && (
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 mb-3 flex items-center justify-between">
                        <div>
                          <p className="text-purple-400 text-xs font-medium">Cash Out Available</p>
                          <p className="text-white font-bold text-lg">{fmt(coValue)}</p>
                        </div>
                        <button
                          onClick={() => handleCashout(bet)}
                          disabled={cashingOut === bet.id}
                          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          {cashingOut === bet.id
                            ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing…</>
                            : <><Zap className="w-3.5 h-3.5" /> Cash Out</>
                          }
                        </button>
                      </div>
                    )}

                    {/* Win celebration */}
                    {bet.status === 'WON' && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-3 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <p className="text-green-400 text-sm font-semibold">🎉 You won {fmt(bet.actualPayout ?? bet.potentialPayout)}!</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleExpand(bet.id)}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {isExpanded ? 'Hide' : 'Selections'}
                        {bet.selections?.length ? ` (${bet.selections.length})` : ''}
                      </button>
                      <button
                        onClick={() => handleShare(bet)}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs transition-colors ml-auto"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                      <button
                        onClick={() => toast.info('Rebet — place same selections again')}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Rebet
                      </button>
                    </div>
                  </div>

                  {/* Expanded selections */}
                  {isExpanded && bet.selections?.length > 0 && (
                    <div className="border-t border-[#1f2d3d] bg-[#0d1520]">
                      {bet.selections.map((sel: any, i: number) => (
                        <div key={i} className="flex items-center justify-between px-5 py-2.5 border-b border-[#1f2d3d]/30 last:border-0">
                          <div>
                            <p className="text-white text-xs font-medium">{sel.teamHome ?? sel.event ?? `Selection ${i + 1}`}</p>
                            <p className="text-gray-500 text-xs">{sel.market ?? sel.betType ?? ''} · {sel.selection ?? ''}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#00b15c] font-bold text-sm">{Number(sel.odds ?? 0).toFixed(2)}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${sel.status === 'WON' ? 'bg-green-400' : sel.status === 'LOST' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {hasMore && (
              <button
                onClick={() => { setPage(p => p + 1); load(); }}
                disabled={loading}
                className="w-full py-3 border border-[#1f2d3d] text-gray-400 hover:text-white rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
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
