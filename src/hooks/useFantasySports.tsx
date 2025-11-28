import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FantasyLeague {
  id: string;
  name: string;
  sport: string;
  season: string;
  entry_fee: number;
  prize_pool: number;
  max_participants: number | null;
  status: string;
  deadline: string;
  participants?: number;
  my_team?: FantasyTeam | null;
}

interface FantasyTeam {
  id: string;
  league_id: string;
  user_id: string;
  team_name: string;
  total_points: number;
  rank: number | null;
}

export const useFantasySports = () => {
  const [leagues, setLeagues] = useState<FantasyLeague[]>([]);
  const [myTeams, setMyTeams] = useState<FantasyTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLeagues = async () => {
    try {
      setIsLoading(true);
      console.log('Loading fantasy leagues...');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User:', user?.id || 'Not logged in');

      // Fetch all leagues in a single query
      const { data: leaguesData, error: leaguesError } = await supabase
        .from("fantasy_leagues")
        .select("*")
        .order("created_at", { ascending: false });

      if (leaguesError) {
        console.error('Error fetching leagues:', leaguesError);
        throw leaguesError;
      }

      // If there are no leagues yet, we can short‑circuit
      if (!leaguesData || leaguesData.length === 0) {
        setLeagues([]);
        setMyTeams([]);
        setIsLoading(false);
        return;
      }

      // Optionally fetch this user's teams only (single query, avoids giant IN list)
      let userTeams: FantasyTeam[] = [];
      if (user) {
        const { data: teamsData, error: teamsError } = await supabase
          .from("fantasy_teams")
          .select("*")
          .eq("user_id", user.id);

        if (teamsError) {
          console.error('Error fetching user fantasy teams:', teamsError);
        } else {
          userTeams = teamsData || [];
        }
      }

      const enrichedLeagues = (leaguesData || []).map((league) => {
        const myTeam = user
          ? userTeams.find((team) => team.league_id === league.id) || null
          : null;

        return {
          ...league,
          participants: undefined,
          my_team: myTeam,
        } as FantasyLeague;
      });

      console.log('Leagues enriched successfully');
      setLeagues(enrichedLeagues);

      if (user) {
        const onlyMyTeams = enrichedLeagues
          .filter((l) => l.my_team)
          .map((l) => l.my_team!) as FantasyTeam[];
        setMyTeams(onlyMyTeams);
        console.log(`User has ${onlyMyTeams.length} teams`);
      } else {
        setMyTeams([]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading fantasy leagues:", error);
      toast.error("Failed to load fantasy leagues");
      setIsLoading(false);
    }
  };

  const joinLeague = async (leagueId: string, teamName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to join a league");
        return;
      }

      const { error } = await supabase.from("fantasy_teams").insert({
        league_id: leagueId,
        user_id: user.id,
        team_name: teamName
      });

      if (error) throw error;

      toast.success(`Successfully joined league with team "${teamName}"!`);
      loadLeagues();
    } catch (error: any) {
      console.error("Error joining league:", error);
      toast.error(error.message || "Failed to join league");
    }
  };

  useEffect(() => {
    loadLeagues();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("fantasy_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fantasy_leagues" },
        () => loadLeagues()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    leagues,
    myTeams,
    isLoading,
    joinLeague,
    refreshLeagues: loadLeagues
  };
};
