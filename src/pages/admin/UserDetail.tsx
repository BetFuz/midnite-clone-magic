import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import { ArrowLeft, DollarSign, Ban, CheckCircle, Brain, User, Activity, CreditCard, ShieldCheck, X } from 'lucide-react';

const fmt = (n: number) => `XAF ${Number(n).toLocaleString()}`;
const fmtNum = (n: number) => new Intl.NumberFormat().format(n);

const statusColor: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
  won: 'bg-green-500/10 text-green-400 border-green-500/20',
  lost: 'bg-red-500/10 text-red-400 border-red-500/20',
  active_bet: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const Badge = ({ text, color }: { text: string; color: string }) => (
  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium capitalize ${color}`}>{text}</span>
);

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

const Tab = ({ label, icon: Icon, active, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${active ? 'bg-[#00b15c]/10 text-[#00b15c] border border-[#00b15c]/20' : 'text-gray-400 hover:text-white'}`}>
    <Icon className="w-4 h-4" />{label}
  </button>
);

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser]     = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]       = useState<'overview' | 'bets' | 'transactions' | 'kyc'>('overview');

  const [creditModal, setCreditModal]   = useState(false);
  const [suspendModal, setSuspendModal] = useState(false);
  const [aiModal, setAiModal]           = useState(false);
  const [creditAmt, setCreditAmt]       = useState('');
  const [creditNote, setCreditNote]     = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [aiData, setAiData]             = useState<any>(null);
  const [submitting, setSubmitting]     = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([adminApi.getUser(id), adminApi.getUserActivity(id)])
      .then(([u, a]) => { setUser(u); setActivity(a); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleCredit = async () => {
    setSubmitting(true);
    try {
      await adminApi.creditUser(id!, { amount: Number(creditAmt), note: creditNote });
      setCreditModal(false); setCreditAmt(''); setCreditNote('');
      const u = await adminApi.getUser(id!); setUser(u);
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const handleSuspend = async () => {
    setSubmitting(true);
    try {
      if (user?.status?.toLowerCase() === 'suspended') await adminApi.unsuspendUser(id!);
      else await adminApi.suspendUser(id!, { reason: suspendReason });
      setSuspendModal(false); setSuspendReason('');
      const u = await adminApi.getUser(id!); setUser(u);
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const handleAI = async () => {
    setAiModal(true); setAiData(null);
    try { const r = await adminApi.getAIFraudScore(id!); setAiData(r); }
    catch { setAiData({ error: 'Analysis failed.' }); }
  };

  const riskColor = (s: number) => s >= 70 ? 'text-red-400' : s >= 40 ? 'text-yellow-400' : 'text-green-400';
  const riskLabel = (s: number) => s >= 70 ? 'HIGH RISK' : s >= 40 ? 'MEDIUM RISK' : 'LOW RISK';

  const isSuspended = user?.status?.toLowerCase() === 'suspended';

  if (loading) return (
    <AdminGuard><AdminLayout>
      <AdminHeader title="User Detail" />
      <div className="p-6"><div className="animate-pulse space-y-4">{[...Array(6)].map((_,i) => <div key={i} className="h-16 bg-[#111827] border border-[#1f2d3d] rounded-xl" />)}</div></div>
    </AdminLayout></AdminGuard>
  );

  if (!user) return (
    <AdminGuard><AdminLayout>
      <AdminHeader title="User Detail" />
      <div className="p-6 text-center text-gray-500 py-20">User not found. <button onClick={() => navigate('/admin/users')} className="text-[#00b15c] hover:underline">Back to users</button></div>
    </AdminLayout></AdminGuard>
  );

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="User Detail" />
        <div className="p-6 space-y-5">

          {/* Back + Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin/users')} className="p-2 border border-[#1f2d3d] rounded-lg text-gray-400 hover:text-white transition-all">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 rounded-xl bg-[#00b15c]/10 flex items-center justify-center border border-[#00b15c]/20">
                <span className="text-[#00b15c] font-bold text-xl">{user.firstName?.[0] ?? user.email?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">{user.firstName} {user.lastName}</h2>
                <p className="text-gray-500 text-sm">{user.email} · @{user.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge text={user.status ?? 'active'} color={statusColor[user.status?.toLowerCase() ?? 'active'] ?? statusColor.active} />
              <Badge text={`KYC: ${user.kycTier ?? 'T0'}`} color="bg-blue-500/10 text-blue-400 border-blue-500/20" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setCreditModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 rounded-lg text-sm font-medium transition-all">
              <DollarSign className="w-4 h-4" /> Credit Wallet
            </button>
            <button onClick={() => setSuspendModal(true)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${isSuspended ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'}`}>
              {isSuspended ? <><CheckCircle className="w-4 h-4" /> Unsuspend</> : <><Ban className="w-4 h-4" /> Suspend</>}
            </button>
            <button onClick={handleAI} className="flex items-center gap-1.5 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 rounded-lg text-sm font-medium transition-all">
              <Brain className="w-4 h-4" /> AI Fraud Score
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Cash Balance',   value: fmt(user.wallet?.cashBalance ?? 0),   color: 'text-[#00b15c]' },
              { label: 'Bonus Balance',  value: fmt(user.wallet?.bonusBalance ?? 0),  color: 'text-purple-400' },
              { label: 'Total Bets',     value: fmtNum(activity?.bets?.length ?? 0),  color: 'text-blue-400' },
              { label: 'Transactions',   value: fmtNum(activity?.transactions?.length ?? 0), color: 'text-orange-400' },
            ].map(s => (
              <div key={s.label} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 flex-wrap">
            <Tab label="Overview"     icon={User}       active={tab === 'overview'}     onClick={() => setTab('overview')} />
            <Tab label="Bets"         icon={Activity}   active={tab === 'bets'}         onClick={() => setTab('bets')} />
            <Tab label="Transactions" icon={CreditCard} active={tab === 'transactions'} onClick={() => setTab('transactions')} />
            <Tab label="KYC Docs"     icon={ShieldCheck} active={tab === 'kyc'}          onClick={() => setTab('kyc')} />
          </div>

          {/* Tab Content */}
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">

            {tab === 'overview' && (
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['User ID', user.id],
                  ['Email', user.email],
                  ['Phone', user.phone ?? '—'],
                  ['Username', `@${user.username}`],
                  ['Role', user.role],
                  ['KYC Tier', user.kycTier ?? 'TIER_0'],
                  ['Status', user.status],
                  ['Referral Code', user.referralCode ?? '—'],
                  ['Date of Birth', user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '—'],
                  ['Joined', new Date(user.createdAt).toLocaleString()],
                  ['Last Updated', new Date(user.updatedAt).toLocaleString()],
                  ['Email Verified', user.emailVerified ? 'Yes' : 'No'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-2 border-b border-[#1f2d3d]/50">
                    <span className="text-gray-500 text-sm">{k}</span>
                    <span className="text-gray-200 text-sm font-medium truncate max-w-[200px] text-right">{v as string}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === 'bets' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-[#1f2d3d]">
                    {['Type', 'Stake', 'Potential Win', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {!activity?.bets?.length ? (
                      <tr><td colSpan={5} className="text-center text-gray-500 py-10">No bets yet</td></tr>
                    ) : activity.bets.map((b: any) => (
                      <tr key={b.id} className="border-b border-[#1f2d3d]/50 hover:bg-white/2">
                        <td className="px-4 py-3 text-gray-300 capitalize">{b.betType ?? 'single'}</td>
                        <td className="px-4 py-3 text-white font-medium">{fmt(b.stake ?? 0)}</td>
                        <td className="px-4 py-3 text-green-400">{fmt(b.potentialWin ?? 0)}</td>
                        <td className="px-4 py-3"><Badge text={b.status ?? 'active'} color={statusColor[b.status?.toLowerCase() ?? 'active_bet'] ?? statusColor.active_bet} /></td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{new Date(b.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'transactions' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-[#1f2d3d]">
                    {['Type', 'Amount', 'Balance After', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {!activity?.transactions?.length ? (
                      <tr><td colSpan={5} className="text-center text-gray-500 py-10">No transactions yet</td></tr>
                    ) : activity.transactions.map((t: any) => (
                      <tr key={t.id} className="border-b border-[#1f2d3d]/50 hover:bg-white/2">
                        <td className="px-4 py-3 text-gray-300 capitalize">{t.type?.replace(/_/g, ' ')}</td>
                        <td className={`px-4 py-3 font-medium ${['DEPOSIT','BET_WIN','ADMIN_CREDIT'].includes(t.type) ? 'text-green-400' : 'text-orange-400'}`}>
                          {['DEPOSIT','BET_WIN','ADMIN_CREDIT'].includes(t.type) ? '+' : '-'}{fmt(t.amount ?? 0)}
                        </td>
                        <td className="px-4 py-3 text-gray-300">{fmt(t.balanceAfter ?? 0)}</td>
                        <td className="px-4 py-3"><Badge text={t.status ?? 'completed'} color={statusColor[t.status?.toLowerCase() ?? 'completed'] ?? statusColor.completed} /></td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{new Date(t.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'kyc' && (
              <div className="p-5">
                {!activity?.kycDocs?.length ? (
                  <div className="text-center text-gray-500 py-10">No KYC documents submitted</div>
                ) : (
                  <div className="space-y-3">
                    {activity.kycDocs.map((doc: any) => (
                      <div key={doc.id} className="bg-[#0d1520] border border-[#1f2d3d] rounded-xl p-4 flex items-start justify-between">
                        <div>
                          <p className="text-white font-medium capitalize">{doc.type?.replace(/_/g, ' ')}</p>
                          <p className="text-gray-500 text-xs mt-0.5">Submitted {new Date(doc.createdAt).toLocaleDateString()}</p>
                          {doc.rejectionReason && <p className="text-red-400 text-xs mt-1">Rejected: {doc.rejectionReason}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge text={doc.status ?? 'pending'} color={statusColor[doc.status?.toLowerCase() ?? 'pending'] ?? statusColor.pending} />
                          {doc.documentUrl && (
                            <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="text-blue-400 text-xs hover:underline">View ↗</a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Credit Modal */}
        {creditModal && (
          <Modal title="Credit Wallet" onClose={() => setCreditModal(false)}>
            <div className="space-y-4">
              <div><label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Amount (NGN)</label>
                <input type="number" value={creditAmt} onChange={e => setCreditAmt(e.target.value)} placeholder="5000" className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00b15c]/50" />
              </div>
              <div><label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Note (optional)</label>
                <input type="text" value={creditNote} onChange={e => setCreditNote(e.target.value)} placeholder="Bonus credit..." className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00b15c]/50" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCreditModal(false)} className="flex-1 border border-[#1f2d3d] text-gray-400 rounded-lg py-2.5 text-sm hover:text-white transition-all">Cancel</button>
                <button onClick={handleCredit} disabled={submitting || !creditAmt} className="flex-1 bg-[#00b15c] hover:bg-[#00963f] text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 transition-all">{submitting ? 'Processing...' : 'Credit Wallet'}</button>
              </div>
            </div>
          </Modal>
        )}

        {/* Suspend Modal */}
        {suspendModal && (
          <Modal title={isSuspended ? 'Unsuspend User' : 'Suspend User'} onClose={() => setSuspendModal(false)}>
            <div className="space-y-4">
              {!isSuspended && (
                <div><label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Reason</label>
                  <input type="text" value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Suspicious activity..." className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00b15c]/50" />
                </div>
              )}
              <p className="text-gray-400 text-sm">{isSuspended ? 'Restore access for this user.' : 'This will prevent the user from logging in.'}</p>
              <div className="flex gap-3">
                <button onClick={() => setSuspendModal(false)} className="flex-1 border border-[#1f2d3d] text-gray-400 rounded-lg py-2.5 text-sm hover:text-white transition-all">Cancel</button>
                <button onClick={handleSuspend} disabled={submitting} className={`flex-1 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 transition-all text-white ${isSuspended ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>{submitting ? 'Processing...' : isSuspended ? 'Unsuspend' : 'Suspend'}</button>
              </div>
            </div>
          </Modal>
        )}

        {/* AI Modal */}
        {aiModal && (
          <Modal title="AI Fraud Analysis" onClose={() => { setAiModal(false); setAiData(null); }}>
            {!aiData ? (
              <div className="text-center py-6"><div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-400 text-sm">Analyzing with Claude AI...</p></div>
            ) : aiData.error ? (
              <p className="text-red-400 text-sm">{aiData.error}</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#0d1520] border border-[#1f2d3d] rounded-xl p-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Fraud Score</p>
                    <p className={`text-3xl font-bold ${riskColor(aiData.fraudScore ?? aiData.score ?? 0)}`}>{aiData.fraudScore ?? aiData.score ?? 0}<span className="text-sm text-gray-500">/100</span></p>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1.5 rounded-full border ${riskColor(aiData.fraudScore ?? aiData.score ?? 0)} border-current bg-current/10`}>{riskLabel(aiData.fraudScore ?? aiData.score ?? 0)}</span>
                </div>
                {(aiData.reasons ?? []).map((r: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300 bg-[#0d1520] border border-[#1f2d3d] rounded-lg p-3">
                    <span className="text-purple-400 mt-0.5">•</span>{r}
                  </div>
                ))}
              </div>
            )}
          </Modal>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
