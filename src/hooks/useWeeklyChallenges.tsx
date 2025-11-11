import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "./useUserProfile";

export interface WeeklyChallenge {
  id: string;
  weekStart: string;
  challengeType: string;
  challengeName: string;
  challengeDescription: string | null;
  targetValue: number;
  rewardPoints: number;
  isActive: boolean;
  userProgress?: number;
  isCompleted?: boolean;
}

export const useWeeklyChallenges = () => {
  const { user } = useUserProfile();
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const { data: challengesData, error: challengesError } = await supabase
          .from("weekly_challenges")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (challengesError) {
          console.error("Error fetching challenges:", challengesError);
          return;
        }

        if (challengesData && user) {
          // Fetch user progress for each challenge
          const { data: progressData, error: progressError } = await supabase
            .from("user_challenge_progress")
            .select("*")
            .eq("user_id", user.id);

          if (progressError) {
            console.error("Error fetching progress:", progressError);
          }

          const progressMap = new Map(
            progressData?.map((p) => [p.challenge_id, p]) || []
          );

          setChallenges(
            challengesData.map((challenge) => {
              const progress = progressMap.get(challenge.id);
              return {
                id: challenge.id,
                weekStart: challenge.week_start,
                challengeType: challenge.challenge_type,
                challengeName: challenge.challenge_name,
                challengeDescription: challenge.challenge_description,
                targetValue: challenge.target_value,
                rewardPoints: challenge.reward_points,
                isActive: challenge.is_active,
                userProgress: progress?.current_progress || 0,
                isCompleted: progress?.is_completed || false,
              };
            })
          );
        } else if (challengesData) {
          setChallenges(
            challengesData.map((challenge) => ({
              id: challenge.id,
              weekStart: challenge.week_start,
              challengeType: challenge.challenge_type,
              challengeName: challenge.challenge_name,
              challengeDescription: challenge.challenge_description,
              targetValue: challenge.target_value,
              rewardPoints: challenge.reward_points,
              isActive: challenge.is_active,
              userProgress: 0,
              isCompleted: false,
            }))
          );
        }
      } catch (error) {
        console.error("Error in useWeeklyChallenges:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("challenges_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "weekly_challenges",
        },
        () => {
          fetchChallenges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { challenges, isLoading };
};
