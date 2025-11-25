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

    const { amount, method } = await req.json();

    if (!amount || amount <= 0) {
      return jsonResponse({ error: 'Invalid amount' }, 400);
    }

    if (!method) {
      return jsonResponse({ error: 'Withdrawal method required' }, 400);
    }

    // Get user's current balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return jsonResponse({ error: 'Profile not found' }, 404);
    }

    // Check if user has sufficient balance
    if (profile.balance < amount) {
      return jsonResponse({ error: 'Insufficient balance' }, 400);
    }

    // TODO: DEV – call Go withdrawal service
    // Insert withdrawal request (stub - no actual money movement)
    // In production, this would trigger Go service for KYC, limits, fraud checks
    
    const requestId = crypto.randomUUID();

    console.log(`Withdrawal request ${requestId} for user ${user.id}, amount: ${amount}, method: ${method}`);

    return jsonResponse({ 
      requestId,
      status: 'pending',
      message: 'STUB: Withdrawal will be processed by Go service'
    });

  } catch (error) {
    console.error('Error in withdraw function:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
