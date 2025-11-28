import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify superadmin
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      throw new Error('Invalid token');
    }

    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'superadmin');

    if (!roles || roles.length === 0) {
      throw new Error('Superadmin access required');
    }

    const { betSlipId, reason } = await req.json();

    // Get bet slip
    const { data: betSlip, error: betError } = await supabaseClient
      .from('bet_slips')
      .select('*, bet_selections(*)')
      .eq('id', betSlipId)
      .single();

    if (betError || !betSlip) {
      throw new Error('Bet slip not found');
    }

    if (betSlip.status !== 'pending') {
      throw new Error('Can only void pending bets');
    }

    // Update bet to void
    const { error: updateError } = await supabaseClient
      .from('bet_slips')
      .update({ 
        status: 'void',
        settled_at: new Date().toISOString()
      })
      .eq('id', betSlipId);

    if (updateError) throw updateError;

    // Refund user
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('balance')
      .eq('id', betSlip.user_id)
      .single();

    const newBalance = Number(profile?.balance || 0) + Number(betSlip.total_stake);

    await supabaseClient
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', betSlip.user_id);

    // Log to ledger
    await supabaseClient.rpc('log_ledger_entry', {
      p_user_id: betSlip.user_id,
      p_transaction_type: 'bet_void_refund',
      p_amount: betSlip.total_stake,
      p_currency: 'NGN',
      p_balance_before: profile?.balance || 0,
      p_balance_after: newBalance,
      p_reference_id: betSlipId,
      p_reference_type: 'bet_slip',
      p_description: `Bet voided by admin: ${reason}`,
    });

    // Log admin action
    await supabaseClient.rpc('log_admin_action', {
      _admin_id: user.id,
      _action: 'VOID_BET',
      _resource_type: 'bet_slip',
      _resource_id: betSlipId,
      _payload_hash: reason,
      _status: 'success',
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Bet voided and stake refunded',
      refundedAmount: betSlip.total_stake 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-void-bet:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
