import { useState, useCallback } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import { Gift, Users, Clock, Search, DollarSign, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const BONUS_TYPES = [
  { value: 'WELCOME',    label: 'Welcome Bonus' },
  { value: 'RELOAD',     label: 'Reload Bonus' },
  { value: 'CASHBACK',   label: 'Cashback' },
  { value: 'FREEBET',    label: 'Free Bet' },
  { value: 'REFERRAL',   label: 'Referral Bonus' },
  { value: 'LOYALTY',    label: 'Loyalty Bonus' },
  { value: 'MANUAL',     label: 'Manual Credit' },
];

const SEGMENTS = [
  { value: 'all',        label: 'All Active Users' },
  { value: 'new',        label: 'New Users (joined last 7 days)' },
  { value: 'vip',        label: 'VIP / High Rollers' },
  { value: 'inactive',   label: 'Inactive Users (30+ days)' },
  { value: 'kyc_verified', label: 'KYC Verified Only' },
];

const Modal = ({ title, onClose, children }: any) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-[#111827] border border-[#1f2d3d] rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2d3d]">
        <h3 className="text-white font-semibold">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export default function AdminBonus() {
  const [tab, setTab] = useState<'grant' | 'broadcast' | 'expiry'>('grant');

  // Grant to user
  const [userId, setUserId]           = useState('');
  const [bonusType, setBonusType]     = useState('MANUAL');
  const [amount, setAmount]           = useState('');
  const [note, setNote]               = useState('');
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantResult, setGrantResult]   = useState<any>(null);

  // Broadcast
  const [bcType, setBcType]         = useState('LOYALTY');
  const [bcAmount, setBcAmount]     = useState('');
  const [bcTarget, setBcTarget]     = useState('all');
  const [bcNote, setBcNote]         = useState('');
  const [bcLoading, setBcLoading]   = useState(false);
  const [bcResult, setBcResult]     = useState<any>(null);
  const [bcConfirm, setBcConfirm]   = useState(false);

  // Expiry check
  const [expiryLoading, setExpiryLoading] = useState(false);
  const [expiryResult, setExpiryResult]   = useState<any>(null);

  const handleGrant = useCallback(async () => {
    if (!userId.trim() || !amount) return toast.error('User ID and amount required');
    setGrantLoading(true);
    setGrantResult(null);
    try {
      const res = await adminApi.grantBonus({ userId: userId.trim(), type: bonusType, amount: Number(amount), note });
      setGrantResult({ ok: true, msg: res.message ?? 'Bonus granted successfully' });
      setUserId(''); setAmount(''); setNote('');
    } catch (e: any) {
      setGrantResult({ ok: false, msg: e?.response?.data?.message ?? 'Failed to grant bonus' });
    } finally {
      setGrantLoading(false);
    }
  }, [userId, bonusType, amount, note]);

  const handleBroadcast = useCallback(async () => {
    if (!bcAmount) return toast.error('Amount required');
    setBcLoading(true);
    setBcResult(null);
    try {
      const res = await adminApi.broadcastBonus({ type: bcType, amount: Number(bcAmount), target: bcTarget, note: bcNote });
      setBcResult({ ok: true, msg: res.message ?? `Bonus broadcast to ${bcTarget} users` });
      setBcAmount(''); setBcNote('');
    } catch (e: any) {
      setBcResult({ ok: false, msg: e?.response?.data?.message ?? 'Broadcast failed' });
    } finally {
      setBcLoading(false);
      setBcConfirm(false);
    }
  }, [bcType, bcAmount, bcTarget, bcNote]);

  const handleCheckExpiry = useCallback(async () => {
    setExpiryLoading(true);
    setExpiryResult(null);
    try {
      const res = await adminApi.checkBonusExpiry();
      setExpiryResult({ ok: true, data: res });
    } catch (e: any) {
      setExpiryResult({ ok: false, msg: e?.response?.data?.message ?? 'Expiry check failed' });
    } finally {
      setExpiryLoading(false);
    }
  }, []);

  const tabs = [
    { key: 'grant',     label: 'Grant to User',    icon: Gift },
    { key: 'broadcast', label: 'Broadcast Bonus',  icon: Users },
    { key: 'expiry',    label: 'Check Expiry',      icon: Clock },
  ] as const;

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="Bonus Management" />
        <div className="p-6 space-y-6">

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  tab === key
                    ? 'bg-[#00b15c]/10 text-[#00b15c] border border-[#00b15c]/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          {/* Grant to User */}
          {tab === 'grant' && (
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-6 max-w-lg">
              <div className="flex items-center gap-2 mb-5">
                <Gift className="w-5 h-5 text-[#00b15c]" />
                <h3 className="text-white font-semibold">Grant Bonus to User</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">User ID</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      value={userId}
                      onChange={e => setUserId(e.target.value)}
                      placeholder="Paste user UUID..."
                      className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg text-white text-sm pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#00b15c]/50 placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Bonus Type</label>
                  <select
                    value={bonusType}
                    onChange={e => setBonusType(e.target.value)}
                    className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg text-white text-sm px-3 py-2.5 focus:outline-none focus:border-[#00b15c]/50"
                  >
                    {BONUS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Amount (₦)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg text-white text-sm pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#00b15c]/50 placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Note (optional)</label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={2}
                    placeholder="Internal note..."
                    className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg text-white text-sm px-3 py-2.5 focus:outline-none focus:border-[#00b15c]/50 placeholder:text-gray-600 resize-none"
                  />
                </div>

                {grantResult && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${grantResult.ok ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {grantResult.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {grantResult.msg}
                  </div>
                )}

                <button
                  onClick={handleGrant}
                  disabled={grantLoading || !userId || !amount}
                  className="w-full bg-[#00b15c] hover:bg-[#00963d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
                >
                  {grantLoading ? 'Granting...' : 'Grant Bonus'}
                </button>
              </div>
            </div>
          )}

          {/* Broadcast */}
          {tab === 'broadcast' && (
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-6 max-w-lg">
              <div className="flex items-center gap-2 mb-5">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-semibold">Broadcast Bonus to Segment</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Target Audience</label>
                  <select
                    value={bcTarget}
                    onChange={e => setBcTarget(e.target.value)}
                    className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg text-white text-sm px-3 py-2.5 focus:outline-none focus:border-[#00b15c]/50"
                  >
                    {SEGMENTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Bonus Type</label>
                  <select
                    value={bcType}
                    onChange={e => setBcType(e.target.value)}
                    className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg text-white text-sm px-3 py-2.5 focus:outline-none focus:border-[#00b15c]/50"
                  >
                    {BONUS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Amount per User (₦)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      min="1"
                      value={bcAmount}
                      onChange={e => setBcAmount(e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg text-white text-sm pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#00b15c]/50 placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Note (optional)</label>
                  <input
                    value={bcNote}
                    onChange={e => setBcNote(e.target.value)}
                    placeholder="e.g. Easter promo 2025"
                    className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg text-white text-sm px-3 py-2.5 focus:outline-none focus:border-[#00b15c]/50 placeholder:text-gray-600"
                  />
                </div>

                {bcResult && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${bcResult.ok ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {bcResult.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {bcResult.msg}
                  </div>
                )}

                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-400">
                  This will grant a bonus to ALL users in the selected segment. Use with care.
                </div>

                <button
                  onClick={() => setBcConfirm(true)}
                  disabled={bcLoading || !bcAmount}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
                >
                  {bcLoading ? 'Broadcasting...' : 'Broadcast Bonus'}
                </button>
              </div>
            </div>
          )}

          {/* Expiry Check */}
          {tab === 'expiry' && (
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-6 max-w-lg">
              <div className="flex items-center gap-2 mb-5">
                <Clock className="w-5 h-5 text-orange-400" />
                <h3 className="text-white font-semibold">Check & Expire Bonuses</h3>
              </div>
              <p className="text-gray-400 text-sm mb-5">
                Manually trigger the bonus expiry job. This marks all bonuses past their expiry date as expired and removes them from user balances.
              </p>

              {expiryResult && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${expiryResult.ok ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {expiryResult.ok ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4" /> Expiry check complete</div>
                      {expiryResult.data?.expired !== undefined && (
                        <p className="text-xs text-gray-400">{expiryResult.data.expired} bonus(es) expired.</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />{expiryResult.msg}</div>
                  )}
                </div>
              )}

              <button
                onClick={handleCheckExpiry}
                disabled={expiryLoading}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
              >
                {expiryLoading ? 'Running...' : 'Run Expiry Check'}
              </button>
            </div>
          )}

        </div>
      </AdminLayout>

      {bcConfirm && (
        <Modal title="Confirm Broadcast" onClose={() => setBcConfirm(false)}>
          <p className="text-gray-300 text-sm mb-4">
            You are about to grant <span className="text-white font-bold">₦{Number(bcAmount).toLocaleString()}</span> {BONUS_TYPES.find(t => t.value === bcType)?.label} to <span className="text-white font-bold">{SEGMENTS.find(s => s.value === bcTarget)?.label}</span>. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setBcConfirm(false)} className="flex-1 px-4 py-2 bg-[#1f2d3d] text-gray-300 rounded-lg text-sm hover:bg-[#2a3d52] transition-colors">Cancel</button>
            <button onClick={handleBroadcast} disabled={bcLoading} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50">
              {bcLoading ? 'Broadcasting...' : 'Confirm Broadcast'}
            </button>
          </div>
        </Modal>
      )}
    </AdminGuard>
  );
}
