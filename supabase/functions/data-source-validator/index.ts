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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { league, matchId } = await req.json();
    
    console.log('Validating data source for league:', league, 'match:', matchId);

    // Check if this league requires official data
    const { data: dataSources, error: sourceError } = await supabaseClient
      .from('official_data_sources')
      .select('*')
      .eq('league', league)
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (sourceError) {
      throw sourceError;
    }

    // Find official source if required
    const officialSource = dataSources?.find(ds => ds.is_official);
    
    if (officialSource) {
      console.log('Official data required for', league, '- Provider:', officialSource.provider);
      
      // Block non-official feeds for this match
      return new Response(
        JSON.stringify({
          success: true,
          requiresOfficial: true,
          provider: officialSource.provider,
          league,
          matchId,
          message: `${league} requires official ${officialSource.provider} data`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Allow non-official feeds
    const fallbackSource = dataSources?.[0];
    return new Response(
      JSON.stringify({
        success: true,
        requiresOfficial: false,
        provider: fallbackSource?.provider || 'betradar',
        league,
        matchId,
        message: 'Non-official data sources allowed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Data source validation error:', error);
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
