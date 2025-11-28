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

    const { action, raceId, raceType, poolType, raceStartTime } = await req.json();

    if (action === 'create_pool') {
      const { data: pool, error } = await supabase
        .from('parimutuel_pools')
        .insert({
          race_id: raceId,
          race_type: raceType,
          pool_type: poolType,
          race_start_time: raceStartTime,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ pool, message: 'Parimutuel pool created' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'place_bet') {
      const { poolId, userId, stakeAmount, selections } = await req.json();

      // Get pool
      const { data: pool } = await supabase
        .from('parimutuel_pools')
        .select('*')
        .eq('id', poolId)
        .single();

      if (!pool || pool.status !== 'open') {
        return new Response(
          JSON.stringify({ error: 'Pool is not accepting bets' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Check user balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();

      if (!profile || profile.balance < stakeAmount) {
        return new Response(
          JSON.stringify({ error: 'Insufficient balance' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Deduct stake from user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ 
          balance: profile.balance - stakeAmount
        })
        .eq('id', userId);

      if (balanceError) throw balanceError;

      // Calculate units (standardized bet size for dividend calculation)
      const units = stakeAmount / 100; // ₦100 per unit

      // Place bet
      const { data: bet, error: betError } = await supabase
        .from('parimutuel_bets')
        .insert({
          pool_id: poolId,
          user_id: userId,
          stake_amount: stakeAmount,
          selections: selections,
          units: units,
          status: 'active'
        })
        .select()
        .single();

      if (betError) throw betError;

      // Update pool total
      const { data: currentPool } = await supabase
        .from('parimutuel_pools')
        .select('total_pool')
        .eq('id', poolId)
        .single();

      await supabase
        .from('parimutuel_pools')
        .update({
          total_pool: (currentPool?.total_pool || 0) + stakeAmount
        })
        .eq('id', poolId);

      return new Response(
        JSON.stringify({ bet, message: 'Bet placed in parimutuel pool' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'close_pool') {
      const { poolId } = await req.json();

      const { data: pool, error } = await supabase
        .from('parimutuel_pools')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', poolId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ pool, message: 'Pool closed to new bets' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'settle_pool') {
      const { poolId, winningSelections } = await req.json();

      // Get pool
      const { data: pool } = await supabase
        .from('parimutuel_pools')
        .select('*')
        .eq('id', poolId)
        .single();

      if (!pool) {
        return new Response(
          JSON.stringify({ error: 'Pool not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      // Get all winning bets
      const { data: winningBets } = await supabase
        .from('parimutuel_bets')
        .select('*')
        .eq('pool_id', poolId)
        .eq('status', 'active');

      const winners = winningBets?.filter((bet: any) => 
        matchesSelection(bet.selections, winningSelections)
      );

      // Calculate total winning units
      const totalWinningUnits = winners?.reduce((sum, bet) => sum + bet.units, 0) || 1;

      // Calculate net pool (after commission)
      const commission = pool.total_pool * (pool.platform_commission / 100);
      const netPool = pool.total_pool - commission;

      // Calculate dividend per unit
      const dividendPerUnit = netPool / totalWinningUnits;

      // Pay out winners
      for (const bet of winners || []) {
        const payout = bet.units * dividendPerUnit;
        
        await supabase
          .from('parimutuel_bets')
          .update({
            status: 'won',
            potential_dividend: dividendPerUnit,
            actual_payout: payout
          })
          .eq('id', bet.id);

        // Credit user balance
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', bet.user_id)
          .single();

        await supabase
          .from('profiles')
          .update({ 
            balance: (userProfile?.balance || 0) + payout
          })
          .eq('id', bet.user_id);
      }

      // Mark losing bets
      const losingBets = winningBets?.filter((bet: any) => 
        !matchesSelection(bet.selections, winningSelections)
      );

      for (const bet of losingBets || []) {
        await supabase
          .from('parimutuel_bets')
          .update({ status: 'lost' })
          .eq('id', bet.id);
      }

      // Update pool status
      await supabase
        .from('parimutuel_pools')
        .update({
          status: 'settled',
          settled_at: new Date().toISOString(),
          winning_selections: winningSelections
        })
        .eq('id', poolId);

      return new Response(
        JSON.stringify({ 
          winners: winners?.length || 0,
          dividendPerUnit,
          totalPaid: netPool,
          message: 'Pool settled successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error: any) {
    console.error('Error in parimutuel-pool:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function matchesSelection(betSelection: any, winningSelection: any): boolean {
  // Check if bet selection matches winning selection
  // This logic depends on pool type (win, place, exacta, etc.)
  if (Array.isArray(betSelection) && Array.isArray(winningSelection)) {
    return JSON.stringify(betSelection.sort()) === JSON.stringify(winningSelection.sort());
  }
  return betSelection === winningSelection;
}
