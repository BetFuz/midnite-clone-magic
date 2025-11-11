import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VRExperience {
  id: string;
  stadium_name: string;
  match_id: string | null;
  sport: string;
  status: string;
  viewer_count: number;
  thumbnail_url: string | null;
}

interface VRSession {
  id: string;
  experience_id: string;
  user_id: string;
  duration_minutes: number | null;
  started_at: string;
  ended_at: string | null;
}

export const useVRExperiences = () => {
  const [experiences, setExperiences] = useState<VRExperience[]>([]);
  const [mySessions, setMySessions] = useState<VRSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadExperiences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch all VR experiences
      const { data: experiencesData, error: experiencesError } = await supabase
        .from("vr_experiences")
        .select("*")
        .in("status", ["available", "live"])
        .order("viewer_count", { ascending: false });

      if (experiencesError) throw experiencesError;
      setExperiences(experiencesData || []);

      // Fetch user sessions
      if (user) {
        const { data: sessionsData, error: sessionsError } = await supabase
          .from("vr_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })
          .limit(10);

        if (sessionsError) throw sessionsError;
        setMySessions(sessionsData || []);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading VR experiences:", error);
      toast.error("Failed to load VR experiences");
      setIsLoading(false);
    }
  };

  const startSession = async (experienceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to start VR session");
        return null;
      }

      const { data, error } = await supabase
        .from("vr_sessions")
        .insert({
          experience_id: experienceId,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("VR session started!");
      loadExperiences();
      return data;
    } catch (error: any) {
      console.error("Error starting VR session:", error);
      toast.error(error.message || "Failed to start VR session");
      return null;
    }
  };

  const endSession = async (sessionId: string, durationMinutes: number) => {
    try {
      const { error } = await supabase
        .from("vr_sessions")
        .update({
          ended_at: new Date().toISOString(),
          duration_minutes: durationMinutes
        })
        .eq("id", sessionId);

      if (error) throw error;

      toast.success("VR session ended");
      loadExperiences();
    } catch (error: any) {
      console.error("Error ending VR session:", error);
      toast.error(error.message || "Failed to end VR session");
    }
  };

  useEffect(() => {
    loadExperiences();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("vr_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vr_experiences" },
        () => loadExperiences()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    experiences,
    mySessions,
    isLoading,
    startSession,
    endSession,
    refreshExperiences: loadExperiences
  };
};
