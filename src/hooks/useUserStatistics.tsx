import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "./useUserProfile";

export interface UserStatistics {
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  totalPending: number;
  totalStaked: number;
  totalReturns: number;
  profitLoss: number;
  winRate: number;
  roi: number;
  favoriteSport: string | null;
  biggestWin: number;
  biggestLoss: number;
  currentStreak: number;
  bestStreak: number;
}

export const useUserStatistics = () => {
  const { user } = useUserProfile();
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchStatistics = async () => {
      try {
        const { data, error } = await supabase
          .from("user_statistics")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching user statistics:", error);
          return;
        }

        if (data) {
          setStatistics({
            totalBets: data.total_bets || 0,
            totalWins: data.total_wins || 0,
            totalLosses: data.total_losses || 0,
            totalPending: data.total_pending || 0,
            totalStaked: Number(data.total_staked || 0),
            totalReturns: Number(data.total_returns || 0),
            profitLoss: Number(data.profit_loss || 0),
            winRate: Number(data.win_rate || 0),
            roi: Number(data.roi || 0),
            favoriteSport: data.favorite_sport,
            biggestWin: Number(data.biggest_win || 0),
            biggestLoss: Number(data.biggest_loss || 0),
            currentStreak: data.current_streak || 0,
            bestStreak: data.best_streak || 0,
          });
        } else {
          // Initialize empty statistics
          setStatistics({
            totalBets: 0,
            totalWins: 0,
            totalLosses: 0,
            totalPending: 0,
            totalStaked: 0,
            totalReturns: 0,
            profitLoss: 0,
            winRate: 0,
            roi: 0,
            favoriteSport: null,
            biggestWin: 0,
            biggestLoss: 0,
            currentStreak: 0,
            bestStreak: 0,
          });
        }
      } catch (error) {
        console.error("Error in useUserStatistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("user_statistics_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_statistics",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchStatistics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { statistics, isLoading };
};
