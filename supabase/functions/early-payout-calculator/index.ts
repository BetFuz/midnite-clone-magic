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

    const { action, betSlipId, userId } = await req.json();

    if (action === 'calculate_offer') {
      // Get bet slip and selections
      const { data: betSlip } = await supabase
        .from('bet_slips')
        .select(`
          *,
          selections:bet_selections(*)
        `)
        .eq('id', betSlipId)
        .single();

      if (!betSlip) {
        return new Response(
          JSON.stringify({ error: 'Bet slip not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      // Count settled vs remaining legs
      const settledLegs = betSlip.selections.filter((sel: any) => 
        sel.status === 'won' || sel.status === 'lost'
      );
      const remainingLegs = betSlip.selections.filter((sel: any) => 
        sel.status === 'pending'
      );

      // Can only offer early payout if some legs are won and some are pending
      const wonLegs = settledLegs.filter((sel: any) => sel.status === 'won');
      if (wonLegs.length === 0 || remainingLegs.length === 0) {
        return new Response(
          JSON.stringify({ 
            eligible: false,
            message: 'Early payout not available for this bet'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Monte Carlo simulation to calculate probability of remaining legs winning
      const probability = await monteCarloSimulation(remainingLegs);

      // Calculate early payout amount (conservative pricing)
      // Early payout = current_value * probability * discount_factor
      const currentValue = betSlip.potential_win;
      const discountFactor = 0.85; // 15% house margin for early payout
      const earlyPayoutAmount = currentValue * probability * discountFactor;

      // Create offer (expires in 5 minutes)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      const { data: offer, error } = await supabase
        .from('early_payouts')
        .insert({
          bet_slip_id: betSlipId,
          user_id: userId,
          original_potential_win: betSlip.potential_win,
          early_payout_amount: earlyPayoutAmount,
          settled_legs: settledLegs.length,
          remaining_legs: remainingLegs.length,
          monte_carlo_probability: probability,
          offer_expires_at: expiresAt,
          status: 'offered'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          eligible: true,
          offer,
          message: 'Early payout offer calculated'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'accept_offer') {
      const { offerId } = await req.json();

      const { data: offer } = await supabase
        .from('early_payouts')
        .select('*')
        .eq('id', offerId)
        .single();

      if (!offer || offer.status !== 'offered') {
        return new Response(
          JSON.stringify({ error: 'Offer not available' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Check if offer has expired
      if (new Date(offer.offer_expires_at) < new Date()) {
        await supabase
          .from('early_payouts')
          .update({ status: 'expired' })
          .eq('id', offerId);

        return new Response(
          JSON.stringify({ error: 'Offer has expired' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Update offer status
      await supabase
        .from('early_payouts')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', offerId);

      // Credit user balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', offer.user_id)
        .single();

      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ 
          balance: (profile?.balance || 0) + offer.early_payout_amount
        })
        .eq('id', offer.user_id);

      if (balanceError) throw balanceError;

      // Settle bet slip as "cashed out"
      await supabase
        .from('bet_slips')
        .update({ 
          status: 'cashed_out',
          settled_at: new Date().toISOString()
        })
        .eq('id', offer.bet_slip_id);

      return new Response(
        JSON.stringify({ 
          offer,
          message: 'Early payout accepted and credited'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error: any) {
    console.error('Error in early-payout-calculator:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function monteCarloSimulation(remainingLegs: any[]): Promise<number> {
  // Run Monte Carlo simulation to estimate probability of all remaining legs winning
  const numSimulations = 10000;
  let wins = 0;

  for (let i = 0; i < numSimulations; i++) {
    let allWin = true;
    
    for (const leg of remainingLegs) {
      // Convert odds to implied probability
      const impliedProbability = 1 / leg.odds;
      
      // Add slight adjustment for real-world accuracy (bookmaker margin)
      const adjustedProbability = impliedProbability * 0.95;
      
      // Random outcome
      const random = Math.random();
      if (random > adjustedProbability) {
        allWin = false;
        break;
      }
    }
    
    if (allWin) wins++;
  }

  return wins / numSimulations;
}
