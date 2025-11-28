import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClientWithAuth } from "../_shared/supabase-client.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization header' }, 401);
    }

    const supabase = createClientWithAuth(authHeader);

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { stake, selections } = await req.json();

    if (!stake || !selections || selections.length === 0) {
      return jsonResponse({ error: 'Invalid bet data' }, 400);
    }

    // Get user's current balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return jsonResponse({ error: 'Profile not found' }, 404);
    }

    // Check if user has sufficient balance
    if (profile.balance < stake) {
      return jsonResponse({ error: 'Insufficient balance' }, 400);
    }

    // Check responsible gaming limits
    const { data: limits } = await supabase
      .from('responsible_gaming_limits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (limits) {
      // Check self-exclusion
      if (limits.self_excluded_until && new Date(limits.self_excluded_until) > new Date()) {
        return jsonResponse({ 
          error: 'Account is self-excluded',
          self_excluded_until: limits.self_excluded_until
        }, 403);
      }

      // Check cooling-off period
      if (limits.cooling_off_until && new Date(limits.cooling_off_until) > new Date()) {
        return jsonResponse({ 
          error: 'Account is in cooling-off period',
          cooling_off_until: limits.cooling_off_until
        }, 403);
      }

      // Get daily usage
      const { data: usageData } = await supabase.rpc('get_daily_usage', { 
        p_user_id: user.id 
      }).single();

      const usage = usageData as { total_stake: number; total_loss: number } | null;

      if (usage) {
        // Check daily stake limit
        if (usage.total_stake + stake > limits.daily_stake_limit) {
          return jsonResponse({ 
            error: 'Daily stake limit exceeded',
            current_stake: usage.total_stake,
            limit: limits.daily_stake_limit,
            attempted: stake
          }, 403);
        }

        // Check daily loss limit
        if (usage.total_loss >= limits.daily_loss_limit) {
          return jsonResponse({ 
            error: 'Daily loss limit reached',
            current_loss: usage.total_loss,
            limit: limits.daily_loss_limit
          }, 403);
        }
      }
    }

    // TODO: DEV – call risk engine before insert

    // Calculate total odds
    const totalOdds = selections.reduce((acc: number, sel: any) => acc * sel.odds, 1);
    const potentialWin = stake * totalOdds;

    // Create bet slip
    const { data: betSlip, error: betSlipError } = await supabase
      .from('bet_slips')
      .insert({
        user_id: user.id,
        total_stake: stake,
        total_odds: totalOdds,
        potential_win: potentialWin,
        status: 'pending_settlement',
        bet_type: selections.length > 1 ? 'accumulator' : 'single'
      })
      .select()
      .single();

    if (betSlipError || !betSlip) {
      console.error('Error creating bet slip:', betSlipError);
      return jsonResponse({ error: 'Failed to create bet' }, 500);
    }

    // Insert bet selections
    const selectionsToInsert = selections.map((sel: any) => ({
      bet_slip_id: betSlip.id,
      match_id: sel.match_id,
      home_team: sel.home_team,
      away_team: sel.away_team,
      sport: sel.sport,
      league: sel.league,
      selection_type: sel.selection_type,
      selection_value: sel.selection_value,
      odds: sel.odds,
      match_time: sel.match_time,
      status: 'pending'
    }));

    const { error: selectionsError } = await supabase
      .from('bet_selections')
      .insert(selectionsToInsert);

    if (selectionsError) {
      console.error('Error creating bet selections:', selectionsError);
      // Rollback bet slip
      await supabase.from('bet_slips').delete().eq('id', betSlip.id);
      return jsonResponse({ error: 'Failed to create bet selections' }, 500);
    }

    // Deduct stake from user balance
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: profile.balance - stake })
      .eq('id', user.id);

    if (balanceError) {
      console.error('Error updating balance:', balanceError);
      return jsonResponse({ error: 'Failed to update balance' }, 500);
    }

    // Broadcast balance change
    const channel = supabase.channel(`balance_change:${user.id}`);
    await channel.send({
      type: 'broadcast',
      event: 'balance_update',
      payload: { newBalance: profile.balance - stake }
    });

    return jsonResponse({ 
      betSlipId: betSlip.id,
      newBalance: profile.balance - stake 
    }, 201);

  } catch (error) {
    console.error('Error in create-bet function:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
