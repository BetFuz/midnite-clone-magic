import { useState, lazy, Suspense } from 'react';
import { Trophy, History } from 'lucide-react';
import { useJackpot } from '@/hooks/useJackpot';
import { JackpotTierCard } from '@/components/jackpot/JackpotTierCard';
import { JackpotMatchCard } from '@/components/jackpot/JackpotMatchCard';
import { JackpotAIPicks } from '@/components/jackpot/JackpotAIPicks';
import { JackpotProgress } from '@/components/jackpot/JackpotProgress';
import { JackpotMyTickets } from '@/components/jackpot/JackpotMyTickets';
import { JackpotSyndicate } from '@/components/jackpot/JackpotSyndicate';
import { AIPick } from '@/lib/api/jackpot';

type Tab = 'picks' | 'my-tickets';

export default function Jackpot() {
  const [tab, setTab] = useState<Tab>('picks');

  const {
    rounds, activeRound, activeRoundId, setActiveRoundId,
    picks, setPick,
    aiPicks, fetchAIPicks, aiLoading,
    myTickets, loading, submitting, error,
    submitEntry, pickedCount, allPicked,
  } = useJackpot();

  const aiPickMap: Record<string, AIPick> = {};
  for (const p of aiPicks) aiPickMap[p.matchId] = p;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d1520]">
        <div className="text-center space-y-3">
          <Trophy className="w-12 h-12 text-[#00b15c] mx-auto animate-pulse" />
          <p className="text-gray-400 text-sm">Loading jackpots…</p>
        </div>
      </div>
    );
  }

  if (rounds.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d1520]">
        <div className="text-center space-y-3 px-8">
          <Trophy className="w-14 h-14 text-gray-700 mx-auto" />
          <p className="text-white font-semibold text-lg">No active jackpots</p>
          <p className="text-gray-500 text-sm">New rounds open every week. Check back Sunday!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1520] pb-28">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#111827] to-transparent px-4 pt-6 pb-5 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#00b15c]/20 flex items-center justify-center">
                <Trophy className="w-4.5 h-4.5 text-[#00b15c]" />
              </div>
              <h1 className="text-xl font-black text-white tracking-tight">FuzJackpot</h1>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 ml-10">Pick winners. Win millions. Rolls over every week.</p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-[#111827] border border-[#1f2d3d] rounded-xl p-1">
            {(['picks', 'my-tickets'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  tab === t ? 'bg-[#00b15c] text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'picks' ? 'Jackpots' : `My Tickets${myTickets.length > 0 ? ` (${myTickets.length})` : ''}`}
              </button>
            ))}
          </div>
        </div>

        {/* Tier cards — horizontal scroll */}
        {tab === 'picks' && (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
            {rounds.map(round => (
              <JackpotTierCard
                key={round.id}
                round={round}
                isActive={round.id === activeRoundId}
                onClick={() => setActiveRoundId(round.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Picks tab */}
      {tab === 'picks' && activeRound && (
        <div className="px-4 space-y-3">
          {/* Round info banner */}
          <div className="flex items-center justify-between py-2 px-3 bg-[#111827]/80 rounded-xl border border-[#1f2d3d]">
            <span className="text-xs text-gray-400">{activeRound.weekLabel}</span>
            {activeRound.rolloverWeeks > 0 && (
              <span className="text-xs font-bold text-orange-400">
                🔥 Week {activeRound.rolloverWeeks} Rollover
              </span>
            )}
          </div>

          <JackpotAIPicks onRequest={fetchAIPicks} loading={aiLoading} picks={aiPicks} />
          <JackpotSyndicate roundId={activeRound.id} entryFee={activeRound.entryFee} />

          {/* Match cards */}
          <div className="space-y-3">
            {activeRound.jackpot_matches.map(match => (
              <JackpotMatchCard
                key={match.id}
                match={match}
                pick={picks[match.id]}
                onPick={(p) => setPick(match.id, p)}
                aiPick={aiPickMap[match.id]?.pick}
                aiConfidence={aiPickMap[match.id]?.confidence}
                aiReason={aiPickMap[match.id]?.reason}
                result={match.result ?? undefined}
              />
            ))}
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">
              {error}
            </div>
          )}
        </div>
      )}

      {/* My Tickets tab */}
      {tab === 'my-tickets' && (
        <div className="px-4 pt-4">
          <JackpotMyTickets tickets={myTickets} />
        </div>
      )}

      {/* Sticky progress / submit bar */}
      {tab === 'picks' && activeRound && (
        <JackpotProgress
          picked={pickedCount}
          total={activeRound.matchCount}
          entryFee={activeRound.entryFee}
          onSubmit={submitEntry}
          submitting={submitting}
        />
      )}
    </div>
  );
}
