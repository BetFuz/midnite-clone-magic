import { useState, useEffect, useCallback } from 'react';
import { jackpotApi, JackpotRound, JackpotEntry, AIPick } from '@/lib/api/jackpot';

export type PickMap = Record<string, 'HOME' | 'DRAW' | 'AWAY'>;

export function useJackpot() {
  const [rounds, setRounds] = useState<JackpotRound[]>([]);
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);
  const [picks, setPicks] = useState<PickMap>({});
  const [aiPicks, setAIPicks] = useState<AIPick[]>([]);
  const [myTickets, setMyTickets] = useState<JackpotEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAILoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRound = rounds.find(r => r.id === activeRoundId) ?? null;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [r, t] = await Promise.all([jackpotApi.getRounds(), jackpotApi.getMyTickets()]);
      setRounds(r);
      setMyTickets(t);
      if (!activeRoundId && r.length > 0) setActiveRoundId(r[0].id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll pool amount every 15s
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!activeRoundId) return;
      try {
        const round = await jackpotApi.getRound(activeRoundId);
        setRounds(prev => prev.map(r => r.id === round.id ? { ...r, poolAmount: round.poolAmount } : r));
      } catch {}
    }, 15000);
    return () => clearInterval(interval);
  }, [activeRoundId]);

  const setPick = (matchId: string, pick: 'HOME' | 'DRAW' | 'AWAY') => {
    setPicks(prev => ({ ...prev, [matchId]: pick }));
  };

  const clearPicks = () => setPicks({});

  const fetchAIPicks = async () => {
    if (!activeRoundId) return;
    setAILoading(true);
    try {
      const newPicks = await jackpotApi.getAIPicks(activeRoundId);
      setAIPicks(newPicks);
      const pickMap: PickMap = {};
      for (const p of newPicks) pickMap[p.matchId] = p.pick;
      setPicks(prev => ({ ...prev, ...pickMap }));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAILoading(false);
    }
  };

  const submitEntry = async () => {
    if (!activeRound) return;
    setSubmitting(true);
    setError(null);
    try {
      const picksArray = Object.entries(picks).map(([matchId, pick]) => ({ matchId, pick }));
      const usedAI = aiPicks.length > 0;
      await jackpotApi.enter(activeRound.id, picksArray, usedAI);
      await load();
      clearPicks();
      setAIPicks([]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const pickedCount = activeRound
    ? Object.keys(picks).filter(id => activeRound.jackpot_matches.some(m => m.id === id)).length
    : 0;

  const allPicked = activeRound ? pickedCount === activeRound.matchCount : false;

  return {
    rounds, activeRound, activeRoundId, setActiveRoundId,
    picks, setPick, clearPicks,
    aiPicks, fetchAIPicks, aiLoading,
    myTickets, loading, submitting, error,
    submitEntry, pickedCount, allPicked,
    reload: load,
  };
}
