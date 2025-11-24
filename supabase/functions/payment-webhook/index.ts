import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createServiceClient } from '../_shared/supabase-client.ts';
import { corsHeaders, handleCorsOptions, jsonResponse } from '../_shared/cors.ts';
import { checkIdempotency, storeIdempotency } from '../_shared/idempotency.ts';

// TODO: DEV – call Go payment service to finalize
// This is a STUB function for payment webhooks
// Production: Replace with call to Go microservice for payment processing

interface PaymentWebhook {
  provider: 'stripe' | 'flutterwave';
  event_type: string;
  transaction_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  metadata?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const supabase = createServiceClient();
    
    // Get idempotency key from header
    const idempotencyKey = req.headers.get('x-idempotency-key');
    
    // Check for duplicate request
    const { exists, response } = await checkIdempotency(supabase, idempotencyKey);
    if (exists && response) {
      console.log('Duplicate payment webhook detected, returning cached response');
      return jsonResponse(response);
    }

    // Get provider from path or header
    const url = new URL(req.url);
    const provider = url.searchParams.get('provider') || 'stripe';

    // Verify webhook signature
    const signature = req.headers.get('stripe-signature') || 
                     req.headers.get('verif-hash');
    
    if (!signature) {
      console.error('Missing webhook signature');
      return jsonResponse({ error: 'Missing signature' }, 401);
    }

    // TODO: DEV – Verify signature based on provider
    // For Stripe: stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    // For Flutterwave: verifyFlutterwaveSignature(payload, signature)
    
    const webhookSecret = Deno.env.get(
      provider === 'stripe' ? 'STRIPE_WEBHOOK_SECRET' : 'FLUTTERWAVE_WEBHOOK_SECRET'
    );

    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return jsonResponse({ error: 'Server configuration error' }, 500);
    }

    // Parse webhook payload
    const body: PaymentWebhook = await req.json();
    console.log('Payment webhook received:', {
      provider,
      event_type: body.event_type,
      transaction_id: body.transaction_id
    });

    // TODO: DEV – Call Go payment service to process
    // const goServiceUrl = Deno.env.get('GO_PAYMENT_SERVICE_URL');
    // const paymentResult = await fetch(`${goServiceUrl}/process-webhook`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ provider, ...body })
    // });
    // const paymentData = await paymentResult.json();

    // Insert transaction record with pending status
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: body.user_id,
        transaction_id: body.transaction_id,
        type: 'deposit',
        amount: body.amount,
        currency: body.currency,
        status: 'pending',
        provider: provider,
        metadata: body.metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (txError) {
      console.error('Error creating transaction:', txError);
      return jsonResponse({ error: 'Failed to create transaction' }, 500);
    }

    console.log('Transaction created:', transaction.id);

    // Prepare response
    const responseData = {
      success: true,
      transaction_id: body.transaction_id,
      status: 'pending',
      message: 'Payment webhook received and queued',
      // TODO: DEV – Return actual payment data from Go service
      note: 'STUB: Replace with Go payment service call'
    };

    // Store idempotency
    await storeIdempotency(supabase, idempotencyKey, responseData);

    return jsonResponse(responseData);

  } catch (error) {
    console.error('Error in payment-webhook function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ error: errorMessage }, 500);
  }
});
