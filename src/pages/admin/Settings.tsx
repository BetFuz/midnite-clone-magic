import { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import { Save, RefreshCw, Bell, Send } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-6 space-y-5">
    <h3 className="text-white font-semibold border-b border-[#1f2d3d] pb-3">{title}</h3>
    {children}
  </div>
);

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-6">
    <div className="flex-1">
      <p className="text-white text-sm font-medium">{label}</p>
      {hint && <p className="text-gray-500 text-xs mt-0.5">{hint}</p>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button onClick={onChange} className={`relative w-10 h-5 rounded-full transition-all ${checked ? 'bg-[#00b15c]' : 'bg-[#1f2d3d]'}`}>
    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-5.5' : 'left-0.5'}`} />
  </button>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00b15c]/50 w-48" />
);

export default function AdminSettings() {
  const [config, setConfig]     = useState<any>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const [bcMsg, setBcMsg]       = useState('');
  const [bcTarget, setBcTarget] = useState('all');
  const [bcSending, setBcSending] = useState(false);

  useEffect(() => {
    adminApi.getSystemConfig()
      .then(res => setConfig(res.config ?? res ?? {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: any) => setConfig((p: any) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateSystemConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const broadcast = async () => {
    if (!bcMsg.trim()) return;
    setBcSending(true);
    try {
      await adminApi.broadcast({ message: bcMsg, target: bcTarget });
      setBcMsg('');
    } catch { /* silent */ }
    finally { setBcSending(false); }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="Platform Settings" />
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-6 h-40 animate-pulse" />)}</div>
          ) : (
            <>
              <Section title="Betting Engine">
                <Field label="Betting Enabled" hint="Allow users to place new bets">
                  <Toggle checked={config.bettingEnabled ?? true} onChange={() => set('bettingEnabled', !config.bettingEnabled)} />
                </Field>
                <Field label="Min Bet Amount" hint="Minimum stake per bet (local currency)">
                  <Input type="number" value={config.minBetAmount ?? 100} onChange={e => set('minBetAmount', Number(e.target.value))} />
                </Field>
                <Field label="Max Bet Amount" hint="Maximum stake per bet">
                  <Input type="number" value={config.maxBetAmount ?? 500000} onChange={e => set('maxBetAmount', Number(e.target.value))} />
                </Field>
                <Field label="Max Payout" hint="Maximum single bet payout">
                  <Input type="number" value={config.maxPayout ?? 10000000} onChange={e => set('maxPayout', Number(e.target.value))} />
                </Field>
                <Field label="Max Accumulator Legs" hint="Maximum selections in a betslip">
                  <Input type="number" value={config.maxAccumulatorLegs ?? 20} onChange={e => set('maxAccumulatorLegs', Number(e.target.value))} />
                </Field>
              </Section>

              <Section title="Deposits & Withdrawals">
                <Field label="Withdrawals Enabled" hint="Allow users to request withdrawals">
                  <Toggle checked={config.withdrawalsEnabled ?? true} onChange={() => set('withdrawalsEnabled', !config.withdrawalsEnabled)} />
                </Field>
                <Field label="Min Deposit (local currency)">
                  <Input type="number" value={config.minDeposit ?? 500} onChange={e => set('minDeposit', Number(e.target.value))} />
                </Field>
                <Field label="Min Withdrawal (local currency)">
                  <Input type="number" value={config.minWithdrawal ?? 1000} onChange={e => set('minWithdrawal', Number(e.target.value))} />
                </Field>
                <Field label="Max Withdrawal (local currency)">
                  <Input type="number" value={config.maxWithdrawal ?? 1000000} onChange={e => set('maxWithdrawal', Number(e.target.value))} />
                </Field>
              </Section>

              <Section title="KYC & Compliance">
                <Field label="KYC Required for Withdrawal" hint="Users must verify before withdrawing">
                  <Toggle checked={config.kycRequired ?? true} onChange={() => set('kycRequired', !config.kycRequired)} />
                </Field>
                <Field label="Responsible Gambling Enabled" hint="Enable self-exclusion and bet limits">
                  <Toggle checked={config.responsibleGamblingEnabled ?? true} onChange={() => set('responsibleGamblingEnabled', !config.responsibleGamblingEnabled)} />
                </Field>
                <Field label="Auto-Flag Threshold" hint="Auto-flag large single deposits">
                  <Input type="number" value={config.fraudFlagThreshold ?? 200000} onChange={e => set('fraudFlagThreshold', Number(e.target.value))} />
                </Field>
              </Section>

              <Section title="Registration">
                <Field label="Registrations Open" hint="Allow new user sign-ups">
                  <Toggle checked={config.registrationsOpen ?? true} onChange={() => set('registrationsOpen', !config.registrationsOpen)} />
                </Field>
                <Field label="Email Verification Required">
                  <Toggle checked={config.emailVerificationRequired ?? false} onChange={() => set('emailVerificationRequired', !config.emailVerificationRequired)} />
                </Field>
                <Field label="Registration Bonus (local currency)" hint="Free bet credit for new users">
                  <Input type="number" value={config.registrationBonus ?? 0} onChange={e => set('registrationBonus', Number(e.target.value))} />
                </Field>
              </Section>

              <div className="flex justify-end">
                <button onClick={save} disabled={saving} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${saved ? 'bg-green-500 text-white' : 'bg-[#00b15c] hover:bg-[#00963f] text-white'} disabled:opacity-50`}>
                  {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : saved ? '✓ Saved!' : <><Save className="w-4 h-4" /> Save Settings</>}
                </button>
              </div>

              {/* Broadcast */}
              <Section title="Broadcast Notification">
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Target Audience</label>
                    <select value={bcTarget} onChange={e => setBcTarget(e.target.value)} className="bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00b15c]/50 w-full max-w-xs">
                      <option value="all">All Users</option>
                      <option value="active">Active Users</option>
                      <option value="depositors">Deposited Users</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Message</label>
                    <textarea value={bcMsg} onChange={e => setBcMsg(e.target.value)} rows={3} placeholder="Your notification message..." className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#00b15c]/50 resize-none" />
                  </div>
                  <button onClick={broadcast} disabled={bcSending || !bcMsg.trim()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all">
                    {bcSending ? <><RefreshCw className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Broadcast</>}
                  </button>
                </div>
              </Section>
            </>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
