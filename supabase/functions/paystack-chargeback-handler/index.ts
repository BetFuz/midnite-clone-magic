import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

interface ChargebackEvent {
  event: string;
  data: {
    id: number;
    refund_id: number;
    transaction_id: number;
    transaction_reference: string;
    dispute_id: number;
    status: string;
    category: string;
    customer: {
      id: number;
      email: string;
      name: string;
    };
    amount: number;
    currency: string;
    resolution: string;
    domain: string;
    ticket_id?: string; // Custom metadata field
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify Paystack signature
    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    const hash = await crypto.subtle.digest(
      'SHA-512',
      new TextEncoder().encode(Deno.env.get('PAYSTACK_SECRET_KEY')! + body)
    );
    const expectedSignature = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSignature) {
      console.error('Invalid Paystack signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event: ChargebackEvent = JSON.parse(body);
    console.log('Paystack chargeback event:', event);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle chargeback events
    if (event.event === 'charge.dispute.create' || event.event === 'charge.dispute.remind') {
      // Find the bet ticket associated with this transaction
      const ticketId = event.data.ticket_id || event.data.transaction_reference;

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
        p_currency: 'NGN',
        p_balance_before: balanceBefore,
        p_balance_after: balanceAfter,
        p_reference_id: betSlip.id,
        p_reference_type: 'bet_slip',
        p_description: `Automatic refund due to Paystack chargeback (Dispute ID: ${event.data.dispute_id})`,
        p_metadata: {
          dispute_id: event.data.dispute_id,
          transaction_reference: event.data.transaction_reference,
          chargeback_amount: event.data.amount,
          category: event.data.category,
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
          description: `Chargeback received for bet ticket ${ticketId}`,
          metadata: {
            dispute_id: event.data.dispute_id,
            amount: refundAmount,
            transaction_reference: event.data.transaction_reference,
            category: event.data.category,
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

    // Handle chargeback resolution (dispute resolved in customer's favor)
    if (event.event === 'charge.dispute.resolve') {
      console.log('Chargeback resolved:', event.data.resolution);

      // If resolved in merchant's favor, no action needed
      if (event.data.resolution === 'merchant-accepted' || event.data.resolution === 'declined') {
        return new Response(JSON.stringify({
          success: true,
          message: 'Chargeback resolved in merchant favor',
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // If already refunded via dispute creation, just log
      return new Response(JSON.stringify({
        success: true,
        message: 'Chargeback already processed',
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
