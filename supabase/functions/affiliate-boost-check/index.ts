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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Check if there's an active boost period
    const now = new Date().toISOString();
    const { data: activeBoost, error: boostError } = await supabaseClient
      .from('affiliate_boost_periods')
      .select('*')
      .eq('is_active', true)
      .lte('start_time', now)
      .gte('end_time', now)
      .maybeSingle();

    if (boostError) throw boostError;

    return new Response(
      JSON.stringify({
        hasActiveBoost: !!activeBoost,
        boostDetails: activeBoost || null,
        multiplier: activeBoost?.commission_multiplier || 1.0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error checking affiliate boost:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});