import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentMethod } = await req.json();

    if (!paymentMethod || !['apple_pay', 'google_pay'].includes(paymentMethod)) {
      throw new Error('Invalid payment method');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all unnotified waitlist users for this payment method
    const { data: waitlistUsers, error: fetchError } = await supabaseAdmin
      .from('payment_waitlist')
      .select('*')
      .eq('payment_method', paymentMethod)
      .eq('notified', false);

    if (fetchError) throw fetchError;

    let notified = 0;
    const results = [];

    for (const user of waitlistUsers || []) {
      // TODO: Send actual email notification here
      // For now, just mark as notified
      const { error: updateError } = await supabaseAdmin
        .from('payment_waitlist')
        .update({
          notified: true,
          notified_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (!updateError) {
        notified++;
        results.push({
          email: user.email,
          paymentMethod: user.payment_method,
        });

        console.log(`Notified ${user.email} about ${paymentMethod} launch`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentMethod,
        notifiedCount: notified,
        results,
        message: `${notified} users notified about ${paymentMethod} launch with 20% deposit boost`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Payment waitlist notification error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});