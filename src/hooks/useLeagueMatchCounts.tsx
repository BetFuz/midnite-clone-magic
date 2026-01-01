import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LeagueCount {
  league_name: string;
  count: number;
}

export const useLeagueMatchCounts = (leagueNames: string[], daysAhead: number = 14) => {
  return useQuery({
    queryKey: ['league-match-counts', leagueNames, daysAhead],
    queryFn: async () => {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      // Get counts for all leagues in a single query
      const { data, error } = await supabase
        .from('matches')
        .select('league_name')
        .gte('commence_time', now.toISOString())
        .lte('commence_time', futureDate.toISOString());

      if (error) {
        console.error('useLeagueMatchCounts error:', error);
        return {} as Record<string, number>;
      }

      // Count matches per league with case-insensitive matching
      const counts: Record<string, number> = {};
      for (const name of leagueNames) {
        const lowerName = name.toLowerCase();
        counts[name] = (data ?? []).filter(
          m => m.league_name?.toLowerCase().includes(lowerName)
        ).length;
      }
      
      return counts;
    },
    staleTime: 60000,
    gcTime: 300000,
  });
};
