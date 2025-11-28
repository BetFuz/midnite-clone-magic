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

    const { matchId, selections } = await req.json();
    
    console.log('Pricing bet builder for match:', matchId, 'selections:', selections.length);

    // Calculate base combined odds
    let combinedOdds = 1.0;
    for (const selection of selections) {
      combinedOdds *= selection.odds;
    }

    // Apply correlation factor (SBTech Same-Game-Parlay model simulation)
    // Reduce odds when selections are correlated (e.g., player goals + team win)
    let correlationFactor = 1.0;
    
    // Check for correlation patterns
    const hasPlayerProps = selections.some((s: any) => s.selection_type === 'player_prop');
    const hasMatchResult = selections.some((s: any) => s.selection_type === 'match_result');
    
    if (hasPlayerProps && hasMatchResult) {
      // Player props + match result = moderate correlation
      correlationFactor = 0.85;
    }
    
    if (selections.length >= 3) {
      // Multiple legs = increased correlation
      correlationFactor *= 0.90;
    }
    
    if (selections.length >= 5) {
      // High number of legs = significant correlation
      correlationFactor *= 0.85;
    }

    const adjustedOdds = combinedOdds * correlationFactor;
    const margin = 0.05; // 5% house margin
    const finalOdds = adjustedOdds * (1 - margin);

    console.log('Bet builder pricing:', {
      baseOdds: combinedOdds.toFixed(2),
      correlationFactor: correlationFactor.toFixed(2),
      adjustedOdds: adjustedOdds.toFixed(2),
      finalOdds: finalOdds.toFixed(2)
    });

    return new Response(
      JSON.stringify({
        success: true,
        matchId,
        selectionCount: selections.length,
        baseOdds: parseFloat(combinedOdds.toFixed(2)),
        correlationFactor: parseFloat(correlationFactor.toFixed(2)),
        adjustedOdds: parseFloat(adjustedOdds.toFixed(2)),
        finalOdds: parseFloat(finalOdds.toFixed(2)),
        margin: margin
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Bet builder pricing error:', error);
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
