import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { suspend } = await req.json();

    if (suspend === true) {
      // Suspend all live events by updating their status
      const { data, error } = await supabaseAdmin
        .from('matches')
        .update({ status: 'suspended' })
        .eq('status', 'live')
        .select();

      if (error) throw error;

      const eventsAffected = data?.length || 0;
      console.log(`🚫 SUSPENDED ${eventsAffected} live events due to odds feed failure`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'All live events suspended',
          eventsAffected,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      // Resume live events
      const { data, error } = await supabaseAdmin
        .from('matches')
        .update({ status: 'live' })
        .eq('status', 'suspended')
        .select();

      if (error) throw error;

      const eventsAffected = data?.length || 0;
      console.log(`✅ RESUMED ${eventsAffected} live events after odds feed recovery`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'All suspended events resumed',
          eventsAffected,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error('Suspend/resume error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});