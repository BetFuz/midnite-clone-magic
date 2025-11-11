import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "./useUserProfile";

export interface Achievement {
  id: string;
  userId: string;
  achievementType: string;
  achievementName: string;
  achievementDescription: string | null;
  pointsEarned: number;
  unlockedAt: string;
}

export const useAchievements = () => {
  const { user } = useUserProfile();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchAchievements = async () => {
      try {
        const { data, error } = await supabase
          .from("user_achievements")
          .select("*")
          .eq("user_id", user.id)
          .order("unlocked_at", { ascending: false });

        if (error) {
          console.error("Error fetching achievements:", error);
          return;
        }

        if (data) {
          setAchievements(
            data.map((achievement) => ({
              id: achievement.id,
              userId: achievement.user_id,
              achievementType: achievement.achievement_type,
              achievementName: achievement.achievement_name,
              achievementDescription: achievement.achievement_description,
              pointsEarned: achievement.points_earned,
              unlockedAt: achievement.unlocked_at,
            }))
          );
        }
      } catch (error) {
        console.error("Error in useAchievements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("achievements_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_achievements",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchAchievements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { achievements, isLoading };
};
