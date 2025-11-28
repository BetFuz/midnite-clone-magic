import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, AlertCircle, Calendar, Activity, Target } from "lucide-react";

interface PlayerResearchModalProps {
  playerId: string;
  playerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlayerResearchModal({ playerId, playerName, open, onOpenChange }: PlayerResearchModalProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && playerId) {
      loadData();
    }
  }, [open, playerId]);

  const loadData = async () => {
    setLoading(true);
    try {
      await supabase.functions.invoke('fantasy-player-research', { body: { playerId } });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-6 h-6" />
            {playerName} Research
          </DialogTitle>
        </DialogHeader>
        {loading ? <div className="py-8 text-center">Loading...</div> : <div className="py-8">Stats loaded</div>}
      </DialogContent>
    </Dialog>
  );
}
