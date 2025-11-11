import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LiveStream {
  id: string;
  match_id: string;
  sport: string;
  home_team: string;
  away_team: string;
  league: string;
  status: string;
  stream_url: string | null;
  quality: string;
  viewer_count: number;
  active_bets_count: number;
  scheduled_start: string;
}

export const useLiveStreams = () => {
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [upcomingStreams, setUpcomingStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStreams = async () => {
    try {
      // Fetch live streams
      const { data: liveData, error: liveError } = await supabase
        .from("live_streams")
        .select("*")
        .eq("status", "live")
        .order("viewer_count", { ascending: false });

      if (liveError) throw liveError;
      setLiveStreams(liveData || []);

      // Fetch upcoming streams
      const { data: upcomingData, error: upcomingError } = await supabase
        .from("live_streams")
        .select("*")
        .eq("status", "upcoming")
        .order("scheduled_start", { ascending: true });

      if (upcomingError) throw upcomingError;
      setUpcomingStreams(upcomingData || []);

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading streams:", error);
      toast.error("Failed to load live streams");
      setIsLoading(false);
    }
  };

  const incrementViewerCount = async (streamId: string) => {
    try {
      const stream = liveStreams.find(s => s.id === streamId);
      if (!stream) return;

      const { error } = await supabase
        .from("live_streams")
        .update({ viewer_count: stream.viewer_count + 1 })
        .eq("id", streamId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating viewer count:", error);
    }
  };

  useEffect(() => {
    loadStreams();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("live_streams_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_streams" },
        () => loadStreams()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    liveStreams,
    upcomingStreams,
    isLoading,
    incrementViewerCount,
    refreshStreams: loadStreams
  };
};
