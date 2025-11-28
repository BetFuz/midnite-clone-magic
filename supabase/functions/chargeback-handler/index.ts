import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";
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

    const { 
      chargebackId, 
      transactionReference, 
      amount, 
      reason, 
      provider // 'paystack' or 'flutterwave'
    } = await req.json();

    console.log(`Processing chargeback: ${chargebackId}, provider: ${provider}`);

    // Find the original transaction in ledger
    const { data: ledgerEntry, error: ledgerError } = await supabase
      .from('ledger_entries')
      .select('*, bet_slips(id)')
      .eq('reference_id', transactionReference)
      .eq('transaction_type', 'deposit')
      .single();

    if (ledgerError || !ledgerEntry) {
      console.error('Original transaction not found:', ledgerError);
      return new Response(JSON.stringify({ 
        error: 'Transaction not found',
        chargeback_id: chargebackId
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = ledgerEntry.user_id;
    const betTicketId = ledgerEntry.metadata?.bet_slip_id || null;

    console.log(`Chargeback mapped to user: ${userId}, bet: ${betTicketId}`);

    // Get current balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    const currentBalance = profile?.balance || 0;
    const refundAmount = -Math.abs(amount); // Negative for chargeback

    // Process refund - deduct from balance
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: currentBalance + refundAmount })
      .eq('id', userId);

    if (balanceError) {
      console.error('Failed to process refund:', balanceError);
      return new Response(JSON.stringify({ error: 'Failed to process refund' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create ledger entry for chargeback
    await supabase.from('ledger_entries').insert({
      user_id: userId,
      transaction_type: 'chargeback',
      amount: refundAmount,
      balance_before: currentBalance,
      balance_after: currentBalance + refundAmount,
      reference_id: chargebackId,
      reference_type: 'chargeback',
      description: `Chargeback processed: ${reason}`,
      metadata: {
        original_transaction: transactionReference,
        bet_ticket_id: betTicketId,
        provider,
        reason
      }
    });

    // Void related bet if exists
    if (betTicketId) {
      await supabase
        .from('bet_slips')
        .update({ status: 'voided' })
        .eq('id', betTicketId);

      console.log(`Bet ${betTicketId} voided due to chargeback`);
    }

    // Create admin alert
    await supabase.from('admin_audit_log').insert({
      admin_id: '00000000-0000-0000-0000-000000000000',
      action: 'chargeback_processed',
      resource_type: 'payment',
      resource_id: chargebackId,
      status: 'success',
      error_message: `Chargeback: ${reason}, Amount: ${amount}, User: ${userId}`
    });

    return new Response(JSON.stringify({
      success: true,
      chargeback_id: chargebackId,
      refund_amount: refundAmount,
      user_id: userId,
      bet_voided: !!betTicketId,
      new_balance: currentBalance + refundAmount
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Chargeback handler error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
