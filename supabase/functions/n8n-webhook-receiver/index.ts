import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-n8n-source',
};

interface N8NEvent {
  event_type: 'odds_update' | 'bet_settlement' | 'promotion_trigger' | 'system_alert' | 'user_notification' | 'balance_update' | 'game_state_change';
  data: any;
  target_user_id?: string;
  source_workflow?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const body: N8NEvent = await req.json();
    const sourceWorkflow = req.headers.get('x-n8n-source') || body.source_workflow || 'unknown';

    console.log('Received n8n event:', body.event_type, 'from workflow:', sourceWorkflow);

    // Log the event
    const { error: logError } = await supabaseClient
      .from('n8n_events_log')
      .insert({
        event_type: body.event_type,
        event_data: body.data,
        source_workflow: sourceWorkflow,
        processed: false
      });

    if (logError) {
      console.error('Error logging event:', logError);
    }

    // Process event based on type
    switch (body.event_type) {
      case 'odds_update':
        await handleOddsUpdate(supabaseClient, body.data);
        break;
      
      case 'bet_settlement':
        await handleBetSettlement(supabaseClient, body.data);
        break;
      
      case 'promotion_trigger':
        await handlePromotionTrigger(supabaseClient, body.data);
        break;
      
      case 'system_alert':
        await handleSystemAlert(supabaseClient, body.data);
        break;
      
      case 'user_notification':
        await handleUserNotification(supabaseClient, body.data, body.target_user_id);
        break;
      
      case 'balance_update':
        await handleBalanceUpdate(supabaseClient, body.data, body.target_user_id);
        break;
      
      case 'game_state_change':
        await handleGameStateChange(supabaseClient, body.data);
        break;
      
      default:
        console.warn('Unknown event type:', body.event_type);
    }

    // Mark event as processed
    await supabaseClient
      .from('n8n_events_log')
      .update({ processed: true })
      .eq('event_type', body.event_type)
      .eq('source_workflow', sourceWorkflow);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Event ${body.event_type} processed successfully` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in n8n-webhook-receiver:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleOddsUpdate(client: any, data: any) {
  console.log('Processing odds update:', data);
  
  // Upsert odds cache
  const { error } = await client
    .from('realtime_odds_cache')
    .upsert({
      match_id: data.match_id,
      market: data.market,
      odds: data.odds,
      last_updated: new Date().toISOString()
    }, {
      onConflict: 'match_id,market'
    });

  if (error) {
    console.error('Error updating odds cache:', error);
  }

  // Broadcast to realtime channel
  const channel = client.channel('odds:updates');
  await channel.send({
    type: 'broadcast',
    event: 'odds_changed',
    payload: data
  });
  
  console.log('Odds update broadcasted successfully');
}

async function handleBetSettlement(client: any, data: any) {
  console.log('Processing bet settlement:', data);
  
  // Broadcast to realtime channel
  const channel = client.channel('bets:settlements');
  await channel.send({
    type: 'broadcast',
    event: 'bet_settled',
    payload: data
  });
  
  console.log('Bet settlement broadcasted successfully');
}

async function handlePromotionTrigger(client: any, data: any) {
  console.log('Processing promotion trigger:', data);
  
  // Broadcast to realtime channel
  const channel = client.channel('system:alerts');
  await channel.send({
    type: 'broadcast',
    event: 'promotion_available',
    payload: data
  });
  
  console.log('Promotion trigger broadcasted successfully');
}

async function handleSystemAlert(client: any, data: any) {
  console.log('Processing system alert:', data);
  
  // Broadcast to realtime channel
  const channel = client.channel('system:alerts');
  await channel.send({
    type: 'broadcast',
    event: 'system_announcement',
    payload: data
  });
  
  console.log('System alert broadcasted successfully');
}

async function handleUserNotification(client: any, data: any, userId?: string) {
  console.log('Processing user notification:', data, 'for user:', userId);
  
  if (userId) {
    // Store notification in database
    const { error } = await client
      .from('pending_notifications')
      .insert({
        user_id: userId,
        notification_type: data.type || 'general',
        title: data.title,
        message: data.message,
        data: data.extra || {}
      });

    if (error) {
      console.error('Error storing notification:', error);
    }

    // Broadcast to user-specific channel
    const channel = client.channel(`user:${userId}`);
    await channel.send({
      type: 'broadcast',
      event: 'notification',
      payload: data
    });
    
    console.log('User notification broadcasted successfully');
  }
}

async function handleBalanceUpdate(client: any, data: any, userId?: string) {
  console.log('Processing balance update:', data, 'for user:', userId);
  
  if (userId) {
    // Broadcast to user-specific channel
    const channel = client.channel(`user:${userId}`);
    await channel.send({
      type: 'broadcast',
      event: 'balance_changed',
      payload: data
    });
    
    console.log('Balance update broadcasted successfully');
  }
}

async function handleGameStateChange(client: any, data: any) {
  console.log('Processing game state change:', data);
  
  // Broadcast to realtime channel
  const channel = client.channel('game:state');
  await channel.send({
    type: 'broadcast',
    event: 'state_updated',
    payload: data
  });
  
  console.log('Game state change broadcasted successfully');
}