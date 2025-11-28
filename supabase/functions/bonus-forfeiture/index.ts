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

    const { bonusId } = await req.json();
    
    console.log('Processing bonus forfeiture for user:', user.id, 'bonus:', bonusId);

    // Get bonus rollover details
    const { data: rollover, error: rolloverError } = await supabaseClient
      .from('bonus_rollover')
      .select('*')
      .eq('id', bonusId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (rolloverError || !rollover) {
      throw new Error('Bonus not found or already completed/forfeited');
    }

    // Get user profile for balance adjustment
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('balance, bonus_balance')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    // Calculate forfeiture amounts
    const bonusAmount = profile.bonus_balance || 0;
    const rolloverRemaining = rollover.remaining;
    const rolloverCleared = rollover.completed;

    // Create forfeiture record
    const { data: forfeiture, error: forfeitureError } = await supabaseClient
      .from('bonus_forfeitures')
      .insert({
        user_id: user.id,
        bonus_id: bonusId,
        bonus_type: rollover.bonus_type,
        forfeited_amount: bonusAmount,
        rollover_cleared: rolloverCleared,
        rollover_remaining: rolloverRemaining,
        reason: 'user_requested',
        balance_adjusted: false
      })
      .select()
      .single();

    if (forfeitureError) {
      throw forfeitureError;
    }

    // Update bonus rollover status
    const { error: statusError } = await supabaseClient
      .from('bonus_rollover')
      .update({
        status: 'forfeited',
        forfeited_at: new Date().toISOString()
      })
      .eq('id', bonusId);

    if (statusError) {
      throw statusError;
    }

    // Clear bonus balance from profile (UKGC compliance - one-click cancel)
    const { error: balanceError } = await supabaseClient
      .from('profiles')
      .update({
        bonus_balance: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (balanceError) {
      throw balanceError;
    }

    // Mark forfeiture as balance adjusted
    await supabaseClient
      .from('bonus_forfeitures')
      .update({ balance_adjusted: true })
      .eq('id', forfeiture.id);

    // Log to ledger
    await supabaseClient.rpc('log_ledger_entry', {
      p_user_id: user.id,
      p_transaction_type: 'bonus_forfeiture',
      p_amount: -bonusAmount,
      p_currency: 'NGN',
      p_balance_before: profile.bonus_balance,
      p_balance_after: 0,
      p_reference_id: forfeiture.id,
      p_reference_type: 'bonus_forfeiture',
      p_description: `Bonus forfeited: ₦${bonusAmount} (rollover cleared)`,
      p_metadata: {
        bonusId,
        forfeitedAmount: bonusAmount,
        rolloverCleared,
        rolloverRemaining
      }
    });

    console.log('Bonus forfeiture complete:', {
      userId: user.id,
      bonusId,
      forfeitedAmount: bonusAmount,
      rolloverCleared,
      rolloverRemaining
    });

    return new Response(
      JSON.stringify({
        success: true,
        forfeiture: {
          id: forfeiture.id,
          userId: user.id,
          bonusId,
          forfeitedAmount: bonusAmount,
          rolloverCleared,
          rolloverRemaining,
          balanceAdjusted: true
        },
        message: 'Bonus forfeited successfully. Rollover requirement cleared.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Bonus forfeiture error:', error);
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
