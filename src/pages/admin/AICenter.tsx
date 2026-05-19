import { useState } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import { Brain, Lightbulb, Target, Gift, RefreshCw, Search } from 'lucide-react';

const Card = ({ icon: Icon, title, badge, description, children, onRun, running }: any) => (
  <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-6 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          <p className="text-gray-500 text-xs">{description}</p>
        </div>
      </div>
      {badge && <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">{badge}</span>}
    </div>
    {children}
    <button onClick={onRun} disabled={running} className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/20 text-purple-400 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
      {running ? <><span className="w-3.5 h-3.5 border border-purple-400 border-t-transparent rounded-full animate-spin" />Analyzing...</> : <><RefreshCw className="w-3.5 h-3.5" />Run Analysis</>}
    </button>
  </div>
);

const Result = ({ text }: { text: string }) => (
  <div className="bg-[#0d1520] border border-[#1f2d3d] rounded-xl p-4 text-gray-300 text-sm leading-relaxed whitespace-pre-line">{text}</div>
);

export default function AICenter() {
  const [insights, setInsights]   = useState('');
  const [tips, setTips]           = useState('');
  const [fraudUserId, setFraudUserId] = useState('');
  const [fraudResult, setFraudResult] = useState<any>(null);
  const [bonusUserId, setBonusUserId] = useState('');
  const [bonusResult, setBonusResult] = useState('');

  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingTips, setLoadingTips]         = useState(false);
  const [loadingFraud, setLoadingFraud]       = useState(false);
  const [loadingBonus, setLoadingBonus]       = useState(false);

  const runInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await adminApi.getAIInsights();
      setInsights(res.insights ?? res.message ?? JSON.stringify(res));
    } catch { setInsights('Unable to fetch AI insights. Check your Anthropic API key.'); }
    finally { setLoadingInsights(false); }
  };

  const runTips = async () => {
    setLoadingTips(true);
    try {
      const res = await adminApi.getAIBettingTips();
      setTips(typeof res === 'string' ? res : res.tips ?? res.message ?? JSON.stringify(res));
    } catch { setTips('Unable to generate betting tips.'); }
    finally { setLoadingTips(false); }
  };

  const runFraud = async () => {
    if (!fraudUserId.trim()) return;
    setLoadingFraud(true); setFraudResult(null);
    try {
      const res = await adminApi.getAIFraudScore(fraudUserId.trim());
      setFraudResult(res);
    } catch { setFraudResult({ error: 'Unable to analyze user. Check the user ID.' }); }
    finally { setLoadingFraud(false); }
  };

  const runBonus = async () => {
    if (!bonusUserId.trim()) return;
    setLoadingBonus(true); setBonusResult('');
    try {
      const res = await adminApi.getAIBonusRec(bonusUserId.trim());
      setBonusResult(typeof res === 'string' ? res : res.recommendation ?? res.message ?? JSON.stringify(res));
    } catch { setBonusResult('Unable to generate bonus recommendation.'); }
    finally { setLoadingBonus(false); }
  };

  const riskColor = (score: number) => score >= 70 ? 'text-red-400' : score >= 40 ? 'text-yellow-400' : 'text-green-400';
  const riskLabel = (score: number) => score >= 70 ? 'HIGH RISK' : score >= 40 ? 'MEDIUM RISK' : 'LOW RISK';

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="AI Center" />
        <div className="p-6 space-y-6">

          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">Claude AI Power Center</h2>
              <p className="text-gray-500 text-sm">AI-powered analytics, fraud detection, and personalization</p>
            </div>
            <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ml-2">Powered by Claude</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Platform Insights */}
            <Card
              icon={Lightbulb}
              title="Platform Insights"
              badge="Analytics"
              description="Weekly revenue, betting, and user behavior analysis"
              onRun={runInsights}
              running={loadingInsights}
            >
              {insights ? <Result text={insights} /> : (
                <div className="bg-[#0d1520] border border-[#1f2d3d] rounded-xl p-4 text-center text-gray-600 text-sm">
                  Click "Run Analysis" to generate platform insights
                </div>
              )}
            </Card>

            {/* AI Betting Tips */}
            <Card
              icon={Target}
              title="AI Betting Tips"
              badge="Predictions"
              description="AI-generated tips for upcoming matches and events"
              onRun={runTips}
              running={loadingTips}
            >
              {tips ? <Result text={tips} /> : (
                <div className="bg-[#0d1520] border border-[#1f2d3d] rounded-xl p-4 text-center text-gray-600 text-sm">
                  Click "Run Analysis" to generate betting tips
                </div>
              )}
            </Card>

            {/* Fraud Detection */}
            <Card
              icon={Search}
              title="Fraud Detection"
              badge="Security"
              description="Analyze a specific user for suspicious patterns"
              onRun={runFraud}
              running={loadingFraud}
            >
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">User ID</label>
                <input
                  value={fraudUserId}
                  onChange={e => setFraudUserId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && runFraud()}
                  placeholder="Paste user UUID..."
                  className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              {fraudResult && (
                fraudResult.error ? <p className="text-red-400 text-sm">{fraudResult.error}</p> : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-[#0d1520] border border-[#1f2d3d] rounded-xl p-4">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Fraud Score</p>
                        <p className={`text-3xl font-bold ${riskColor(fraudResult.fraudScore ?? 0)}`}>
                          {fraudResult.fraudScore ?? 0}<span className="text-sm text-gray-500">/100</span>
                        </p>
                      </div>
                      <span className={`text-sm font-bold px-3 py-1.5 rounded-full border ${riskColor(fraudResult.fraudScore ?? 0)} border-current bg-current/10`}>
                        {riskLabel(fraudResult.fraudScore ?? 0)}
                      </span>
                    </div>
                    {fraudResult.reasons?.map((r: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-300 bg-[#0d1520] border border-[#1f2d3d] rounded-lg p-3">
                        <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>{r}
                      </div>
                    ))}
                  </div>
                )
              )}
            </Card>

            {/* Bonus Recommendation */}
            <Card
              icon={Gift}
              title="Bonus Recommender"
              badge="Personalization"
              description="AI-personalized bonus and retention offers"
              onRun={runBonus}
              running={loadingBonus}
            >
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">User ID</label>
                <input
                  value={bonusUserId}
                  onChange={e => setBonusUserId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && runBonus()}
                  placeholder="Paste user UUID..."
                  className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              {bonusResult ? <Result text={bonusResult} /> : (
                <div className="bg-[#0d1520] border border-[#1f2d3d] rounded-xl p-4 text-center text-gray-600 text-sm">
                  Enter a user ID and run analysis
                </div>
              )}
            </Card>

          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
