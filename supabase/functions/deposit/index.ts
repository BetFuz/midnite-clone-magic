import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClientWithAuth } from "../_shared/supabase-client.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

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

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return jsonResponse({ error: 'Invalid amount' }, 400);
    }

    // TODO: DEV – add PCI compliance wrapper
    // TODO: Create actual Stripe Checkout session
    // const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '');
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [{
    //     price: Deno.env.get('STRIPE_PRICE_ID'),
    //     quantity: 1,
    //   }],
    //   mode: 'payment',
    //   success_url: `${origin}/wallet?success=true`,
    //   cancel_url: `${origin}/wallet?canceled=true`,
    //   metadata: {
    //     user_id: user.id,
    //     amount: amount
    //   }
    // });

    // For now, return a mock client secret
    const mockClientSecret = `cs_test_${Math.random().toString(36).substring(7)}`;

    console.log(`Deposit request for user ${user.id}, amount: ${amount}`);

    return jsonResponse({ 
      clientSecret: mockClientSecret,
      message: 'STUB: Stripe integration pending'
    });

  } catch (error) {
    console.error('Error in deposit function:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
