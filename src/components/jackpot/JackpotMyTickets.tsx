import { CheckCircle, XCircle, Clock, Trophy } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { JackpotEntry } from '@/lib/api/jackpot';

interface Props {
  tickets: JackpotEntry[];
}

const TIER_COLOR: Record<string, string> = { MINI: '#00b15c', MIDI: '#3b82f6', MEGA: '#f59e0b' };

export function JackpotMyTickets({ tickets }: Props) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-base font-medium text-gray-400">No tickets yet</p>
        <p className="text-sm mt-1">Enter a jackpot to start winning</p>
      </div>
    );
  }

  const roundHistory = tickets.slice(0, 8).map((t, i) => ({
    name: `R${i + 1}`,
    pct: t.jackpot_rounds?.matchCount
      ? Math.round(((t.correctCount ?? 0) / t.jackpot_rounds.matchCount) * 100)
      : 0,
  }));

  const latest = tickets[0];
  const latestRound = latest?.jackpot_rounds;
  const radarData = latestRound
    ? [
        { subject: 'Correct', A: latest.correctCount ?? 0, fullMark: latestRound.matchCount },
        { subject: 'Wrong', A: latestRound.matchCount - (latest.correctCount ?? 0), fullMark: latestRound.matchCount },
      ]
    : [];

  return (
    <div className="space-y-6 pb-6">
      {/* Charts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
          <div className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Accuracy History</div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={roundHistory} barSize={14}>
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1f2d3d', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [`${v}%`, 'Hit rate']}
              />
              <Bar dataKey="pct" fill="#00b15c" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {radarData.length > 0 && (
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
            <div className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Latest Ticket</div>
            <div className="flex items-center justify-center h-[100px]">
              <RadarChart cx="50%" cy="50%" outerRadius={40} width={140} height={100} data={radarData}>
                <PolarGrid stroke="#1f2d3d" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 9 }} />
                <Radar dataKey="A" stroke="#00b15c" fill="#00b15c" fillOpacity={0.25} />
              </RadarChart>
            </div>
          </div>
        )}
      </div>

      {/* Ticket list */}
      {tickets.map(ticket => {
        const round = ticket.jackpot_rounds;
        const picks = ticket.picks as Array<{ matchId: string; pick: string }>;
        const matches = round?.jackpot_matches ?? [];
        const tier = round?.tier ?? 'MINI';
        const color = TIER_COLOR[tier];
        const total = round?.matchCount ?? 0;
        const correct = ticket.correctCount ?? 0;
        const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

        return (
          <div key={ticket.id} className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
            {/* Tier accent bar */}
            <div className="h-1" style={{ background: color }} />

            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {round?.weekLabel ?? 'Jackpot'} · Ticket #{ticket.ticketNumber}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {tier} · ₦{ticket.entryFee} entry
                    {ticket.usedAIPicks && <span className="ml-2 text-purple-400">• AI picks</span>}
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  ticket.status === 'CORRECT_ALL' ? 'bg-[#00b15c]/20 text-[#00b15c]' :
                  ticket.status === 'CONSOLATION' ? 'bg-yellow-500/20 text-yellow-400' :
                  ticket.status === 'LOST' ? 'bg-red-500/10 text-red-400' :
                  'bg-[#1f2d3d] text-gray-400'
                }`}>
                  {ticket.status === 'PENDING' && ticket.correctCount !== undefined
                    ? `${correct}/${total} correct`
                    : ticket.status.replace('_', ' ')}
                </span>
              </div>

              {ticket.payout && Number(ticket.payout) > 0 && (
                <div className="mb-3 px-3 py-2 bg-[#00b15c]/10 border border-[#00b15c]/20 rounded-lg">
                  <span className="text-sm text-[#00b15c] font-bold">
                    🏆 Won ₦{Number(ticket.payout).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Progress bar */}
              {ticket.correctCount !== undefined && total > 0 && (
                <div className="mb-3">
                  <div className="h-1.5 bg-[#1f2d3d] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    {correct}/{total} correct
                    {total - correct <= 3 && total - correct > 0 && ticket.status === 'PENDING' &&
                      ' — on track for consolation prize'}
                  </div>
                </div>
              )}

              {/* Per-match tracker */}
              {matches.length > 0 && (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {matches.map(m => {
                    const myPick = picks.find(p => p.matchId === m.id);
                    const isCorrect = m.result && myPick ? myPick.pick === m.result : null;
                    return (
                      <div key={m.id} className="flex items-center gap-2 py-1 text-xs border-b border-[#1f2d3d]/40 last:border-0">
                        <span className="text-[10px] text-gray-500 w-4 flex-shrink-0">{m.position}</span>
                        <span className="text-gray-400 flex-1 truncate">{m.homeTeam} vs {m.awayTeam}</span>
                        <span className="text-gray-500 flex-shrink-0 w-8 text-center font-mono">
                          {myPick?.pick === 'HOME' ? '1' : myPick?.pick === 'DRAW' ? 'X' : myPick?.pick === 'AWAY' ? '2' : '—'}
                        </span>
                        {isCorrect === null
                          ? <Clock className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                          : isCorrect
                            ? <CheckCircle className="w-3.5 h-3.5 text-[#00b15c] flex-shrink-0" />
                            : <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
