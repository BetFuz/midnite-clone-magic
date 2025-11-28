import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, verif-hash',
};

interface FlutterwaveChargebackEvent {
  event: string;
  'event.type': string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    charged_amount: number;
    status: string;
    customer: {
      id: number;
      email: string;
      name: string;
    };
    meta?: {
      ticket_id?: string;
    };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify Flutterwave signature
    const verifHash = req.headers.get('verif-hash');
    const secretHash = Deno.env.get('FLUTTERWAVE_SECRET_HASH');

    if (!verifHash || verifHash !== secretHash) {
      console.error('Invalid Flutterwave signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event: FlutterwaveChargebackEvent = await req.json();
    console.log('Flutterwave chargeback event:', event);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle chargeback events
    if (event.event === 'charge.dispute' || event['event.type'] === 'CARD_TRANSACTION_CHARGEBACK') {
      // Find the bet ticket associated with this transaction
      const ticketId = event.data.meta?.ticket_id || event.data.tx_ref;

      if (!ticketId) {
        console.error('No ticket ID found in chargeback event');
        return new Response(JSON.stringify({ error: 'No ticket ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Find bet slip by transaction reference
      const { data: betSlip, error: betSlipError } = await supabaseClient
        .from('bet_slips')
        .select('*, bet_selections(*)')
        .eq('id', ticketId)
        .single();

      if (betSlipError || !betSlip) {
        console.error('Bet slip not found:', betSlipError);
        return new Response(JSON.stringify({ error: 'Bet slip not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if bet is still pending or can be refunded
      if (betSlip.status !== 'pending' && betSlip.status !== 'active') {
        console.log('Bet already settled, cannot refund');
        return new Response(JSON.stringify({ 
          message: 'Bet already settled',
          status: betSlip.status 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get user's current balance
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('balance')
        .eq('id', betSlip.user_id)
        .single();

      if (profileError || !profile) {
        console.error('Profile not found:', profileError);
        return new Response(JSON.stringify({ error: 'User profile not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const balanceBefore = parseFloat(profile.balance.toString());
      const refundAmount = parseFloat(betSlip.total_stake.toString());
      const balanceAfter = balanceBefore + refundAmount;

      // Process automatic refund
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ balance: balanceAfter })
        .eq('id', betSlip.user_id);

      if (updateError) {
        console.error('Failed to update balance:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to process refund' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Log the refund in ledger
      await supabaseClient.rpc('log_ledger_entry', {
        p_user_id: betSlip.user_id,
        p_transaction_type: 'chargeback_refund',
        p_amount: refundAmount,
        p_currency: event.data.currency,
        p_balance_before: balanceBefore,
        p_balance_after: balanceAfter,
        p_reference_id: betSlip.id,
        p_reference_type: 'bet_slip',
        p_description: `Automatic refund due to Flutterwave chargeback (Ref: ${event.data.flw_ref})`,
        p_metadata: {
          flw_ref: event.data.flw_ref,
          tx_ref: event.data.tx_ref,
          chargeback_amount: event.data.amount,
          charged_amount: event.data.charged_amount,
        },
      });

      // Cancel the bet slip
      await supabaseClient
        .from('bet_slips')
        .update({ 
          status: 'cancelled',
          settled_at: new Date().toISOString(),
        })
        .eq('id', betSlip.id);

      // Cancel all selections
      await supabaseClient
        .from('bet_selections')
        .update({ status: 'cancelled' })
        .eq('bet_slip_id', betSlip.id);

      // Create AML alert for potential fraud
      await supabaseClient
        .from('aml_alerts')
        .insert({
          user_id: betSlip.user_id,
          alert_type: 'chargeback',
          severity: 'high',
          description: `Flutterwave chargeback received for bet ticket ${ticketId}`,
          metadata: {
            flw_ref: event.data.flw_ref,
            tx_ref: event.data.tx_ref,
            amount: refundAmount,
            customer_email: event.data.customer.email,
          },
        });

      console.log(`Automatic refund processed: ₦${refundAmount} for user ${betSlip.user_id}`);

      return new Response(JSON.stringify({
        success: true,
        message: 'Chargeback processed and refund issued',
        refund_amount: refundAmount,
        ticket_id: ticketId,
        new_balance: balanceAfter,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Event received',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing chargeback:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
