import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AIPrediction {
  id: string;
  match_id: string;
  sport: string;
  home_team: string;
  away_team: string;
  prediction_type: string;
  predicted_outcome: string;
  confidence_score: number | null;
  reasoning: string | null;
  created_at: string;
}

export const useAIPredictions = () => {
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setPredictions(data || []);
    } catch (error) {
      console.error("Error loading AI predictions:", error);
      toast.error("Failed to load AI predictions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("ai_predictions_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ai_predictions",
        },
        () => {
          loadPredictions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    predictions,
    isLoading,
    refreshPredictions: loadPredictions,
  };
};
