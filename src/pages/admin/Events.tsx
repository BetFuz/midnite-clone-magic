import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import {
  Calendar, Zap, Search, RefreshCw, Plus, Edit2, Trash2, X,
  ChevronDown, ChevronUp, BarChart2, Clock, CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLOR: Record<string, string> = {
  upcoming:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  live:      'bg-green-500/10 text-green-400 border-green-500/20',
  finished:  'bg-gray-500/10 text-gray-400 border-gray-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const SPORTS = ['All Sports', 'Football', 'Basketball', 'Tennis', 'Cricket', 'Rugby', 'Virtual'];
const STATUSES = ['All Status', 'upcoming', 'live', 'finished', 'cancelled'];

const Badge = ({ text, color }: { text: string; color: string }) => (
  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium capitalize ${color}`}>{text}</span>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">{label}</label>
    {children}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00b15c]/50" />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <select {...props} className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00b15c]/50">
    {props.children}
  </select>
);

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-[#111827] border border-[#1f2d3d] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2d3d] sticky top-0 bg-[#111827]">
        <h3 className="text-white font-semibold">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

const emptyEvent = {
  homeTeam: '', awayTeam: '', sport: 'Football', league: '',
  startTime: '', status: 'upcoming',
};

export default function AdminEvents() {
  const [events, setEvents]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [sport, setSport]       = useState('All Sports');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modal, setModal]       = useState<'create' | 'edit' | 'odds' | 'delete' | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm]         = useState({ ...emptyEvent });
  const [oddsForm, setOddsForm] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getEvents({
        search: search || undefined,
        sport: sport !== 'All Sports' ? sport : undefined,
        status: statusFilter !== 'All Status' ? statusFilter : undefined,
      });
      setEvents(res.events ?? res.data ?? []);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  }, [search, sport, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (ev: any) => {
    setSelected(ev);
    setForm({
      homeTeam: ev.homeTeam ?? '', awayTeam: ev.awayTeam ?? '',
      sport: ev.sport ?? 'Football', league: ev.league ?? '',
      startTime: ev.startTime ? ev.startTime.slice(0, 16) : '',
      status: ev.status ?? 'upcoming',
    });
    setModal('edit');
  };

  const openOdds = (ev: any) => {
    setSelected(ev);
    // oddsForm: { [oddsId]: valueString }
    const flat: Record<string, string> = {};
    for (const m of (ev.markets ?? [])) {
      for (const o of (m.odds ?? [])) {
        flat[o.id] = String(Number(o.value).toFixed(2));
      }
    }
    setOddsForm(flat);
    setModal('odds');
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (modal === 'create') {
        await adminApi.createEvent(form);
        toast.success('Event created');
      } else {
        await adminApi.updateEvent(selected.id, form);
        toast.success('Event updated');
      }
      setModal(null);
      load();
    } catch { toast.error('Save failed'); }
    finally { setSubmitting(false); }
  };

  const handleSaveOdds = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      // Update each odds entry individually by its actual odds ID
      const updates = Object.entries(oddsForm as Record<string, string>)
        .filter(([, v]) => v && !isNaN(parseFloat(v)) && parseFloat(v) >= 1.01)
        .map(([oddsId, value]) => adminApi.updateOdds(oddsId, { value: parseFloat(value) }));
      await Promise.all(updates);
      toast.success('Odds updated');
      setModal(null);
      load();
    } catch { toast.error('Odds update failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await adminApi.deleteEvent(selected.id);
      toast.success('Event deleted');
      setModal(null);
      load();
    } catch { toast.error('Delete failed'); }
    finally { setSubmitting(false); }
  };

  const handleStatusQuick = async (id: string, newStatus: string) => {
    try {
      await adminApi.updateEvent(id, { status: newStatus });
      toast.success(`Status → ${newStatus}`);
      load();
    } catch { toast.error('Update failed'); }
  };

  const liveCount = events.filter(e => e.status === 'live').length;
  const upcomingCount = events.filter(e => e.status === 'upcoming').length;

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="Events & Odds" subtitle="Manage sports events and markets" />

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400 text-sm">Total Events</span>
            </div>
            <p className="text-white text-2xl font-bold">{events.length}</p>
          </div>
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-gray-400 text-sm">Live Now</span>
            </div>
            <p className="text-green-400 text-2xl font-bold">{liveCount}</p>
          </div>
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400 text-sm">Upcoming</span>
            </div>
            <p className="text-blue-400 text-2xl font-bold">{upcomingCount}</p>
          </div>
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">Finished</span>
            </div>
            <p className="text-gray-400 text-2xl font-bold">{events.filter(e => e.status === 'finished').length}</p>
          </div>
        </div>

        {/* Filters + Add button */}
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search teams, league…"
                className="bg-transparent text-white text-sm flex-1 outline-none"
              />
            </div>
            <select
              value={sport} onChange={e => setSport(e.target.value)}
              className="bg-[#0d1520] border border-[#1f2d3d] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none"
            >
              {SPORTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <select
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#0d1520] border border-[#1f2d3d] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none"
            >
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={load} className="p-2 bg-[#0d1520] border border-[#1f2d3d] text-gray-400 hover:text-white rounded-lg transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => { setForm({ ...emptyEvent }); setModal('create'); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#00b15c] hover:bg-[#00c96a] text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> New Event
            </button>
          </div>
        </div>

        {/* Events list */}
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#111827] border border-[#1f2d3d] rounded-xl animate-pulse" />
            ))
          ) : events.length === 0 ? (
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-10 text-center text-gray-500">
              No events found
            </div>
          ) : events.map(ev => (
            <div key={ev.id} className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpanded(expanded === ev.id ? null : ev.id)}
              >
                {/* Live pulse */}
                <div className="w-6 flex-shrink-0 flex items-center justify-center">
                  {ev.status === 'live'
                    ? <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                    : <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm truncate">
                      {ev.homeTeam} <span className="text-gray-500">vs</span> {ev.awayTeam}
                    </span>
                    {ev.status === 'live' && (
                      <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded font-bold">LIVE</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-gray-500 text-xs">{ev.sport}</span>
                    {ev.league && <span className="text-gray-600 text-xs">· {ev.league}</span>}
                    {ev.startTime && (
                      <span className="text-gray-600 text-xs">· {new Date(ev.startTime).toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {ev.betCount !== undefined && (
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <BarChart2 className="w-3.5 h-3.5" />
                      {ev.betCount} bets
                    </div>
                  )}
                  <Badge text={ev.status} color={STATUS_COLOR[ev.status] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'} />
                  {expanded === ev.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </div>
              </div>

              {/* Expanded panel */}
              {expanded === ev.id && (
                <div className="border-t border-[#1f2d3d] bg-[#0d1520] px-4 py-4">
                  {/* Quick status buttons */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-500 text-xs uppercase tracking-wider mr-1">Quick status:</span>
                    {['upcoming', 'live', 'finished', 'cancelled'].map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusQuick(ev.id, s)}
                        className={`text-xs px-2.5 py-1 rounded border transition-all capitalize ${
                          ev.status === s
                            ? STATUS_COLOR[s]
                            : 'border-[#1f2d3d] text-gray-500 hover:text-white hover:border-gray-500'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Markets preview */}
                  {ev.markets && Object.keys(ev.markets).length > 0 && (
                    <div className="mb-4">
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Markets</p>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(ev.markets).slice(0, 6).map(([market, val]: any) => (
                          <div key={market} className="bg-[#111827] border border-[#1f2d3d] rounded-lg px-3 py-2">
                            <p className="text-gray-500 text-xs">{market}</p>
                            <p className="text-[#00b15c] font-bold text-sm">{typeof val === 'object' ? JSON.stringify(val) : val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(ev)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] border border-[#1f2d3d] text-gray-300 hover:text-white rounded-lg text-xs transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Event
                    </button>
                    <button
                      onClick={() => openOdds(ev)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00b15c]/10 border border-[#00b15c]/20 text-[#00b15c] hover:bg-[#00b15c]/20 rounded-lg text-xs transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" /> Edit Odds
                    </button>
                    <button
                      onClick={() => { setSelected(ev); setModal('delete'); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg text-xs transition-colors ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Create / Edit Modal */}
        {(modal === 'create' || modal === 'edit') && (
          <Modal title={modal === 'create' ? 'New Event' : 'Edit Event'} onClose={() => setModal(null)}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Home Team">
                  <Input value={form.homeTeam} onChange={e => setForm(f => ({ ...f, homeTeam: e.target.value }))} placeholder="e.g. Arsenal" />
                </Field>
                <Field label="Away Team">
                  <Input value={form.awayTeam} onChange={e => setForm(f => ({ ...f, awayTeam: e.target.value }))} placeholder="e.g. Chelsea" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Sport">
                  <Select value={form.sport} onChange={e => setForm(f => ({ ...f, sport: e.target.value }))}>
                    {SPORTS.filter(s => s !== 'All Sports').map(s => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
                <Field label="League">
                  <Input value={form.league} onChange={e => setForm(f => ({ ...f, league: e.target.value }))} placeholder="e.g. Premier League" />
                </Field>
              </div>
              <Field label="Start Time">
                <Input type="datetime-local" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {['upcoming', 'live', 'finished', 'cancelled'].map(s => <option key={s}>{s}</option>)}
                </Select>
              </Field>
              <button
                onClick={handleSave} disabled={submitting || !form.homeTeam || !form.awayTeam}
                className="w-full bg-[#00b15c] hover:bg-[#00c96a] text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving…' : modal === 'create' ? 'Create Event' : 'Save Changes'}
              </button>
            </div>
          </Modal>
        )}

        {/* Odds Modal */}
        {modal === 'odds' && selected && (
          <Modal title={`Odds — ${selected.homeTeam} vs ${selected.awayTeam}`} onClose={() => setModal(null)}>
            <div className="space-y-4">
              {(selected.markets ?? []).length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No markets defined for this event. Use the Events page to add markets first.
                </p>
              ) : (
                <div className="space-y-4">
                  {(selected.markets ?? []).map((market: any) => (
                    <div key={market.id}>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">{market.name}</p>
                      <div className={`grid gap-2 ${market.odds?.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {(market.odds ?? []).map((o: any) => (
                          <Field key={o.id} label={o.name}>
                            <Input
                              type="number" step="0.01" min="1.01"
                              value={(oddsForm as Record<string, string>)[o.id] ?? ''}
                              onChange={e => setOddsForm((f: any) => ({ ...f, [o.id]: e.target.value }))}
                              placeholder="1.00"
                            />
                          </Field>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {(selected.markets ?? []).length > 0 && (
                <button
                  onClick={handleSaveOdds} disabled={submitting}
                  className="w-full bg-[#00b15c] hover:bg-[#00c96a] text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Update All Odds'}
                </button>
              )}
            </div>
          </Modal>
        )}

        {/* Delete Confirm */}
        {modal === 'delete' && selected && (
          <Modal title="Delete Event" onClose={() => setModal(null)}>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Permanently delete <span className="text-white font-semibold">{selected.homeTeam} vs {selected.awayTeam}</span>?
                This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-[#1f2d3d] text-gray-400 hover:text-white rounded-lg text-sm">Cancel</button>
                <button onClick={handleDelete} disabled={submitting} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50">
                  {submitting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
