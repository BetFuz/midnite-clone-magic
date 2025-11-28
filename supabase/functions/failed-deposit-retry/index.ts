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

    const { action, userId, transactionRef, amount, bankCode, accountNumber, failureReason } = await req.json();
    
    console.log('Failed deposit retry action:', action);

    if (action === 'create_retry') {
      // Create new retry entry for failed deposit
      const nextRetryAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

      const { data: retry, error: retryError } = await supabaseClient
        .from('failed_deposit_retries')
        .insert({
          user_id: userId,
          original_transaction_ref: transactionRef,
          amount,
          bank_code: bankCode,
          account_number: accountNumber,
          failure_reason: failureReason,
          retry_count: 0,
          next_retry_at: nextRetryAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (retryError) {
        throw retryError;
      }

      console.log('Retry entry created:', retry.id);

      return new Response(
        JSON.stringify({
          success: true,
          retry: {
            id: retry.id,
            nextRetryAt,
            maxRetries: 48,
            message: 'Deposit will be retried every 30 minutes for 24 hours'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    if (action === 'process_retries') {
      // Process all pending retries that are due
      const now = new Date();
      
      const { data: pendingRetries, error: pendingError } = await supabaseClient
        .from('failed_deposit_retries')
        .select('*')
        .in('status', ['pending', 'retrying'])
        .lte('next_retry_at', now.toISOString())
        .lt('retry_count', 48);

      if (pendingError) {
        throw pendingError;
      }

      console.log('Processing', pendingRetries?.length || 0, 'pending retries');

      let successCount = 0;
      let failureCount = 0;
      let exhaustedCount = 0;

      for (const retry of pendingRetries || []) {
        try {
          // Update status to retrying
          await supabaseClient
            .from('failed_deposit_retries')
            .update({
              status: 'retrying',
              last_retry_at: now.toISOString()
            })
            .eq('id', retry.id);

          // Attempt to process deposit again
          // TODO: Integrate with payment processor (Flutterwave/Paystack)
          const success = Math.random() > 0.3; // Simulate 70% success rate

          if (success) {
            // Mark as successful
            await supabaseClient
              .from('failed_deposit_retries')
              .update({
                status: 'success',
                success_at: now.toISOString()
              })
              .eq('id', retry.id);

            // Credit user balance
            const { data: profile } = await supabaseClient
              .from('profiles')
              .select('balance')
              .eq('id', retry.user_id)
              .single();

            if (profile) {
              await supabaseClient
                .from('profiles')
                .update({
                  balance: profile.balance + retry.amount
                })
                .eq('id', retry.user_id);

              // Log to ledger
              await supabaseClient.rpc('log_ledger_entry', {
                p_user_id: retry.user_id,
                p_transaction_type: 'deposit',
                p_amount: retry.amount,
                p_currency: 'NGN',
                p_balance_before: profile.balance,
                p_balance_after: profile.balance + retry.amount,
                p_reference_id: retry.id,
                p_reference_type: 'retry_deposit',
                p_description: `Deposit retry succeeded: ₦${retry.amount}`,
                p_metadata: {
                  originalRef: retry.original_transaction_ref,
                  retryCount: retry.retry_count + 1
                }
              });
            }

            // Send SMS notification
            // TODO: Integrate SMS provider
            console.log('SMS: Deposit successful -', retry.user_id, retry.amount);

            successCount++;
          } else {
            // Increment retry count
            const newRetryCount = retry.retry_count + 1;

            if (newRetryCount >= 48) {
              // Exhausted all retries
              await supabaseClient
                .from('failed_deposit_retries')
                .update({
                  status: 'exhausted',
                  retry_count: newRetryCount
                })
                .eq('id', retry.id);

              // Send final SMS notification
              console.log('SMS: Deposit failed after 24h -', retry.user_id);

              exhaustedCount++;
            } else {
              // Schedule next retry
              const nextRetryAt = new Date(now.getTime() + 30 * 60 * 1000);

              await supabaseClient
                .from('failed_deposit_retries')
                .update({
                  status: 'pending',
                  retry_count: newRetryCount,
                  next_retry_at: nextRetryAt.toISOString()
                })
                .eq('id', retry.id);

              // Send retry SMS update
              if (newRetryCount % 6 === 0) { // Every 3 hours
                console.log('SMS: Still retrying deposit -', retry.user_id, `${newRetryCount}/48`);
              }

              failureCount++;
            }
          }
        } catch (error) {
          console.error('Retry processing error:', error);
          failureCount++;
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          processed: pendingRetries?.length || 0,
          successCount,
          failureCount,
          exhaustedCount,
          message: `Processed ${pendingRetries?.length || 0} retries: ${successCount} succeeded, ${failureCount} still retrying, ${exhaustedCount} exhausted`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Failed deposit retry error:', error);
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
