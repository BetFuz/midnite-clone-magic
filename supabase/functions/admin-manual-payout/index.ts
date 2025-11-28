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

    const { userId, amount, reason, transactionType } = await req.json();

    if (!userId || !amount || !reason) {
      throw new Error('Missing required fields');
    }

    // Get current balance
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('User not found');
    }

    const currentBalance = Number(profile.balance || 0);
    const payoutAmount = Number(amount);
    const newBalance = currentBalance + payoutAmount;

    // Update balance
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Log to ledger
    await supabaseClient.rpc('log_ledger_entry', {
      p_user_id: userId,
      p_transaction_type: transactionType || 'manual_payout',
      p_amount: payoutAmount,
      p_currency: 'NGN',
      p_balance_before: currentBalance,
      p_balance_after: newBalance,
      p_description: `Manual payout by admin: ${reason}`,
      p_metadata: { admin_id: user.id, admin_email: user.email },
    });

    // Log admin action
    await supabaseClient.rpc('log_admin_action', {
      _admin_id: user.id,
      _action: 'MANUAL_PAYOUT',
      _resource_type: 'user',
      _resource_id: userId,
      _payload_hash: `${payoutAmount} NGN - ${reason}`,
      _status: 'success',
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Manual payout processed',
      amount: payoutAmount,
      newBalance 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-manual-payout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
