import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  id: string;
  userId: string;
  weekStart: string;
  totalPoints: number;
  totalBets: number;
  totalWins: number;
  winStreak: number;
  bonusPoints: number;
  rank: number;
  rewardTier: string | null;
  userEmail?: string;
  userFullName?: string;
}

export const useLeaderboard = (weekStart?: string) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Get current week start if not provided
        const currentWeekStart = weekStart || getCurrentWeekStart();

        const { data, error } = await supabase
          .from("leaderboard_entries")
          .select(`
            *,
            profiles:user_id (email, full_name)
          `)
          .eq("week_start", currentWeekStart)
          .order("rank", { ascending: true })
          .limit(100);

        if (error) {
          console.error("Error fetching leaderboard:", error);
          return;
        }

        if (data) {
          setLeaderboard(
            data.map((entry: any) => ({
              id: entry.id,
              userId: entry.user_id,
              weekStart: entry.week_start,
              totalPoints: entry.total_points,
              totalBets: entry.total_bets,
              totalWins: entry.total_wins,
              winStreak: entry.win_streak,
              bonusPoints: entry.bonus_points,
              rank: entry.rank,
              rewardTier: entry.reward_tier,
              userEmail: entry.profiles?.email,
              userFullName: entry.profiles?.full_name,
            }))
          );
        }
      } catch (error) {
        console.error("Error in useLeaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("leaderboard_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaderboard_entries",
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [weekStart]);

  return { leaderboard, isLoading };
};

// Helper function to get current week start (Monday)
const getCurrentWeekStart = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  return monday.toISOString().split("T")[0];
};
