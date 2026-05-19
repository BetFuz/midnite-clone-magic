import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, RefreshCw, X, CheckCircle, DollarSign, ShieldCheck, AlertTriangle, Zap, ChevronLeft } from 'lucide-react';
import { adminApi } from '@/lib/api/adminApi';

interface PendingCounts { withdrawals: number; kyc: number; fraudFlags: number; }
interface SSEEvent { type: string; data: Record<string, any>; ts: number; }

const typeIcon: Record<string, any> = {
  withdrawal_approved: CheckCircle,
  kyc_approved:        ShieldCheck,
  kyc_rejected:        ShieldCheck,
  user_suspended:      AlertTriangle,
  bet_settled:         Zap,
};
const typeColor: Record<string, string> = {
  withdrawal_approved: 'text-green-400',
  kyc_approved:        'text-blue-400',
  kyc_rejected:        'text-red-400',
  user_suspended:      'text-orange-400',
  bet_settled:         'text-purple-400',
};
const typeLabel: Record<string, string> = {
  withdrawal_approved: 'Withdrawal approved',
  kyc_approved:        'KYC approved',
  kyc_rejected:        'KYC rejected',
  user_suspended:      'User suspended',
  bet_settled:         'Bet settled',
  init:                'Connected',
};

export const AdminHeader = ({ title, onRefresh }: { title: string; onRefresh?: () => void }) => {
  const navigate = useNavigate();
  const [time, setTime]               = useState(new Date());
  const [pending, setPending]         = useState<PendingCounts>({ withdrawals: 0, kyc: 0, fraudFlags: 0 });
  const [events, setEvents]           = useState<SSEEvent[]>([]);
  const [panelOpen, setPanelOpen]     = useState(false);
  const [sseStatus, setSseStatus]     = useState<'connecting' | 'live' | 'error'>('connecting');
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      const es = adminApi.createEventSource();
      if (!es) { setSseStatus('error'); return; }
      esRef.current = es;

      es.onopen = () => setSseStatus('live');
      es.onerror = () => {
        setSseStatus('error');
        es.close();
        reconnectTimer = setTimeout(connect, 5000);
      };
      es.onmessage = (e) => {
        try {
          const evt: SSEEvent = JSON.parse(e.data);
          if (evt.type === 'init') {
            setPending(evt.data as PendingCounts);
          } else {
            setEvents(prev => [evt, ...prev].slice(0, 50));
            // Update pending counts from event side-effects
            if (evt.type === 'kyc_approved' || evt.type === 'kyc_rejected') {
              setPending(p => ({ ...p, kyc: Math.max(0, p.kyc - 1) }));
            }
            if (evt.type === 'withdrawal_approved' || evt.type === 'withdrawal_rejected') {
              setPending(p => ({ ...p, withdrawals: Math.max(0, p.withdrawals - 1) }));
            }
          }
        } catch { /* malformed event */ }
      };
    };

    connect();
    return () => {
      clearTimeout(reconnectTimer);
      esRef.current?.close();
    };
  }, []);

  const totalPending = pending.withdrawals + pending.kyc + pending.fraudFlags;
  const unread = events.filter(e => e.type !== 'init').length;

  return (
    <header className="h-14 bg-[#111827] border-b border-[#1f2d3d] flex items-center justify-between px-6 flex-shrink-0 relative z-20">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          title="Go back"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h1 className="text-white font-semibold text-base">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* SSE live indicator */}
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${sseStatus === 'live' ? 'bg-[#00b15c] animate-pulse' : sseStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`} />
          <span className="text-gray-600 text-xs">{sseStatus === 'live' ? 'Live' : sseStatus === 'error' ? 'Offline' : '...'}</span>
        </div>

        <span className="text-gray-500 text-xs font-mono">{time.toLocaleTimeString('en-US', { hour12: false })}</span>

        {onRefresh && (
          <button onClick={onRefresh} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setPanelOpen(p => !p)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all relative"
          >
            <Bell className="w-4 h-4" />
            {(totalPending > 0 || unread > 0) && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-[#00b15c] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                {Math.min(99, totalPending + unread)}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {panelOpen && (
            <div className="absolute right-0 top-10 w-80 bg-[#111827] border border-[#1f2d3d] rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2d3d]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <span className="text-white text-sm font-semibold">Live Alerts</span>
                </div>
                <button onClick={() => setPanelOpen(false)} className="text-gray-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
              </div>

              {/* Pending counts summary */}
              {totalPending > 0 && (
                <div className="px-4 py-2 border-b border-[#1f2d3d] flex flex-wrap gap-2">
                  {pending.withdrawals > 0 && (
                    <span className="flex items-center gap-1 text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full">
                      <DollarSign className="w-3 h-3" />{pending.withdrawals} withdrawals
                    </span>
                  )}
                  {pending.kyc > 0 && (
                    <span className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />{pending.kyc} KYC
                    </span>
                  )}
                  {pending.fraudFlags > 0 && (
                    <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" />{pending.fraudFlags} flags
                    </span>
                  )}
                </div>
              )}

              {/* Event stream */}
              <div className="max-h-72 overflow-y-auto">
                {events.length === 0 ? (
                  <div className="text-center text-gray-600 text-xs py-8">No recent events</div>
                ) : events.map((e, i) => {
                  const Icon = typeIcon[e.type] ?? Zap;
                  const color = typeColor[e.type] ?? 'text-gray-400';
                  return (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-[#1f2d3d]/50 hover:bg-white/2">
                      <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${color}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${color}`}>{typeLabel[e.type] ?? e.type.replace(/_/g, ' ')}</p>
                        <p className="text-gray-600 text-[10px]">{new Date(e.ts).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {events.length > 0 && (
                <div className="px-4 py-2 border-t border-[#1f2d3d]">
                  <button onClick={() => setEvents([])} className="text-gray-500 hover:text-gray-300 text-xs w-full text-center">Clear all</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
