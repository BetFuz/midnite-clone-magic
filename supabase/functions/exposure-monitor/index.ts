import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, matchId, marketType, selectionValue } = await req.json();

    if (action === 'calculate_exposure') {
      // Get all active bets for this market selection
      const { data: bets } = await supabase
        .from('bet_selections')
        .select(`
          odds,
          bet_slip:bet_slips!inner(
            total_stake,
            status,
            user_id
          )
        `)
        .eq('match_id', matchId)
        .eq('selection_type', marketType)
        .eq('selection_value', selectionValue)
        .eq('bet_slip.status', 'pending');

      let totalLiability = 0;
      let totalStakes = 0;
      let betCount = 0;

      bets?.forEach((bet: any) => {
        const stake = bet.bet_slip.total_stake;
        const potentialPayout = stake * bet.odds;
        totalLiability += (potentialPayout - stake); // Platform's risk
        totalStakes += stake;
        betCount++;
      });

      // Upsert exposure record
      const { data: exposure, error } = await supabase
        .from('market_exposure')
        .upsert({
          match_id: matchId,
          market_type: marketType,
          selection_value: selectionValue,
          total_liability: totalLiability,
          total_stakes: totalStakes,
          bet_count: betCount,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'match_id,market_type,selection_value'
        })
        .select()
        .single();

      if (error) throw error;

      // Check if liability exceeds threshold
      if (totalLiability > exposure.max_liability_threshold && !exposure.is_suspended) {
        // Auto-suspend market
        await supabase
          .from('market_exposure')
          .update({
            is_suspended: true,
            suspended_at: new Date().toISOString(),
            suspended_by: null // System auto-suspend
          })
          .eq('id', exposure.id);

        // Alert traders
        console.warn(`⚠️ MARKET AUTO-SUSPENDED: ${matchId} - ${marketType} - ${selectionValue}`);
        console.warn(`Liability: ₦${totalLiability.toLocaleString()} exceeds threshold ₦${exposure.max_liability_threshold.toLocaleString()}`);

        return new Response(
          JSON.stringify({ 
            exposure,
            suspended: true,
            message: 'Market auto-suspended due to liability threshold breach'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ exposure, suspended: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_dashboard') {
      // Get all active exposures
      const { data: exposures } = await supabase
        .from('market_exposure')
        .select('*')
        .order('total_liability', { ascending: false })
        .limit(100);

      // Get suspended markets
      const { data: suspended } = await supabase
        .from('market_exposure')
        .select('*')
        .eq('is_suspended', true);

      // Calculate total platform liability
      const totalLiability = exposures?.reduce((sum, exp) => sum + exp.total_liability, 0) || 0;

      return new Response(
        JSON.stringify({ 
          exposures,
          suspended,
          totalLiability,
          message: 'Exposure dashboard data retrieved'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'manual_suspend') {
      const { exposureId, traderId } = await req.json();

      const { data: exposure, error } = await supabase
        .from('market_exposure')
        .update({
          is_suspended: true,
          suspended_at: new Date().toISOString(),
          suspended_by: traderId
        })
        .eq('id', exposureId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ exposure, message: 'Market manually suspended' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'manual_resume') {
      const { exposureId } = await req.json();

      const { data: exposure, error } = await supabase
        .from('market_exposure')
        .update({
          is_suspended: false,
          suspended_at: null,
          suspended_by: null
        })
        .eq('id', exposureId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ exposure, message: 'Market resumed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error: any) {
    console.error('Error in exposure-monitor:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
