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

      // Direct table query with case-insensitive matching for flexibility
      const { data, error } = await supabase
        .from('matches')
        .select('id, match_id, league_id, sport_key, sport_title, league_name, home_team, away_team, commence_time, home_odds, draw_odds, away_odds, status')
        .ilike('league_name', `%${leagueName}%`)
        .gte('commence_time', now.toISOString())
        .lte('commence_time', futureDate.toISOString())
        .order('commence_time', { ascending: true })
        .limit(50);

      if (error) {
        console.error('useLeagueMatches error:', error);
        return [] as Match[];
      }
      
      return (data ?? []) as Match[];
    },
    staleTime: 60000, // Cache for 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes
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