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

      // Fast path: Try direct table query first (most common case)
      const { data: tableData, error: tableErr } = await supabase
        .from('matches')
        .select('id, match_id, league_id, sport_key, sport_title, league_name, home_team, away_team, commence_time, home_odds, draw_odds, away_odds, status')
        .eq('league_name', leagueName)
        .gte('commence_time', now.toISOString())
        .lte('commence_time', futureDate.toISOString())
        .order('commence_time', { ascending: true })
        .limit(50);

      if (!tableErr && tableData && tableData.length > 0) {
        return tableData as Match[];
      }

      // Fallback: call edge function only if direct query returned nothing
      const { data: fnData, error: fnError } = await supabase.functions.invoke('public-matches', {
        body: { league_name: leagueName, days: daysAhead },
      });
      
      if (fnError) {
        console.error('useLeagueMatches: function error', fnError);
        return [] as Match[];
      }
      
      const mapped: Match[] = (fnData?.matches ?? []).map((m: any) => ({
        id: m.id,
        match_id: m.match_id,
        league_id: m.league_id,
        league_name: m.league,
        sport_key: m.sport_key,
        sport_title: m.sport_key,
        home_team: m.home,
        away_team: m.away,
        commence_time: m.kickoff,
        home_odds: m.odds?.home,
        draw_odds: m.odds?.draw,
        away_odds: m.odds?.away,
        status: m.status ?? 'upcoming',
      }));
      
      return mapped;
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 60000,
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