import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export const useLeagueMatchCounts = (leagueNames: string[], daysAhead: number = 14) => {
  return useQuery({
    queryKey: ['league-match-counts', leagueNames, daysAhead],
    queryFn: async (): Promise<Record<string, number>> => {
      const results = await Promise.allSettled(
        leagueNames.map(async (name) => {
          const { data } = await api.get('/sports/fixtures', {
            params: { league: name, days: daysAhead },
          });
          return { name, count: (data.data ?? []).length as number };
        })
      );
      const counts: Record<string, number> = {};
      leagueNames.forEach((name, i) => {
        const r = results[i];
        counts[name] = r?.status === 'fulfilled' ? r.value.count : 0;
      });
      return counts;
    },
    staleTime: 15 * 60 * 1000,
    gcTime:    60 * 60 * 1000,
    retry: 1,
  });
};
