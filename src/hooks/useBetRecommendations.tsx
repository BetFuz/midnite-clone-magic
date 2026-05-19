import { useState } from "react";
import { useAuthStore } from '@/store/authStore';
import { toast } from "@/hooks/use-toast";

export interface BetRecommendation {
  title: string;
  sport: string;
  league: string;
  matchup: string;
  suggestion: string;
  odds: number;
  confidence: number;
  reasoning: string;
}

export const useBetRecommendations = () => {
  const [recommendations, setRecommendations] = useState<BetRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      // AI recommendations unavailable
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recommendations,
    isLoading,
    fetchRecommendations,
  };
};
