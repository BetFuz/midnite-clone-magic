import { useState } from 'react';
import Header from '@/components/Header';
import { useGamingLimits } from '@/hooks/useGamingLimits';
import { useNavigate } from 'react-router-dom';
import {
  Shield, ArrowLeft, RefreshCw, AlertTriangle, Clock,
  Ban, DollarSign, TrendingDown, Timer,
} from 'lucide-react';

const fmt = (n: number) => Number(n).toLocaleString();

const LIMIT_TYPES = [
  { type: 'DEPOSIT',  label: 'Daily Deposit Limit',  icon: DollarSign,   placeholder: '50000',  unit: '₦', periodDays: 1 },
  { type: 'LOSS',     label: 'Daily Loss Limit',      icon: TrendingDown, placeholder: '25000',  unit: '₦', periodDays: 1 },
  { type: 'WAGER',    label: 'Weekly Wager Limit',    icon: TrendingDown, placeholder: '200000', unit: '₦', periodDays: 7 },
  { type: 'SESSION',  label: 'Session Time Limit',    icon: Timer,        placeholder: '120',    unit: 'min', periodDays: 1 },
];

export default function ResponsibleGaming() {
  const navigate = useNavigate();
  const { limits, exclusions, loading, updating, setLimit, selfExclude, getLimitByType, isExcluded } = useGamingLimits();

  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [coolOff, setCoolOff] = useState('7');
  const [showExclude, setShowExclude] = useState(false);
  const [excludeType, setExcludeType] = useState<'TEMPORARY' | 'PERMANENT'>('TEMPORARY');
  const [excludeDays, setExcludeDays] = useState('30');
  const [reason, setReason] = useState('');

  const handleSetLimit = async (type: string, periodDays: number) => {
    const raw = amounts[type];
    if (!raw || isNaN(Number(raw))) return;
    await setLimit(type, Number(raw), periodDays);
    setAmounts(prev => ({ ...prev, [type]: '' }));
  };

  const handleCoolOff = async () => {
    await selfExclude('TEMPORARY', Number(coolOff), 'Cooling off period');
  };

  const handleExclude = async () => {
    const days = excludeType === 'PERMANENT' ? undefined : Number(excludeDays);
    await selfExclude(excludeType, days, reason);
    setShowExclude(false);
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
            <h1 className="text-white font-bold text-xl">Responsible Gaming</h1>
            <p className="text-gray-500 text-sm">Set limits and stay in control of your betting</p>
          </div>
        </div>

        {/* Self-exclusion warning */}
        {isExcluded && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-5 flex items-start gap-3">
            <Ban className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold text-sm">Account Self-Excluded</p>
              <p className="text-gray-400 text-xs mt-1">Your account is in self-exclusion. Contact support if you need assistance.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-[#111827] border border-[#1f2d3d] rounded-xl h-28 animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Spend limits */}
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-2xl overflow-hidden mb-5">
              <div className="px-5 py-4 border-b border-[#1f2d3d] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00b15c]" />
                <h3 className="text-white font-semibold text-sm">Betting Limits</h3>
              </div>
              {LIMIT_TYPES.map(lt => {
                const existing = getLimitByType(lt.type);
                const Icon = lt.icon;
                return (
                  <div key={lt.type} className="px-5 py-4 border-b border-[#1f2d3d]/50 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <p className="text-white text-sm font-medium">{lt.label}</p>
                      </div>
                      {existing && (
                        <span className="text-xs bg-[#00b15c]/10 text-[#00b15c] border border-[#00b15c]/20 px-2 py-0.5 rounded-full">
                          {lt.unit === '₦' ? `₦${fmt(existing.amount)}` : `${existing.amount} min`}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{lt.unit === '₦' ? '₦' : ''}</span>
                        <input
                          type="number"
                          value={amounts[lt.type] ?? ''}
                          onChange={e => setAmounts(prev => ({ ...prev, [lt.type]: e.target.value }))}
                          placeholder={`e.g. ${lt.placeholder}`}
                          className={`w-full bg-[#0d1520] border border-[#1f2d3d] rounded-xl py-2 text-white text-sm focus:outline-none focus:border-[#00b15c]/50 ${lt.unit === '₦' ? 'pl-7 pr-4' : 'px-4'}`}
                        />
                      </div>
                      <button
                        onClick={() => handleSetLimit(lt.type, lt.periodDays)}
                        disabled={updating || !amounts[lt.type]}
                        className="bg-[#00b15c] hover:bg-[#00963d] disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                      >
                        {updating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Set'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cooling-off period */}
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-yellow-400" />
                <h3 className="text-white font-semibold text-sm">Cooling-Off Period</h3>
              </div>
              <p className="text-gray-400 text-xs mb-4">Take a short break from betting. Your account will be temporarily suspended.</p>
              <div className="flex gap-2">
                <select
                  value={coolOff}
                  onChange={e => setCoolOff(e.target.value)}
                  className="flex-1 bg-[#0d1520] border border-[#1f2d3d] rounded-xl px-4 py-2 text-white text-sm focus:outline-none"
                >
                  {[
                    { v: '1', l: '1 day' }, { v: '3', l: '3 days' }, { v: '7', l: '1 week' },
                    { v: '14', l: '2 weeks' }, { v: '30', l: '1 month' },
                  ].map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
                <button
                  onClick={handleCoolOff}
                  disabled={updating}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
                >
                  Take a Break
                </button>
              </div>
            </div>

            {/* Self-exclusion */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h3 className="text-white font-semibold text-sm">Self-Exclusion</h3>
              </div>
              <p className="text-gray-400 text-xs mb-4">
                Permanently or temporarily block yourself from accessing BetFuz. This cannot be easily reversed.
              </p>

              {showExclude ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {(['TEMPORARY', 'PERMANENT'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setExcludeType(t)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                          excludeType === t
                            ? 'bg-red-500/20 border-red-500/40 text-red-400'
                            : 'border-[#1f2d3d] text-gray-400 hover:text-white'
                        }`}
                      >
                        {t === 'TEMPORARY' ? 'Temporary' : 'Permanent'}
                      </button>
                    ))}
                  </div>

                  {excludeType === 'TEMPORARY' && (
                    <select
                      value={excludeDays}
                      onChange={e => setExcludeDays(e.target.value)}
                      className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-xl px-4 py-2 text-white text-sm"
                    >
                      {[
                        { v: '30', l: '30 days' }, { v: '90', l: '3 months' },
                        { v: '180', l: '6 months' }, { v: '365', l: '1 year' },
                      ].map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  )}

                  <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Reason (optional)"
                    rows={2}
                    className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-xl px-4 py-2 text-white text-sm resize-none focus:outline-none"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowExclude(false)}
                      className="flex-1 py-2 border border-[#1f2d3d] text-gray-400 rounded-xl text-sm hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExclude}
                      disabled={updating}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 rounded-xl text-sm font-semibold transition-colors"
                    >
                      {updating ? 'Processing…' : 'Confirm Self-Exclusion'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowExclude(true)}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                >
                  <Ban className="w-4 h-4" /> Self-Exclude My Account
                </button>
              )}
            </div>

            {/* Active exclusions */}
            {exclusions.length > 0 && (
              <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
                <h3 className="text-white font-semibold text-sm mb-3">Active Restrictions</h3>
                {exclusions.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#1f2d3d]/30 last:border-0">
                    <div>
                      <p className="text-white text-xs font-medium">{ex.type} Exclusion</p>
                      {ex.endDate && <p className="text-gray-500 text-xs">Until {new Date(ex.endDate).toLocaleDateString()}</p>}
                    </div>
                    <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                ))}
              </div>
            )}

            {/* Help */}
            <div className="mt-5 bg-[#111827]/50 border border-[#1f2d3d]/50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
              <p className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[#00b15c]" /> For urgent help: <a href="tel:+2349090909090" className="text-[#00b15c] underline">+234 909 090 9090</a></p>
              <p>Gambling support: <a href="https://www.responsiblegambling.org" target="_blank" rel="noreferrer" className="text-[#00b15c] underline">ResponsibleGambling.org</a></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
