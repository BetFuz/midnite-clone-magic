import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClientWithAuth, createServiceClient } from "../_shared/supabase-client.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

/**
 * Deposit Function - Ready for Flutterwave/Stripe Integration
 * 
 * TODO: Add API keys as secrets:
 * - FLUTTERWAVE_SECRET_KEY
 * - FLUTTERWAVE_PUBLIC_KEY
 * - STRIPE_SECRET_KEY
 * - STRIPE_PUBLISHABLE_KEY
 */

interface DepositRequest {
  amount: number;
  provider: 'flutterwave' | 'stripe';
  currency?: string;
  metadata?: Record<string, any>;
}

interface FlutterwavePaymentResponse {
  status: string;
  message: string;
  data: {
    link: string;
    reference: string;
  };
}

interface StripePaymentResponse {
  clientSecret: string;
  sessionId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization header' }, 401);
    }

    const supabase = createClientWithAuth(authHeader);
    const serviceClient = createServiceClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const body: DepositRequest = await req.json();
    const { amount, provider = 'flutterwave', currency = 'NGN', metadata = {} } = body;

    // Validation
    if (!amount || amount <= 0) {
      return jsonResponse({ error: 'Invalid amount' }, 400);
    }

    if (amount < 100) {
      return jsonResponse({ error: 'Minimum deposit is ₦100' }, 400);
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, phone, balance')
      .eq('id', user.id)
      .single();

    const transactionRef = `DEP-${Date.now()}-${user.id.slice(0, 8)}`;

    // Get current balance
    const currentBalance = profile?.balance || 0;

    // Log transaction attempt to admin audit
    await serviceClient.from('admin_audit_log').insert({
      admin_id: user.id,
      action: 'deposit_initiated',
      resource_type: 'transaction',
      resource_id: transactionRef,
      status: 'pending',
      payload_hash: JSON.stringify({ amount, provider, currency })
    });

    // Log to immutable ledger (financial audit trail)
    await serviceClient.rpc('log_ledger_entry', {
      p_user_id: user.id,
      p_transaction_type: 'deposit',
      p_amount: amount,
      p_currency: currency,
      p_balance_before: currentBalance,
      p_balance_after: currentBalance + amount,
      p_reference_id: null,
      p_reference_type: 'payment_provider',
      p_description: `Deposit via ${provider} - ${transactionRef}`,
      p_metadata: {
        provider,
        reference: transactionRef,
        email: profile?.email
      }
    });

    // PRODUCTION: Initialize payment with selected provider
    if (provider === 'flutterwave') {
      return await initiateFlutterwavePayment(user.id, profile?.email || '', amount, currency, transactionRef, metadata);
    } else if (provider === 'stripe') {
      return await initiateStripePayment(user.id, profile?.email || '', amount, currency, transactionRef, metadata);
    } else {
      return jsonResponse({ error: 'Invalid payment provider' }, 400);
    }

  } catch (error) {
    console.error('Error in deposit function:', error);
    return jsonResponse({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Initialize Flutterwave Payment
 * TODO: Uncomment when FLUTTERWAVE_SECRET_KEY is added
 */
async function initiateFlutterwavePayment(
  userId: string,
  email: string,
  amount: number,
  currency: string,
  reference: string,
  metadata: Record<string, any>
): Promise<Response> {
  
  // TODO: Uncomment when ready
  /*
  const flutterwaveKey = Deno.env.get('FLUTTERWAVE_SECRET_KEY');
  if (!flutterwaveKey) {
    return jsonResponse({ error: 'Flutterwave not configured' }, 500);
  }

  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${flutterwaveKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: reference,
      amount: amount,
      currency: currency,
      redirect_url: `${Deno.env.get('APP_URL')}/account/deposits?reference=${reference}`,
      customer: {
        email: email,
        name: metadata.name || 'Betfuz User',
      },
      customizations: {
        title: 'Betfuz Deposit',
        description: `Deposit ${amount} ${currency}`,
        logo: 'https://betfuz.com/logo.png',
      },
      meta: {
        user_id: userId,
        ...metadata
      }
    })
  });

  const data: FlutterwavePaymentResponse = await response.json();

  if (data.status === 'success') {
    return jsonResponse({
      provider: 'flutterwave',
      paymentUrl: data.data.link,
      reference: data.data.reference,
      amount: amount,
      currency: currency
    });
  } else {
    return jsonResponse({ error: data.message || 'Payment initialization failed' }, 400);
  }
  */

  // STUB RESPONSE - Remove when API is integrated
  console.log(`[STUB] Flutterwave payment initiated: ${reference} for user ${userId}, amount: ${amount} ${currency}`);
  return jsonResponse({
    provider: 'flutterwave',
    paymentUrl: `https://checkout.flutterwave.com/stub/${reference}`,
    reference: reference,
    amount: amount,
    currency: currency,
    message: 'STUB: Add FLUTTERWAVE_SECRET_KEY to complete integration'
  });
}

/**
 * Initialize Stripe Payment
 * TODO: Uncomment when STRIPE_SECRET_KEY is added
 */
async function initiateStripePayment(
  userId: string,
  email: string,
  amount: number,
  currency: string,
  reference: string,
  metadata: Record<string, any>
): Promise<Response> {
  
  // TODO: Uncomment when ready
  /*
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    return jsonResponse({ error: 'Stripe not configured' }, 500);
  }

  // Convert amount to cents for Stripe
  const amountInCents = Math.round(amount * 100);

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][price_data][currency]': currency.toLowerCase(),
      'line_items[0][price_data][unit_amount]': amountInCents.toString(),
      'line_items[0][price_data][product_data][name]': 'Betfuz Deposit',
      'line_items[0][quantity]': '1',
      'mode': 'payment',
      'success_url': `${Deno.env.get('APP_URL')}/account/deposits?success=true&reference=${reference}`,
      'cancel_url': `${Deno.env.get('APP_URL')}/account/deposits?canceled=true`,
      'client_reference_id': reference,
      'customer_email': email,
      'metadata[user_id]': userId,
      'metadata[reference]': reference,
    })
  });

  const data = await response.json();

  if (data.id) {
    return jsonResponse({
      provider: 'stripe',
      sessionId: data.id,
      paymentUrl: data.url,
      reference: reference,
      amount: amount,
      currency: currency
    });
  } else {
    return jsonResponse({ error: data.error?.message || 'Payment initialization failed' }, 400);
  }
  */

  // STUB RESPONSE - Remove when API is integrated
  console.log(`[STUB] Stripe payment initiated: ${reference} for user ${userId}, amount: ${amount} ${currency}`);
  return jsonResponse({
    provider: 'stripe',
    sessionId: `cs_test_${reference}`,
    paymentUrl: `https://checkout.stripe.com/pay/stub/${reference}`,
    reference: reference,
    amount: amount,
    currency: currency,
    message: 'STUB: Add STRIPE_SECRET_KEY to complete integration'
  });
}
