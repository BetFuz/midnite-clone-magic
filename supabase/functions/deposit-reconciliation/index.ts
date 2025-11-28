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

    const { reconciliationDate, provider, settlementData } = await req.json();
    
    console.log('Starting deposit reconciliation:', {
      reconciliationDate,
      provider
    });

    // Get ledger total for the date
    const { data: ledgerEntries, error: ledgerError } = await supabaseClient
      .from('ledger_entries')
      .select('amount')
      .eq('transaction_type', 'deposit')
      .gte('created_at', `${reconciliationDate}T00:00:00Z`)
      .lt('created_at', `${reconciliationDate}T23:59:59Z`);

    if (ledgerError) {
      throw ledgerError;
    }

    const ledgerTotal = ledgerEntries?.reduce((sum, entry) => sum + parseFloat(entry.amount.toString()), 0) || 0;

    // Parse settlement file data (would normally come from CSV/API)
    // Expected format: { transactions: [{ amount, ref, status }], total }
    const settlementTotal = settlementData?.total || 0;
    const settlementTransactions = settlementData?.transactions || [];

    // Calculate difference
    const difference = Math.abs(ledgerTotal - settlementTotal);
    const tolerance = 0.01; // ₦0.01 tolerance for rounding
    const isMatched = difference <= tolerance;

    // Count matched/unmatched transactions
    const matchedCount = settlementTransactions.filter((t: any) => t.status === 'success').length;
    const unmatchedCount = settlementTransactions.filter((t: any) => t.status !== 'success').length;

    // Create reconciliation record
    const { data: reconciliation, error: reconciliationError } = await supabaseClient
      .from('deposit_reconciliation')
      .insert({
        reconciliation_date: reconciliationDate,
        provider,
        ledger_total: ledgerTotal,
        settlement_total: settlementTotal,
        difference,
        matched_count: matchedCount,
        unmatched_count: unmatchedCount,
        status: isMatched ? 'matched' : 'mismatched',
        reconciled_at: isMatched ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (reconciliationError) {
      throw reconciliationError;
    }

    console.log('Reconciliation result:', {
      reconciliationDate,
      ledgerTotal,
      settlementTotal,
      difference,
      isMatched
    });

    // If mismatch detected, create support ticket
    let supportTicketId: string | null = null;
    
    if (!isMatched && difference > tolerance) {
      // TODO: Integrate with support ticket system (e.g., Zendesk, Freshdesk)
      supportTicketId = `RECON-${Date.now()}`;
      
      await supabaseClient
        .from('deposit_reconciliation')
        .update({
          support_ticket_id: supportTicketId
        })
        .eq('id', reconciliation.id);

      // Create admin alert
      await supabaseClient.rpc('log_admin_action', {
        _admin_id: '00000000-0000-0000-0000-000000000000',
        _action: 'reconciliation_mismatch',
        _resource_type: 'deposit_reconciliation',
        _resource_id: reconciliation.id,
        _status: 'error',
        _error_message: `Chargeback insurance triggered: ₦${difference.toFixed(2)} mismatch on ${reconciliationDate} (${provider}). Ticket: ${supportTicketId}`
      });

      console.log('Support ticket created:', supportTicketId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reconciliation: {
          id: reconciliation.id,
          reconciliationDate,
          provider,
          ledgerTotal: parseFloat(ledgerTotal.toFixed(2)),
          settlementTotal: parseFloat(settlementTotal.toFixed(2)),
          difference: parseFloat(difference.toFixed(2)),
          matchedCount,
          unmatchedCount,
          isMatched,
          supportTicketId
        },
        message: isMatched ? 
          `Reconciliation matched: ₦${ledgerTotal.toFixed(2)}` :
          `Mismatch detected: ₦${difference.toFixed(2)} difference. Support ticket created: ${supportTicketId}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Deposit reconciliation error:', error);
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
