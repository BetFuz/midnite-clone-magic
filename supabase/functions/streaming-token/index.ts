import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { matchId } = await req.json();
    
    console.log('Generating streaming token for user:', user.id, 'match:', matchId);

    // Generate Sportradar streaming token (mock for now)
    const streamToken = `sportradar_${user.id}_${matchId}_${Date.now()}`;
    const embedUrl = `https://widgets.sportradar.com/live-stream?token=${streamToken}`;

    // Create streaming session
    const { data: session, error: sessionError } = await supabaseClient
      .from('streaming_sessions')
      .insert({
        user_id: user.id,
        match_id: matchId,
        stream_provider: 'sportradar',
        session_token: streamToken,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
    }

    console.log('Streaming token generated:', streamToken);

    return new Response(
      JSON.stringify({
        success: true,
        token: streamToken,
        embedUrl,
        sessionId: session?.id,
        matchId,
        provider: 'sportradar',
        expiresIn: 14400 // 4 hours
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Streaming token error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
