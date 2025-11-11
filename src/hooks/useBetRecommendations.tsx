import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      const { data, error } = await supabase.functions.invoke("bet-recommendations");

      if (error) {
        console.error("Error fetching recommendations:", error);
        
        if (error.message?.includes("429")) {
          toast({
            variant: "destructive",
            title: "Rate Limit Exceeded",
            description: "Too many requests. Please try again later.",
          });
        } else if (error.message?.includes("402")) {
          toast({
            variant: "destructive",
            title: "Payment Required",
            description: "Please add credits to continue using AI features.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch recommendations. Please try again.",
          });
        }
        return;
      }

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        toast({
          title: "Recommendations Updated",
          description: `${data.recommendations.length} personalized suggestions ready for you.`,
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
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
