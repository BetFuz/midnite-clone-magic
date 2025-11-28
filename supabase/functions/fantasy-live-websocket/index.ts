import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upgrade',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const upgrade = req.headers.get('upgrade') || '';
  
  if (upgrade.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket', { 
      status: 426,
      headers: corsHeaders 
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let lineupId: string | null = null;
  let subscriptionChannel: any = null;

  socket.onopen = () => {
    console.log('WebSocket connected');
    socket.send(JSON.stringify({ 
      type: 'connected', 
      message: 'Fantasy Live Scoring WebSocket Ready' 
    }));
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'subscribe' && data.lineupId) {
        lineupId = data.lineupId;
        
        // Subscribe to real-time updates for this lineup
        subscriptionChannel = supabaseClient
          .channel(`fantasy_live:${lineupId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'fantasy_live_scores',
              filter: `lineup_id=eq.${lineupId}`
            },
            (payload) => {
              socket.send(JSON.stringify({
                type: 'score_update',
                data: payload.new
              }));
            }
          )
          .subscribe();

        // Send initial lineup scores
        const { data: scores, error } = await supabaseClient
          .from('fantasy_live_scores')
          .select(`
            *,
            fantasy_players!inner(
              full_name,
              position,
              team,
              sport
            )
          `)
          .eq('lineup_id', lineupId);

        if (error) throw error;

        socket.send(JSON.stringify({
          type: 'initial_scores',
          data: scores
        }));
      }

      if (data.type === 'unsubscribe') {
        if (subscriptionChannel) {
          await supabaseClient.removeChannel(subscriptionChannel);
          subscriptionChannel = null;
        }
        lineupId = null;
      }

    } catch (error) {
      console.error('WebSocket message error:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: (error as Error).message
      }));
    }
  };

  socket.onclose = async () => {
    console.log('WebSocket disconnected');
    if (subscriptionChannel) {
      await supabaseClient.removeChannel(subscriptionChannel);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return response;
});
