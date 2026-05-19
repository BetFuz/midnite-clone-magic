import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import {
  Users, Gift, Copy, CheckCircle, ArrowLeft, Share2,
  TrendingUp, Zap, RefreshCw, ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fmt = (n: number) => Number(n).toLocaleString();

export default function Referral() {
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    api.get('/affiliate/me').then(r => setData(r.data.data ?? r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const joinAffiliate = async () => {
    setJoining(true);
    try {
      const res = await api.post('/affiliate/register', {
        companyName: user?.email?.split('@')[0] ?? 'Player',
      });
      setData(res.data.data);
      toast.success('You\'re now in the referral program!');
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? 'Could not join. Try again.');
    } finally { setJoining(false); }
  };

  const referralLink = data?.trackingCode
    ? `${window.location.origin}/join?ref=${data.trackingCode}`
    : null;

  const copy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = () => {
    if (!referralLink) return;
    const text = `🎯 Join BetFuz — Africa's fastest-growing sports betting platform! Use my link and get a welcome bonus:\n${referralLink}`;
    if (navigator.share) {
      navigator.share({ title: 'Join BetFuz', text, url: referralLink });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Link copied! Share it with friends.');
    }
  };

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
            <h1 className="text-white font-bold text-xl">Refer & Earn</h1>
            <p className="text-gray-500 text-sm">Invite friends and earn commission on their activity</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-[#111827] border border-[#1f2d3d] rounded-xl h-28 animate-pulse" />)}
          </div>
        ) : !data ? (
          /* Join CTA */
          <div className="bg-gradient-to-br from-[#00b15c]/20 to-[#00963d]/10 border border-[#00b15c]/30 rounded-2xl p-8 text-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-[#00b15c] flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-white font-bold text-xl mb-2">Join the Referral Program</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              Earn commission every time someone you referred deposits and bets. No cap on earnings.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Commission Rate', value: '5%', sub: 'on referred bets' },
                { label: 'First Deposit Bonus', value: '10%', sub: 'of their first deposit' },
                { label: 'Payout', value: 'Weekly', sub: 'direct to wallet' },
              ].map(stat => (
                <div key={stat.label} className="bg-[#0d1520] rounded-xl p-3">
                  <p className="text-[#00b15c] font-bold text-lg">{stat.value}</p>
                  <p className="text-white text-xs font-medium">{stat.label}</p>
                  <p className="text-gray-500 text-[10px]">{stat.sub}</p>
                </div>
              ))}
            </div>
            <button
              onClick={joinAffiliate}
              disabled={joining}
              className="bg-[#00b15c] hover:bg-[#00963d] disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 mx-auto transition-colors"
            >
              {joining ? <><RefreshCw className="w-4 h-4 animate-spin" /> Joining…</> : <><Zap className="w-4 h-4" /> Join Now — It's Free</>}
            </button>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Clicks', value: fmt(data.totalClicks ?? 0), icon: ExternalLink, color: 'text-blue-400' },
                { label: 'Referrals', value: fmt(data.totalFtds ?? 0), icon: Users, color: 'text-green-400' },
                { label: 'Earned', value: fmt(data.totalCommission ?? data.commissionEarned ?? 0), icon: TrendingUp, color: 'text-yellow-400' },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 text-center">
                    <Icon className={`w-5 h-5 ${s.color} mx-auto mb-1.5`} />
                    <p className="text-white font-bold text-xl">{s.value}</p>
                    <p className="text-gray-500 text-xs">{s.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Referral link */}
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-2xl p-5 mb-5">
              <h3 className="text-white font-semibold mb-3">Your Referral Link</h3>
              <div className="flex items-center gap-2 bg-[#0d1520] border border-[#1f2d3d] rounded-xl px-4 py-3 mb-3">
                <code className="text-[#00b15c] text-xs flex-1 break-all font-mono">{referralLink}</code>
                <button onClick={copy} className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
                  {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copy}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1f2d3d] hover:bg-[#263548] text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  {copied ? <><CheckCircle className="w-4 h-4 text-green-400" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
                </button>
                <button
                  onClick={share}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#00b15c] hover:bg-[#00963d] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>

            {/* Tracking code */}
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 mb-5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Tracking Code</p>
                  <p className="text-white font-mono font-bold text-lg">{data.trackingCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs mb-1">Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    data.status === 'APPROVED'
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>{data.status ?? 'PENDING'}</span>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">How It Works</h3>
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Share your link', desc: 'Send it to friends via WhatsApp, Telegram, or social media' },
                  { step: '2', title: 'They sign up & deposit', desc: 'Your friend creates an account using your referral link' },
                  { step: '3', title: 'Earn commission', desc: '5% commission on every bet they place, credited weekly' },
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#00b15c]/20 text-[#00b15c] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</div>
                    <div>
                      <p className="text-white text-sm font-medium">{s.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
