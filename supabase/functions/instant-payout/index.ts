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

    const { withdrawalId, amount, bankCode, accountNumber, accountName } = await req.json();
    
    const startTime = Date.now();
    console.log('Processing instant payout:', {
      userId: user.id,
      withdrawalId,
      amount,
      bankCode,
      accountNumber
    });

    // Determine provider based on bank code
    let provider = 'flutterwave'; // default
    
    // Zenith Bank codes for RTP (Real-Time Payment) rail
    const zenithBankCodes = ['057', '068']; // Zenith Bank, Zenith Bank International
    
    if (zenithBankCodes.includes(bankCode)) {
      provider = 'zenith_rtp';
      console.log('Using Zenith RTP rail for sub-10s payout');
    }

    // Create instant payout record
    const { data: payout, error: payoutError } = await supabaseClient
      .from('instant_payouts')
      .insert({
        user_id: user.id,
        withdrawal_id: withdrawalId,
        amount,
        bank_code: bankCode,
        account_number: accountNumber,
        account_name: accountName,
        provider,
        status: 'processing'
      })
      .select()
      .single();

    if (payoutError) {
      throw payoutError;
    }

    // Simulate payment processing
    let transactionRef: string | undefined;
    let processingTimeMs: number;
    let status: 'completed' | 'failed';
    let errorMessage: string | undefined;

    try {
      if (provider === 'zenith_rtp') {
        // Zenith RTP rail - sub-10s processing
        // TODO: Integrate with Zenith PayWithTransfer API
        transactionRef = `ZRTP${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        
        // Simulate fast processing (3-8 seconds)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 3000));
        
        processingTimeMs = Date.now() - startTime;
        status = 'completed';
        
        console.log('Zenith RTP completed in', processingTimeMs, 'ms');
      } else {
        // Standard Flutterwave processing
        // TODO: Integrate with Flutterwave Transfer API
        transactionRef = `FLW${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        
        // Simulate standard processing (10-30 seconds)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 20000 + 10000));
        
        processingTimeMs = Date.now() - startTime;
        status = 'completed';
        
        console.log('Standard payout completed in', processingTimeMs, 'ms');
      }
    } catch (error) {
      status = 'failed';
      errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      processingTimeMs = Date.now() - startTime;
    }

    // Update payout record
    await supabaseClient
      .from('instant_payouts')
      .update({
        status,
        transaction_ref: transactionRef,
        processing_time_ms: processingTimeMs,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        error_message: errorMessage
      })
      .eq('id', payout.id);

    // Update user balance if successful
    if (status === 'completed') {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (profile) {
        await supabaseClient
          .from('profiles')
          .update({
            balance: profile.balance - amount
          })
          .eq('id', user.id);

        // Log to ledger
        await supabaseClient.rpc('log_ledger_entry', {
          p_user_id: user.id,
          p_transaction_type: 'withdrawal',
          p_amount: -amount,
          p_currency: 'NGN',
          p_balance_before: profile.balance,
          p_balance_after: profile.balance - amount,
          p_reference_id: payout.id,
          p_reference_type: 'instant_payout',
          p_description: `Instant payout via ${provider}: ₦${amount}`,
          p_metadata: {
            withdrawalId,
            provider,
            transactionRef,
            processingTimeMs,
            bankCode,
            accountNumber
          }
        });
      }
    }

    console.log('Instant payout result:', {
      userId: user.id,
      status,
      provider,
      processingTimeMs,
      transactionRef
    });

    return new Response(
      JSON.stringify({
        success: status === 'completed',
        payout: {
          id: payout.id,
          withdrawalId,
          amount,
          provider,
          status,
          transactionRef,
          processingTimeMs,
          isInstant: provider === 'zenith_rtp' && processingTimeMs < 10000
        },
        message: status === 'completed' ? 
          `Payout completed in ${(processingTimeMs / 1000).toFixed(1)}s via ${provider}` :
          `Payout failed: ${errorMessage}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Instant payout error:', error);
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
