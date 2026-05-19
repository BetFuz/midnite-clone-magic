import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export interface Match {
  id: string;
  match_id: string;
  league_id?: number;
  sport_key: string;
  sport_title: string;
  league_name: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  home_odds?: number;
  draw_odds?: number;
  away_odds?: number;
  status: string;
}

export const useLeagueMatches = (leagueName: string, daysAhead: number = 7) => {
  return useQuery({
    queryKey: ['league-matches', leagueName, daysAhead],
    queryFn: async (): Promise<Match[]> => {
      const { data } = await api.get('/sports/fixtures', {
        params: { league: leagueName, days: daysAhead },
      });
      return (data.data ?? []) as Match[];
    },
    staleTime: 10 * 60 * 1000,  // 10 min
    gcTime:    60 * 60 * 1000,  // 1 hr
    retry: 2,
  });
};

export const useSportMatches = (sportKey: string, daysAhead: number = 7) => {
  return useQuery({
    queryKey: ['sport-matches', sportKey, daysAhead],
    queryFn: async (): Promise<Match[]> => {
      const { data } = await api.get('/sports/fixtures', {
        params: { league: sportKey, days: daysAhead },
      });
      return (data.data ?? []) as Match[];
    },
    staleTime: 10 * 60 * 1000,
    gcTime:    60 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,  // refresh every 15 min
    retry: 2,
  });
};

// Used by Football.tsx overview page - counts matches per league
export const useLeagueMatchCounts = (leagueNames: string[], daysAhead: number = 7) => {
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
      for (const r of results) {
        if (r.status === 'fulfilled') counts[r.value.name] = r.value.count;
      }
      return counts;
    },
    staleTime: 15 * 60 * 1000,
    gcTime:    60 * 60 * 1000,
    retry: 1,
  });
};
