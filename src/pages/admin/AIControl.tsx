import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import { toast } from 'sonner';
import {
  Brain, Zap, DollarSign, ShieldCheck, Gift, HeartHandshake,
  Activity, RefreshCw, ChevronDown, ChevronUp, CheckCircle,
  AlertTriangle, RotateCcw, Play,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ModuleMeta {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  hardLimit?: string;
}

interface AIDecision {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
  createdAt: string;
}

// ── Module definitions ────────────────────────────────────────────────────────

const MODULES: ModuleMeta[] = [
  { key: 'withdrawals', label: 'Withdrawals',     icon: DollarSign,     color: 'emerald', description: 'Auto-approve low-risk payouts, auto-reject fraud',  hardLimit: 'Never auto-approves above ₦1M' },
  { key: 'kyc',         label: 'KYC Review',      icon: ShieldCheck,    color: 'blue',    description: 'Auto-approve Tier 1 documents with clear scans',   hardLimit: 'Never auto-approves Tier 2+ docs' },
  { key: 'fraud',       label: 'Fraud Detection', icon: AlertTriangle,  color: 'red',     description: 'Auto-suspend accounts with repeated fraud flags' },
  { key: 'odds',        label: 'Odds Management', icon: Zap,            color: 'yellow',  description: 'Auto-suspend outlier odds values (<1.01 or >50)' },
  { key: 'bonuses',     label: 'Bonus Engine',    icon: Gift,           color: 'pink',    description: 'Flag qualifying users for weekly cashback bonuses' },
  { key: 'rg',          label: 'Resp. Gambling',  icon: HeartHandshake, color: 'purple',  description: 'Auto-apply 24h cooling-off on limit breaches',      hardLimit: 'Never permanently excludes without human approval' },
  { key: 'settlement',  label: 'Bet Settlement',  icon: Activity,       color: 'cyan',    description: 'Auto-queue bets for settlement on finished events' },
];

function dialLabel(level: number): { label: string; cls: string } {
  if (level <= 30) return { label: 'Human Only', cls: 'text-gray-400 bg-gray-500/10 border-gray-500/20' };
  if (level <= 70) return { label: 'Hybrid',     cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
  return               { label: 'Autopilot',   cls: 'text-green-400 bg-green-500/10 border-green-500/20' };
}

function operatingMode(config: Record<string, number>): string {
  const vals = Object.values(config);
  if (!vals.length) return 'Human Only';
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
  if (avg <= 30) return 'Human Only';
  if (avg <= 70) return 'Hybrid';
  return 'Full Autopilot';
}

const COLOR_MAP: Record<string, string> = {
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  blue:    'text-blue-400 bg-blue-500/10 border-blue-500/20',
  red:     'text-red-400 bg-red-500/10 border-red-500/20',
  yellow:  'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  pink:    'text-pink-400 bg-pink-500/10 border-pink-500/20',
  purple:  'text-purple-400 bg-purple-500/10 border-purple-500/20',
  cyan:    'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
};

const TRACK_COLOR: Record<string, string> = {
  emerald: 'accent-emerald-500',
  blue:    'accent-blue-500',
  red:     'accent-red-500',
  yellow:  'accent-yellow-500',
  pink:    'accent-pink-500',
  purple:  'accent-purple-500',
  cyan:    'accent-cyan-500',
};

// ── ModuleCard ────────────────────────────────────────────────────────────────

const ModuleCard = ({
  mod, level, onChange, decisions, onOverride,
}: {
  mod: ModuleMeta;
  level: number;
  onChange: (key: string, val: number) => void;
  decisions: AIDecision[];
  onOverride: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { label, cls } = dialLabel(level);
  const Icon = mod.icon;
  const iconCls = COLOR_MAP[mod.color] ?? COLOR_MAP.blue;
  const trackCls = TRACK_COLOR[mod.color] ?? TRACK_COLOR.blue;
  const todayDecisions = decisions.filter(d =>
    d.resource === mod.key && new Date(d.createdAt) > new Date(Date.now() - 86400000)
  );

  return (
    <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${iconCls}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">{mod.label}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{mod.description}</p>
            </div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ml-2 ${cls}`}>
            {label}
          </span>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-gray-500 text-xs">AI Autonomy</span>
            <span className="text-white text-xs font-mono font-bold">{level}%</span>
          </div>
          <input
            type="range" min={0} max={100} step={5}
            value={level}
            onChange={e => onChange(mod.key, Number(e.target.value))}
            className={`w-full h-1.5 rounded-full cursor-pointer ${trackCls}`}
          />
          <div className="flex justify-between mt-1">
            <span className="text-gray-600 text-[10px]">Human</span>
            <span className="text-gray-600 text-[10px]">Hybrid</span>
            <span className="text-gray-600 text-[10px]">Autopilot</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="text-center">
            <p className="text-white text-sm font-bold">{todayDecisions.length}</p>
            <p className="text-gray-600 text-[10px]">actions today</p>
          </div>
          {mod.hardLimit && (
            <div className="flex items-center gap-1 text-yellow-500/70 text-[10px] border border-yellow-500/20 rounded px-2 py-1">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              {mod.hardLimit}
            </div>
          )}
        </div>

        {todayDecisions.length > 0 && (
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1 text-gray-500 text-xs hover:text-gray-300 transition-colors"
          >
            {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Recent decisions ({todayDecisions.length})
          </button>
        )}
      </div>

      {open && todayDecisions.length > 0 && (
        <div className="border-t border-[#1f2d3d] bg-[#0d1520]">
          {todayDecisions.slice(0, 5).map(d => (
            <div key={d.id} className="flex items-center justify-between px-4 py-2.5 border-b border-[#1f2d3d]/40 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-gray-300 text-xs font-mono truncate">{d.action}</p>
                <p className="text-gray-600 text-[10px]">
                  {new Date(d.createdAt).toLocaleTimeString()} · conf: {d.metadata?.confidence ?? '—'}%
                </p>
              </div>
              <button
                onClick={() => onOverride(d.id)}
                className="ml-2 flex items-center gap-1 text-[10px] text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded hover:bg-yellow-500/10 transition-colors flex-shrink-0"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Override
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AIControl() {
  const [config, setConfig]       = useState<Record<string, number>>({});
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [dirty, setDirty]         = useState(false);
  const [saving, setSaving]       = useState(false);
  const [running, setRunning]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [decPage, setDecPage]     = useState(1);
  const [decTotal, setDecTotal]   = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cfg, dec] = await Promise.all([
        adminApi.getAIControlConfig(),
        adminApi.getAIDecisions({ limit: 50 }),
      ]);
      const normalized: Record<string, number> = {};
      for (const [k, v] of Object.entries(cfg as Record<string, number>)) {
        normalized[k.replace('ai.autonomy.', '')] = Number(v);
      }
      setConfig(normalized);
      setDecisions(dec.decisions ?? []);
      setDecTotal(dec.total ?? 0);
    } catch { toast.error('Failed to load AI config'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (module: string, val: number) => {
    setConfig(c => ({ ...c, [module]: val }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const prefixed: Record<string, number> = {};
      for (const [k, v] of Object.entries(config)) prefixed[`ai.autonomy.${k}`] = v;
      await adminApi.saveAIControlConfig(prefixed);
      setDirty(false);
      toast.success('AI autonomy settings saved');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      const results = await adminApi.runAutopilot();
      const acted = (results as any[]).filter(r => r.acted).length;
      toast.success(`Autopilot cycle complete — ${acted} modules acted`);
      load();
    } catch { toast.error('Autopilot run failed'); }
    finally { setRunning(false); }
  };

  const handleOverride = async (auditLogId: string) => {
    try {
      await adminApi.overrideDecision(auditLogId, 'Manual override by admin');
      toast.success('Override logged');
      load();
    } catch { toast.error('Override failed'); }
  };

  const loadMoreDecisions = async () => {
    const next = decPage + 1;
    try {
      const dec = await adminApi.getAIDecisions({ page: next, limit: 50 });
      setDecisions(d => [...d, ...(dec.decisions ?? [])]);
      setDecPage(next);
    } catch { toast.error('Failed to load more'); }
  };

  const mode = operatingMode(config);
  const modeCls =
    mode === 'Full Autopilot' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
    mode === 'Hybrid'         ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'   :
                                'text-gray-400 bg-gray-500/10 border-gray-500/20';

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="AI Control Center" subtitle="Configure AI autonomy per module" />
        <div className="p-6 space-y-6">

          {/* Top bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold text-sm">Operating Mode:</span>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${modeCls}`}>{mode}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {dirty && (
                <button
                  onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#00b15c] hover:bg-[#00c96a] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving
                    ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Saving…</>
                    : <><CheckCircle className="w-3.5 h-3.5" />Save Changes</>}
                </button>
              )}
              <button
                onClick={handleRun} disabled={running}
                className="flex items-center gap-1.5 px-3 py-2 border border-[#1f2d3d] text-gray-400 hover:text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {running ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {running ? 'Running…' : 'Run Now'}
              </button>
              <button onClick={load} className="p-2 border border-[#1f2d3d] text-gray-400 hover:text-white rounded-lg transition-colors">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Info banner */}
          <div className="bg-[#1a1000] border border-yellow-500/20 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-400/80 text-xs leading-relaxed">
              <strong className="text-yellow-400">0–30%:</strong> AI analysis only, no autonomous action.&nbsp;
              <strong className="text-yellow-400">31–70%:</strong> AI acts on confidence &gt;80%, flags the rest.&nbsp;
              <strong className="text-yellow-400">71–100%:</strong> AI acts on confidence &gt;60%. Hardcoded limits always apply regardless of dial.
            </p>
          </div>

          {/* Module cards */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(7)].map((_, i) => <div key={i} className="h-44 bg-[#111827] border border-[#1f2d3d] rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {MODULES.map(mod => (
                <ModuleCard
                  key={mod.key}
                  mod={mod}
                  level={config[mod.key] ?? 0}
                  onChange={handleChange}
                  decisions={decisions}
                  onOverride={handleOverride}
                />
              ))}
            </div>
          )}

          {/* AI Action Log */}
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2d3d]">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <h3 className="text-white font-semibold text-sm">AI Action Log</h3>
                <span className="text-gray-500 text-xs">({decTotal} total)</span>
              </div>
            </div>

            {decisions.length === 0 ? (
              <div className="text-center py-10">
                <Brain className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No AI actions yet</p>
                <p className="text-gray-700 text-xs mt-1">Set autonomy above 30% and click Run Now to see AI decisions here</p>
              </div>
            ) : (
              <>
                <div className="hidden sm:grid grid-cols-[130px_110px_1fr_90px_110px] gap-4 px-5 py-2 text-gray-600 text-xs uppercase tracking-wider border-b border-[#1f2d3d]/50">
                  <span>Time</span><span>Module</span><span>Action</span><span>Confidence</span><span />
                </div>
                <div className="divide-y divide-[#1f2d3d]/50">
                  {decisions.map(d => (
                    <div key={d.id} className="grid grid-cols-1 sm:grid-cols-[130px_110px_1fr_90px_110px] gap-2 sm:gap-4 px-5 py-3 items-center hover:bg-white/[0.01]">
                      <span className="text-gray-500 text-xs">
                        {new Date(d.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-gray-400 text-xs capitalize">{d.resource}</span>
                      <span className="text-gray-300 text-xs font-mono">{d.action}</span>
                      <span className="text-[#00b15c] text-xs font-bold">
                        {d.metadata?.confidence != null ? `${d.metadata.confidence}%` : '—'}
                      </span>
                      <button
                        onClick={() => handleOverride(d.id)}
                        className="flex items-center gap-1 text-[10px] text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded hover:bg-yellow-500/10 transition-colors"
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> Override
                      </button>
                    </div>
                  ))}
                </div>
                {decisions.length < decTotal && (
                  <div className="px-5 py-3 border-t border-[#1f2d3d]">
                    <button onClick={loadMoreDecisions} className="text-[#00b15c] text-xs hover:underline">
                      Load more ({decTotal - decisions.length} remaining) →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
