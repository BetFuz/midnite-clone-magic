import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OddsUpdate {
  matchId: string;
  selectionType: string;
  newOdds: number;
  timestamp: string;
}

export const useRealtimeOdds = (matchIds: string[] = []) => {
  const [oddsUpdates, setOddsUpdates] = useState<OddsUpdate[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (matchIds.length === 0) return;

    const channel = supabase
      .channel('betting-odds-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'betting_trends',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newData = payload.new as any;
            
            if (matchIds.includes(newData.match_id)) {
              const update: OddsUpdate = {
                matchId: newData.match_id,
                selectionType: newData.selection_type,
                newOdds: parseFloat(newData.percentage) || 0,
                timestamp: new Date().toISOString(),
              };

              setOddsUpdates(prev => [...prev.slice(-9), update]);
              
              toast({
                title: "Odds Updated",
                description: `New odds available for ${newData.selection_value}`,
                duration: 3000,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchIds.join(','), toast]);

  return { oddsUpdates };
};
