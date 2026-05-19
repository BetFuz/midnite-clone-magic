import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Gift, ArrowLeft, Clock, CheckCircle, Zap, RefreshCw,
  Star, Trophy, Lock, TrendingUp,
} from 'lucide-react';

const BONUS_ICONS: Record<string, any> = {
  WELCOME: Gift,
  DEPOSIT: TrendingUp,
  REFERRAL: Star,
  CASHBACK: RefreshCw,
  VIP: Trophy,
  FREE_BET: Zap,
};

const BONUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  WELCOME:  { bg: 'bg-green-500/10',  border: 'border-green-500/20',  text: 'text-green-400'  },
  DEPOSIT:  { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400'   },
  REFERRAL: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400' },
  CASHBACK: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
  VIP:      { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
  FREE_BET: { bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   text: 'text-cyan-400'   },
};

const fmt = (n: number) => Number(n).toLocaleString();

const daysLeft = (expiresAt: string | null) => {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
};

export default function Bonuses() {
  const navigate = useNavigate();
  const [bonuses, setBonuses]       = useState<any[]>([]);
  const [userBonuses, setUserBonuses] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [claiming, setClaiming]     = useState<string | null>(null);
  const [tab, setTab]               = useState<'available' | 'active' | 'history'>('available');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bonus');
      setBonuses(res.data.data?.bonuses ?? []);
      setUserBonuses(res.data.data?.userBonuses ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const claim = async (bonusId: string) => {
    setClaiming(bonusId);
    try {
      await api.post('/bonus/claim', { bonusId });
      toast.success('Bonus claimed! Check your Active Bonuses.');
      await load();
      setTab('active');
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? 'Could not claim bonus');
    } finally { setClaiming(null); }
  };

  const claimedIds = new Set(userBonuses.map(ub => ub.bonusId));
  const activeBonuses  = userBonuses.filter(ub => ub.remainingAmount > 0 && new Date(ub.expiresAt) > new Date());
  const historyBonuses = userBonuses.filter(ub => ub.remainingAmount === 0 || new Date(ub.expiresAt) <= new Date());
  const availableBonuses = bonuses.filter(b => !claimedIds.has(b.id));

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white font-bold text-xl">My Bonuses</h1>
            <p className="text-gray-500 text-sm">Claim rewards and track your active bonuses</p>
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Available', value: availableBonuses.length, color: 'text-[#00b15c]' },
            { label: 'Active', value: activeBonuses.length, color: 'text-blue-400' },
            { label: 'Used', value: historyBonuses.length, color: 'text-gray-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#111827] border border-[#1f2d3d] rounded-xl p-1 mb-5">
          {([
            { key: 'available', label: 'Available' },
            { key: 'active',    label: 'Active' },
            { key: 'history',   label: 'History' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === t.key ? 'bg-[#00b15c] text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#111827] border border-[#1f2d3d] rounded-xl h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Available bonuses */}
            {tab === 'available' && (
              <div className="space-y-3">
                {availableBonuses.length === 0 ? (
                  <div className="text-center py-16">
                    <Gift className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500">No bonuses available right now</p>
                    <p className="text-gray-600 text-xs mt-1">Check back soon or level up your VIP tier</p>
                    <button
                      onClick={() => navigate('/account/vip')}
                      className="mt-4 text-[#00b15c] text-sm hover:underline"
                    >
                      View VIP Club →
                    </button>
                  </div>
                ) : availableBonuses.map(bonus => {
                  const type = bonus.bonusType ?? 'WELCOME';
                  const cfg = BONUS_COLORS[type] ?? BONUS_COLORS.WELCOME;
                  const Icon = BONUS_ICONS[type] ?? Gift;
                  const isClaiming = claiming === bonus.id;
                  const days = daysLeft(bonus.endsAt);
                  return (
                    <div key={bonus.id} className={`rounded-2xl border p-5 ${cfg.bg} ${cfg.border}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${cfg.text}`} />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{bonus.name}</p>
                            <p className={`text-xs ${cfg.text}`}>{type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        {days !== null && days <= 3 && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                            {days}d left
                          </span>
                        )}
                      </div>

                      <p className="text-gray-400 text-xs mb-3 leading-relaxed">{bonus.description ?? `Claim this ${type.toLowerCase()} bonus and boost your balance!`}</p>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-black/20 rounded-xl p-2.5 text-center">
                          <p className={`font-bold text-sm ${cfg.text}`}>
                            {bonus.fixedAmount ? `₦${fmt(bonus.fixedAmount)}` : `${bonus.percentageAmount ?? 0}%`}
                          </p>
                          <p className="text-gray-500 text-[10px]">Bonus</p>
                        </div>
                        <div className="bg-black/20 rounded-xl p-2.5 text-center">
                          <p className={`font-bold text-sm ${cfg.text}`}>{bonus.rolloverMultiple ?? 1}x</p>
                          <p className="text-gray-500 text-[10px]">Rollover</p>
                        </div>
                        <div className="bg-black/20 rounded-xl p-2.5 text-center">
                          <p className={`font-bold text-sm ${cfg.text}`}>{bonus.validDays ?? 30}d</p>
                          <p className="text-gray-500 text-[10px]">Valid for</p>
                        </div>
                      </div>

                      <button
                        onClick={() => claim(bonus.id)}
                        disabled={isClaiming}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${cfg.text.replace('text-', 'bg-').replace('-400', '-600')} hover:opacity-90 text-white`}
                      >
                        {isClaiming
                          ? <><RefreshCw className="w-4 h-4 animate-spin" /> Claiming…</>
                          : <><Zap className="w-4 h-4" /> Claim Bonus</>
                        }
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Active bonuses */}
            {tab === 'active' && (
              <div className="space-y-3">
                {activeBonuses.length === 0 ? (
                  <div className="text-center py-16">
                    <Lock className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500">No active bonuses</p>
                    <button onClick={() => setTab('available')} className="mt-4 text-[#00b15c] text-sm hover:underline">
                      Claim a bonus →
                    </button>
                  </div>
                ) : activeBonuses.map(ub => {
                  const type = ub.bonus?.bonusType ?? 'WELCOME';
                  const cfg = BONUS_COLORS[type] ?? BONUS_COLORS.WELCOME;
                  const rolloverPct = ub.rolloverRequired > 0
                    ? Math.min(100, (ub.rolloverCompleted / ub.rolloverRequired) * 100)
                    : 100;
                  const days = daysLeft(ub.expiresAt);
                  return (
                    <div key={ub.id} className="bg-[#111827] border border-[#1f2d3d] rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-white font-semibold text-sm">{ub.bonus?.name ?? 'Bonus'}</p>
                          <p className={`text-xs ${cfg.text}`}>{type.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold text-lg">₦{fmt(ub.remainingAmount)}</p>
                          <p className="text-gray-500 text-xs">remaining</p>
                        </div>
                      </div>

                      {/* Rollover progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Rollover progress</span>
                          <span>₦{fmt(ub.rolloverCompleted)} / ₦{fmt(ub.rolloverRequired)}</span>
                        </div>
                        <div className="h-1.5 bg-[#0d1520] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cfg.text.replace('text-', 'bg-').replace('-400', '-500')}`}
                            style={{ width: `${rolloverPct}%` }}
                          />
                        </div>
                        <p className="text-gray-600 text-[10px] mt-1">{rolloverPct.toFixed(0)}% complete</p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span className={days !== null && days <= 3 ? 'text-red-400' : 'text-gray-500'}>
                          {days !== null ? `${days} days left` : 'No expiry'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* History */}
            {tab === 'history' && (
              <div className="space-y-3">
                {historyBonuses.length === 0 ? (
                  <div className="text-center py-16">
                    <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500">No bonus history yet</p>
                  </div>
                ) : historyBonuses.map(ub => {
                  const type = ub.bonus?.bonusType ?? 'WELCOME';
                  const cfg = BONUS_COLORS[type] ?? BONUS_COLORS.WELCOME;
                  const isExpired = new Date(ub.expiresAt) <= new Date();
                  const isUsed = ub.remainingAmount === 0;
                  return (
                    <div key={ub.id} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center`}>
                          <CheckCircle className={`w-4 h-4 ${isUsed ? cfg.text : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{ub.bonus?.name ?? 'Bonus'}</p>
                          <p className="text-gray-500 text-xs">{new Date(ub.activatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-sm">₦{fmt(ub.bonusAmount)}</p>
                        <p className={`text-[10px] ${isUsed ? 'text-green-400' : 'text-gray-500'}`}>
                          {isUsed ? 'Fully used' : isExpired ? 'Expired' : 'Partial'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
