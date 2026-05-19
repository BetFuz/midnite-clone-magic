import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  Crown, Star, ArrowLeft, ChevronRight, Zap, Shield,
  Trophy, Gift, TrendingUp, Lock,
} from 'lucide-react';

const TIERS = [
  {
    key: 'ROOKIE',   label: 'Rookie',   route: '/account/tiers/rookie',
    color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20',
    icon: Star, minPoints: 0, maxPoints: 999,
    perks: ['Access all markets', 'Basic support'],
  },
  {
    key: 'BRONZE',   label: 'Bronze',   route: '/account/tiers/bronze',
    color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20',
    icon: Shield, minPoints: 1000, maxPoints: 4999,
    perks: ['5% deposit bonus', 'Priority support'],
  },
  {
    key: 'SILVER',   label: 'Silver',   route: '/account/tiers/silver',
    color: 'text-slate-300', bg: 'bg-slate-400/10', border: 'border-slate-400/20',
    icon: Star, minPoints: 5000, maxPoints: 14999,
    perks: ['10% deposit bonus', 'Weekly cashback 2%', 'Dedicated agent'],
  },
  {
    key: 'GOLD',     label: 'Gold',     route: '/account/tiers/gold',
    color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20',
    icon: Trophy, minPoints: 15000, maxPoints: 49999,
    perks: ['15% deposit bonus', 'Weekly cashback 5%', 'Higher limits'],
  },
  {
    key: 'PLATINUM', label: 'Platinum', route: '/account/tiers/platinum',
    color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20',
    icon: Crown, minPoints: 50000, maxPoints: 149999,
    perks: ['20% deposit bonus', 'Daily cashback 8%', 'VIP events'],
  },
  {
    key: 'DIAMOND',  label: 'Diamond',  route: '/account/tiers/diamond',
    color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20',
    icon: Zap, minPoints: 150000, maxPoints: Infinity,
    perks: ['25% deposit bonus', 'Daily cashback 12%', 'Personal manager', 'Exclusive bonuses'],
  },
];

const TIER_ORDER = TIERS.map(t => t.key);

export default function VIPHub() {
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const [stats, setStats]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/wallet').catch(() => null),
      api.get('/bet/stats').catch(() => null),
    ]).then(([walletRes, statsRes]) => {
      const wallet = walletRes?.data?.data ?? walletRes?.data;
      const betStats = statsRes?.data?.data;
      setStats({ wallet, betStats });
    }).finally(() => setLoading(false));
  }, []);

  const vipTier = (user as any)?.vipTier ?? (stats?.wallet?.vipTier) ?? 'ROOKIE';
  const tierIdx = TIER_ORDER.indexOf(vipTier);
  const currentTier = TIERS[Math.max(0, tierIdx)];
  const nextTier = TIERS[tierIdx + 1] ?? null;

  const totalStaked = stats?.betStats?.totalStaked ?? 0;
  const points = Math.floor(totalStaked / 10);
  const progressPct = nextTier
    ? Math.min(100, ((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100)
    : 100;

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
            <h1 className="text-white font-bold text-xl">VIP Club</h1>
            <p className="text-gray-500 text-sm">Earn points on every bet, unlock exclusive rewards</p>
          </div>
        </div>

        {/* Current Tier Card */}
        {loading ? (
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-2xl h-48 animate-pulse mb-5" />
        ) : (
          <div className={`rounded-2xl p-6 mb-5 border ${currentTier.bg} ${currentTier.border}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Tier</p>
                <div className="flex items-center gap-2">
                  <currentTier.icon className={`w-6 h-6 ${currentTier.color}`} />
                  <span className={`text-2xl font-bold ${currentTier.color}`}>{currentTier.label}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs mb-1">VIP Points</p>
                <p className="text-white text-2xl font-bold">{points.toLocaleString()}</p>
              </div>
            </div>

            {nextTier && (
              <>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>{points.toLocaleString()} pts</span>
                  <span>{nextTier.minPoints.toLocaleString()} pts for {nextTier.label}</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${currentTier.color.replace('text-', 'bg-')}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  {(nextTier.minPoints - points).toLocaleString()} more points to {nextTier.label}
                </p>
              </>
            )}

            {!nextTier && (
              <p className={`text-sm font-semibold mt-2 ${currentTier.color}`}>You've reached the highest tier!</p>
            )}

            {/* Current perks */}
            <div className="flex flex-wrap gap-2 mt-4">
              {currentTier.perks.map(p => (
                <span key={p} className="text-xs bg-black/30 text-gray-300 px-2.5 py-1 rounded-lg">✓ {p}</span>
              ))}
            </div>
          </div>
        )}

        {/* How points work */}
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#00b15c]" />
            <h3 className="text-white font-semibold text-sm">How to earn points</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { action: 'Place a bet', points: '1 pt per ₦10 staked' },
              { action: 'Win a bet', points: '+50% bonus points' },
              { action: 'Daily login', points: '10 pts/day' },
              { action: 'Refer a friend', points: '500 pts per referral' },
            ].map(item => (
              <div key={item.action} className="bg-[#0d1520] rounded-xl p-3">
                <p className="text-white text-xs font-medium">{item.action}</p>
                <p className="text-[#00b15c] text-xs mt-0.5">{item.points}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tier ladder */}
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-2xl overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-[#1f2d3d]">
            <h3 className="text-white font-semibold text-sm">All Tiers</h3>
          </div>
          {TIERS.map((tier, i) => {
            const Icon = tier.icon;
            const isCurrent = tier.key === vipTier;
            const isUnlocked = i <= tierIdx;
            return (
              <button
                key={tier.key}
                onClick={() => navigate(tier.route)}
                className={`w-full flex items-center gap-4 px-5 py-4 border-b border-[#1f2d3d]/50 last:border-0 hover:bg-[#0d1520] transition-colors text-left ${
                  isCurrent ? 'bg-[#0d1520]' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.bg} border ${tier.border} flex-shrink-0`}>
                  {isUnlocked
                    ? <Icon className={`w-5 h-5 ${tier.color}`} />
                    : <Lock className="w-4 h-4 text-gray-600" />
                  }
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${isUnlocked ? tier.color : 'text-gray-600'}`}>{tier.label}</p>
                    {isCurrent && (
                      <span className="text-[10px] bg-[#00b15c]/20 text-[#00b15c] border border-[#00b15c]/20 px-1.5 py-0.5 rounded-full font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {tier.maxPoints === Infinity ? `${tier.minPoints.toLocaleString()}+ pts` : `${tier.minPoints.toLocaleString()} – ${tier.maxPoints.toLocaleString()} pts`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex flex-col items-end">
                    {tier.perks.slice(0, 2).map(p => (
                      <p key={p} className={`text-[10px] ${isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>✓ {p}</p>
                    ))}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Rewards shortcut */}
        <button
          onClick={() => navigate('/account/bonuses')}
          className="w-full flex items-center justify-between bg-gradient-to-r from-[#00b15c]/20 to-[#00963d]/10 border border-[#00b15c]/30 rounded-xl p-4 hover:border-[#00b15c]/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-[#00b15c]" />
            <div className="text-left">
              <p className="text-white font-semibold text-sm">My Bonuses</p>
              <p className="text-gray-500 text-xs">View & claim available bonuses</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
