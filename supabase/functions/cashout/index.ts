import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CashoutRequest {
  bet_slip_id: string;
  cashout_amount: number;
}

interface CashoutRules {
  min_pct: number;
  cool_down_seconds: number;
  max_cashout_pct: number;
}

serve(async (req) => {
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

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const body: CashoutRequest = await req.json();
    const { bet_slip_id, cashout_amount } = body;

    if (!bet_slip_id || !cashout_amount) {
      return new Response(
        JSON.stringify({ error: 'bet_slip_id and cashout_amount are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`💰 Cash-out request: User ${user.id}, Bet ${bet_slip_id}, Amount ₦${cashout_amount}`);

    // Fetch cash-out rules
    const { data: rules, error: rulesError } = await supabaseClient
      .from('cashout_rules')
      .select('*')
      .eq('id', 1)
      .single();

    if (rulesError || !rules) {
      console.error('Error fetching cashout rules:', rulesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch cashout rules' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const cashoutRules = rules as CashoutRules;
    console.log(`📋 Rules: Min ${cashoutRules.min_pct}%, Max ${cashoutRules.max_cashout_pct}%, Cooldown ${cashoutRules.cool_down_seconds}s`);

    // Fetch bet slip
    const { data: betSlip, error: betError } = await supabaseClient
      .from('bet_slips')
      .select('*')
      .eq('id', bet_slip_id)
      .eq('user_id', user.id)
      .single();

    if (betError || !betSlip) {
      console.error('Bet slip not found:', betError);
      return new Response(
        JSON.stringify({ error: 'Bet slip not found or unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Validate bet is active and pending
    if (betSlip.status !== 'pending') {
      return new Response(
        JSON.stringify({ 
          error: 'Cash-out only allowed for pending bets',
          status: betSlip.status 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const potentialWin = betSlip.potential_win;
    const originalStake = betSlip.total_stake;
    const cashoutPct = (cashout_amount / potentialWin) * 100;

    console.log(`🎯 Bet details: Stake ₦${originalStake}, Potential ₦${potentialWin}, Cashout ${cashoutPct.toFixed(2)}%`);

    // Check minimum cash-out percentage
    if (cashoutPct < cashoutRules.min_pct) {
      return new Response(
        JSON.stringify({
          error: `Cash-out amount must be at least ${cashoutRules.min_pct}% of potential win`,
          min_allowed: (potentialWin * cashoutRules.min_pct) / 100,
          requested: cashout_amount,
          potential_win: potentialWin,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check maximum cash-out percentage (prevent 100% cash-outs)
    if (cashoutPct > cashoutRules.max_cashout_pct) {
      return new Response(
        JSON.stringify({
          error: `Cash-out amount cannot exceed ${cashoutRules.max_cashout_pct}% of potential win`,
          max_allowed: (potentialWin * cashoutRules.max_cashout_pct) / 100,
          requested: cashout_amount,
          potential_win: potentialWin,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check cooldown timer: Fetch last cash-out attempt
    const { data: lastCashout, error: lastCashoutError } = await supabaseClient
      .from('cashout_transactions')
      .select('created_at')
      .eq('bet_slip_id', bet_slip_id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastCashout && !lastCashoutError) {
      const lastAttemptTime = new Date(lastCashout.created_at).getTime();
      const now = Date.now();
      const elapsedSeconds = (now - lastAttemptTime) / 1000;

      if (elapsedSeconds < cashoutRules.cool_down_seconds) {
        const remainingSeconds = Math.ceil(cashoutRules.cool_down_seconds - elapsedSeconds);
        return new Response(
          JSON.stringify({
            error: 'Cooldown period active',
            message: `Please wait ${remainingSeconds} seconds before attempting another cash-out`,
            cooldown_seconds: cashoutRules.cool_down_seconds,
            remaining_seconds: remainingSeconds,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
    }

    console.log('✅ All validation checks passed');

    // Record cash-out transaction
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('cashout_transactions')
      .insert({
        bet_slip_id,
        user_id: user.id,
        original_stake: originalStake,
        potential_win: potentialWin,
        cashout_amount,
        cashout_pct: cashoutPct,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating cashout transaction:', transactionError);
      return new Response(
        JSON.stringify({ error: 'Failed to process cash-out' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Update bet slip status to cashed-out
    const { error: updateError } = await supabaseClient
      .from('bet_slips')
      .update({ 
        status: 'void', // Mark as void since user cashed out
        settled_at: new Date().toISOString() 
      })
      .eq('id', bet_slip_id);

    if (updateError) {
      console.error('Error updating bet slip:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update bet slip' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Fetch current user balance
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to update balance' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const currentBalance = profile?.balance || 0;
    const newBalance = currentBalance + cashout_amount;

    // Update user balance
    const { error: balanceError } = await supabaseClient
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', user.id);

    if (balanceError) {
      console.error('Error updating balance:', balanceError);
      return new Response(
        JSON.stringify({ error: 'Failed to credit cash-out amount' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Log to immutable ledger
    await supabaseClient.rpc('log_ledger_entry', {
      p_user_id: user.id,
      p_transaction_type: 'cashout',
      p_amount: cashout_amount,
      p_currency: 'NGN',
      p_balance_before: currentBalance,
      p_balance_after: newBalance,
      p_reference_id: bet_slip_id,
      p_reference_type: 'bet_slip',
      p_description: `Cash-out ${cashoutPct.toFixed(2)}% - Original stake ₦${originalStake}, Potential win ₦${potentialWin}`,
      p_metadata: {
        transaction_id: transaction.id,
        original_stake: originalStake,
        potential_win: potentialWin,
        cashout_amount,
        cashout_pct: cashoutPct,
      },
    });

    console.log(`✅ Cash-out completed: User ${user.id} received ₦${cashout_amount} (${cashoutPct.toFixed(2)}%)`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cash-out processed successfully',
        transaction_id: transaction.id,
        cashout_amount,
        cashout_pct: cashoutPct.toFixed(2),
        original_stake: originalStake,
        potential_win: potentialWin,
        new_balance: newBalance,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Cash-out error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
