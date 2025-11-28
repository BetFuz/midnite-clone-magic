import { createServiceClient } from '../_shared/supabase-client.ts';
import { corsHeaders } from '../_shared/cors.ts';

const DUST_THRESHOLD = 0.01; // USDT
const HOUSE_WALLET_ID = '00000000-0000-0000-0000-000000000000'; // System house wallet

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createServiceClient();
    
    console.log('[SWEEP DUST] Starting nightly dust sweep...');

    // Find all users with USDT dust balances < 0.01
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, balance, currency_code')
      .eq('currency_code', 'USDT')
      .lt('balance', DUST_THRESHOLD)
      .gt('balance', 0);

    if (profilesError) {
      throw new Error(`Failed to fetch dust balances: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      console.log('[SWEEP DUST] No dust to sweep');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No dust to sweep',
          swept: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const totalDust = profiles.reduce((sum, profile) => sum + profile.balance, 0);
    const userCount = profiles.length;

    console.log(`[SWEEP DUST] Found ${userCount} users with total dust: ${totalDust} USDT`);

    // Sweep dust from each user
    for (const profile of profiles) {
      const dustAmount = profile.balance;

      // Zero out user balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: 0 })
        .eq('id', profile.id);

      if (updateError) {
        console.error(`[SWEEP DUST] Failed to zero balance for user ${profile.id}:`, updateError);
        continue;
      }

      // Log ledger entry for user
      const { error: ledgerError } = await supabase.rpc('log_ledger_entry', {
        p_user_id: profile.id,
        p_transaction_type: 'dust_sweep',
        p_amount: -dustAmount,
        p_currency: 'USDT',
        p_balance_before: dustAmount,
        p_balance_after: 0,
        p_description: 'Automated dust sweep to house wallet',
        p_metadata: { swept_amount: dustAmount, sweep_date: new Date().toISOString() }
      });

      if (ledgerError) {
        console.error(`[SWEEP DUST] Failed to log ledger entry for user ${profile.id}:`, ledgerError);
      }
    }

    // Credit house wallet with aggregated dust (single ledger entry)
    const { error: houseLedgerError } = await supabase.rpc('log_ledger_entry', {
      p_user_id: HOUSE_WALLET_ID,
      p_transaction_type: 'dust_sweep_aggregate',
      p_amount: totalDust,
      p_currency: 'USDT',
      p_balance_before: 0,
      p_balance_after: totalDust,
      p_description: `Aggregated dust sweep from ${userCount} wallets`,
      p_metadata: { 
        total_dust: totalDust, 
        user_count: userCount,
        sweep_date: new Date().toISOString() 
      }
    });

    if (houseLedgerError) {
      console.error('[SWEEP DUST] Failed to log house wallet ledger entry:', houseLedgerError);
    }

    console.log(`[SWEEP DUST] Successfully swept ${totalDust} USDT from ${userCount} wallets`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Swept ${totalDust} USDT from ${userCount} wallets`,
        swept: totalDust,
        users: userCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[SWEEP DUST] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
