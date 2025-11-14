import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeagueMatchSchedule } from "./LeagueMatchSchedule";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "@/integrations/supabase/types";

type SportsLeague = Database['public']['Tables']['sports_leagues']['Row'];

export const AllLeaguesSchedule = () => {
  const [leagues, setLeagues] = useState<SportsLeague[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const { data, error } = await supabase
        .from('sports_leagues')
        .select('*')
        .order('sport_title');

      if (error) throw error;
      setLeagues(data || []);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (leagues.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No leagues available</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={leagues[0]?.sport_key} className="w-full">
      <TabsList className="w-full flex-wrap h-auto">
        {leagues.map((league) => (
          <TabsTrigger key={league.sport_key} value={league.sport_key}>
            {league.sport_title}
          </TabsTrigger>
        ))}
      </TabsList>

      {leagues.map((league) => {
        const leaguesList = Array.isArray(league.leagues) 
          ? league.leagues 
          : [];
        
        return (
          <TabsContent key={league.sport_key} value={league.sport_key}>
            <div className="space-y-6">
              {leaguesList.length > 0 ? (
                leaguesList.map((leagueInfo: any, idx: number) => (
                  <div key={`${league.sport_key}-${idx}`}>
                    <h3 className="text-xl font-bold mb-4">{leagueInfo.name || league.sport_title}</h3>
                    <LeagueMatchSchedule 
                      leagueName={leagueInfo.name || league.sport_title}
                      daysAhead={14}
                    />
                  </div>
                ))
              ) : (
                <LeagueMatchSchedule 
                  leagueName={league.sport_title}
                  daysAhead={14}
                />
              )}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};
