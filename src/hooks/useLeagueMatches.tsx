import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
    queryFn: async () => {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('league_name', leagueName)
        .gte('commence_time', now.toISOString())
        .lte('commence_time', futureDate.toISOString())
        .order('commence_time', { ascending: true });

      if (error) {
        console.error('useLeagueMatches error', { leagueName, daysAhead, now: now.toISOString(), future: futureDate.toISOString(), error });
        throw error;
      }
      console.info('useLeagueMatches result', { leagueName, count: data?.length ?? 0, range: [now.toISOString(), futureDate.toISOString()] });
      return (data ?? []) as Match[];
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useSportMatches = (sportKey: string, daysAhead: number = 7) => {
  return useQuery({
    queryKey: ['sport-matches', sportKey, daysAhead],
    queryFn: async () => {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('sport_key', sportKey)
        .gte('commence_time', now.toISOString())
        .lte('commence_time', futureDate.toISOString())
        .order('commence_time', { ascending: true });

      if (error) {
        console.error('useSportMatches error', { sportKey, daysAhead, now: now.toISOString(), future: futureDate.toISOString(), error });
        throw error;
      }
      console.info('useSportMatches result', { sportKey, count: data?.length ?? 0, range: [now.toISOString(), futureDate.toISOString()] });
      return (data ?? []) as Match[];
    },
    refetchInterval: 60000,
  });
};