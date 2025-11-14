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

      console.info('useLeagueMatches:start', { leagueName, daysAhead, range: [now.toISOString(), futureDate.toISOString()] });

      // Attempt 1: normalized view via league_id
      const { data: leagueRow, error: leagueErr } = await supabase
        .from('leagues')
        .select('id')
        .eq('name', leagueName)
        .maybeSingle();
      if (leagueErr) {
        console.warn('useLeagueMatches: leagues lookup error (non-fatal)', leagueErr);
      }
      if (leagueRow?.id) {
        const { data: viewData, error: viewErr } = await supabase
          .from('public_matches')
          .select('*')
          .eq('league_id', leagueRow.id)
          .gte('kickoff_at', now.toISOString())
          .lte('kickoff_at', futureDate.toISOString())
          .order('kickoff_at', { ascending: true });
        if (viewErr) {
          console.warn('useLeagueMatches: view query error (will fallback)', viewErr);
        } else if (viewData && viewData.length > 0) {
          const mappedFromView: Match[] = viewData.map((m: any) => ({
            id: m.id,
            match_id: m.match_id,
            league_id: m.league_id,
            league_name: m.league_name,
            sport_key: m.sport_key,
            sport_title: m.sport_title,
            home_team: m.home_team,
            away_team: m.away_team,
            commence_time: m.kickoff_at,
            home_odds: m.home_odds,
            draw_odds: m.draw_odds,
            away_odds: m.away_odds,
            status: m.status,
          }));
          console.info('useLeagueMatches: view result', { leagueId: leagueRow.id, count: mappedFromView.length });
          return mappedFromView;
        }
      }

      // Attempt 2: direct table query by league_name
      const { data: tableData, error: tableErr } = await supabase
        .from('matches')
        .select('*')
        .eq('league_name', leagueName)
        .gte('commence_time', now.toISOString())
        .lte('commence_time', futureDate.toISOString())
        .order('commence_time', { ascending: true });
      if (tableErr) {
        console.warn('useLeagueMatches: table query error (will fallback)', tableErr);
      } else if (tableData && tableData.length > 0) {
        console.info('useLeagueMatches: table result', { leagueName, count: tableData.length });
        return tableData as Match[];
      }

      // Fallback: call public-matches edge function (supports both league_name and days)
      console.info('useLeagueMatches: fallback to function', { leagueName, daysAhead });
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
      console.info('useLeagueMatches: function result', { leagueName, count: mapped.length });
      return mapped;
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