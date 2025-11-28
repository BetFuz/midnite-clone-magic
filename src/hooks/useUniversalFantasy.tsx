import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LiveScore {
  id: string;
  player_id: string;
  lineup_id: string;
  live_points: number;
  stats: Record<string, any>;
  last_updated: string;
  fantasy_players?: {
    full_name: string;
    position: string;
    team: string;
    sport: string;
  };
}

export const useUniversalFantasy = (lineupId?: string) => {
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!lineupId) return;

    // Get Supabase project details
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const projectId = supabaseUrl.replace('https://', '').split('.')[0];
    
    // Connect to WebSocket
    const wsUrl = `wss://${projectId}.supabase.co/functions/v1/fantasy-live-websocket`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to fantasy live scoring');
      setIsConnected(true);
      ws.send(JSON.stringify({ 
        type: 'subscribe', 
        lineupId 
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'initial_scores') {
        setLiveScores(message.data);
        const total = message.data.reduce((sum: number, score: LiveScore) => 
          sum + (score.live_points || 0), 0
        );
        setTotalPoints(total);
      }
      
      if (message.type === 'score_update') {
        setLiveScores(prev => {
          const updated = prev.map(score => 
            score.player_id === message.data.player_id 
              ? { ...score, ...message.data }
              : score
          );
          const total = updated.reduce((sum, score) => sum + (score.live_points || 0), 0);
          setTotalPoints(total);
          return updated;
        });
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({ type: 'unsubscribe' }));
        wsRef.current.close();
      }
    };
  }, [lineupId]);

  const calculateScore = async (lineupId: string, gameweekNumber: number, stats: Record<string, any>) => {
    const { data, error } = await supabase.functions.invoke('universal-fantasy-scoring', {
      body: { lineupId, gameweekNumber, stats }
    });

    if (error) throw error;
    return data;
  };

  return {
    liveScores,
    totalPoints,
    isConnected,
    calculateScore
  };
};
