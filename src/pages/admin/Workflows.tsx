import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import { Play, Pause, RefreshCw, Activity, Clock, CheckCircle, XCircle, Zap } from 'lucide-react';

const statusDot = (active: boolean) => (
  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-[#00b15c]' : 'bg-gray-600'}`} />
);

const execStatus: Record<string, string> = {
  success:   'bg-green-500/10 text-green-400 border-green-500/20',
  error:     'bg-red-500/10 text-red-400 border-red-500/20',
  running:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  waiting:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  canceled:  'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const manualTriggers = [
  { name: 'bet-settlement-auto',      label: 'Auto-settle pending bets',   color: 'text-purple-400' },
  { name: 'withdrawal-aml-check',     label: 'Run AML check on pending withdrawals', color: 'text-orange-400' },
  { name: 'bet-fraud-detection',      label: 'Fraud scan on recent bets',  color: 'text-red-400' },
  { name: 'wallet-auto-approve-withdrawal', label: 'Auto-approve low-risk withdrawals', color: 'text-green-400' },
  { name: 'withdrawal-notify-user',   label: 'Re-notify withdrawal users', color: 'text-blue-400' },
];

export default function AdminWorkflows() {
  const [workflows, setWorkflows]   = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [toggling, setToggling]     = useState<string | null>(null);
  const [triggering, setTriggering] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [wf, ex] = await Promise.all([
        adminApi.getN8nWorkflows(),
        adminApi.getN8nExecutions(),
      ]);
      setWorkflows(wf?.data ?? wf ?? []);
      setExecutions(ex?.data ?? ex ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (wf: any) => {
    setToggling(wf.id);
    try {
      if (wf.active) await adminApi.deactivateWorkflow(wf.id);
      else            await adminApi.activateWorkflow(wf.id);
      load();
    } catch { /* silent */ }
    finally { setToggling(null); }
  };

  const trigger = async (name: string) => {
    setTriggering(name);
    try {
      await adminApi.triggerWorkflow(name);
    } catch { /* silent */ }
    finally {
      setTriggering(null);
      load();
    }
  };

  const activeCount   = workflows.filter(w => w.active).length;
  const inactiveCount = workflows.filter(w => !w.active).length;

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="n8n Automation" onRefresh={load} />
        <div className="p-6 space-y-6">

          {/* n8n status bar */}
          <div className="flex items-center gap-4 bg-[#111827] border border-[#1f2d3d] rounded-xl px-5 py-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">n8n Automation Engine</p>
              <p className="text-gray-500 text-xs">Betfuz dedicated container — port 5690</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-white font-bold">{workflows.length}</p>
                <p className="text-gray-500 text-xs">Total</p>
              </div>
              <div className="text-center">
                <p className="text-[#00b15c] font-bold">{activeCount}</p>
                <p className="text-gray-500 text-xs">Active</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 font-bold">{inactiveCount}</p>
                <p className="text-gray-500 text-xs">Inactive</p>
              </div>
            </div>
            <button onClick={load} className="p-2 border border-[#1f2d3d] rounded-lg text-gray-400 hover:text-white transition-all">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Workflows list */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-white font-semibold text-sm">Workflows</h3>
              {loading ? (
                [...Array(5)].map((_, i) => <div key={i} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 h-14 animate-pulse" />)
              ) : workflows.length === 0 ? (
                <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-8 text-center text-gray-500 text-sm">
                  No workflows found. Check n8n connection.
                </div>
              ) : workflows.map(wf => (
                <div key={wf.id} className="bg-[#111827] border border-[#1f2d3d] rounded-xl px-4 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {statusDot(wf.active)}
                    <div>
                      <p className="text-white text-sm font-medium">{wf.name}</p>
                      <p className="text-gray-500 text-xs">
                        ID: {wf.id} · Updated {wf.updatedAt ? new Date(wf.updatedAt).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${wf.active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                      {wf.active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => toggle(wf)}
                      disabled={toggling === wf.id}
                      className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${wf.active ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                      title={wf.active ? 'Deactivate' : 'Activate'}
                    >
                      {toggling === wf.id ? (
                        <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin block" />
                      ) : wf.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Manual Triggers + Recent Executions */}
            <div className="space-y-5">
              {/* Manual triggers */}
              <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 space-y-3">
                <h3 className="text-white font-semibold text-sm border-b border-[#1f2d3d] pb-2">Manual Triggers</h3>
                {manualTriggers.map(t => (
                  <button
                    key={t.name}
                    onClick={() => trigger(t.name)}
                    disabled={triggering === t.name}
                    className="w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg border border-[#1f2d3d] hover:border-[#00b15c]/20 hover:bg-white/2 transition-all disabled:opacity-50"
                  >
                    <span className={`text-sm ${t.color}`}>{t.label}</span>
                    {triggering === t.name ? (
                      <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin block text-gray-400" />
                    ) : <Play className="w-3.5 h-3.5 text-gray-600" />}
                  </button>
                ))}
              </div>

              {/* Recent executions */}
              <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-[#1f2d3d] pb-2">
                  <h3 className="text-white font-semibold text-sm">Recent Executions</h3>
                  <Activity className="w-3.5 h-3.5 text-gray-500" />
                </div>
                {loading ? (
                  [...Array(5)].map((_, i) => <div key={i} className="h-10 bg-[#1f2d3d] rounded-lg animate-pulse" />)
                ) : executions.length === 0 ? (
                  <p className="text-gray-600 text-xs text-center py-4">No recent executions</p>
                ) : executions.slice(0, 15).map((ex: any) => (
                  <div key={ex.id} className="flex items-center justify-between py-1.5 border-b border-[#1f2d3d]/40 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 text-xs truncate">{ex.workflowData?.name ?? ex.id?.slice(0, 8)}</p>
                      <p className="text-gray-600 text-[10px]">
                        {ex.startedAt ? new Date(ex.startedAt).toLocaleTimeString() : '—'}
                        {ex.stoppedAt && ` · ${Math.round((new Date(ex.stoppedAt).getTime() - new Date(ex.startedAt).getTime()) / 1000)}s`}
                      </p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ml-2 flex-shrink-0 ${execStatus[ex.status] ?? execStatus.canceled}`}>
                      {ex.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
