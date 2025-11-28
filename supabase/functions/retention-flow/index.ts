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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const INCENTIVE_AMOUNT = 200;
    const DAILY_CAP = 50000;
    const INACTIVE_DAYS = 7;
    const today = new Date().toISOString().split('T')[0];

    // Get or create today's cap entry
    const { data: capData, error: capError } = await supabaseAdmin
      .from('daily_retention_caps')
      .select('*')
      .eq('cap_date', today)
      .maybeSingle();

    if (capError && capError.code !== 'PGRST116') throw capError;

    let currentSpent = capData?.total_spent || 0;

    if (currentSpent >= DAILY_CAP) {
      console.log('Daily cap reached:', currentSpent);
      return new Response(
        JSON.stringify({ message: 'Daily cap reached', spent: currentSpent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    if (!capData) {
      await supabaseAdmin.from('daily_retention_caps').insert({
        cap_date: today,
        total_spent: 0,
        cap_limit: DAILY_CAP,
      });
    }

    // Find inactive users (no bet in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - INACTIVE_DAYS);

    const { data: inactiveUsers, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, balance')
      .not('id', 'in', `(
        SELECT DISTINCT user_id 
        FROM bet_slips 
        WHERE created_at > '${sevenDaysAgo.toISOString()}'
      )`)
      .limit(Math.floor((DAILY_CAP - currentSpent) / INCENTIVE_AMOUNT));

    if (usersError) throw usersError;

    let credited = 0;
    const results = [];

    for (const user of inactiveUsers || []) {
      if (currentSpent + INCENTIVE_AMOUNT > DAILY_CAP) break;

      // Check if user already received incentive recently
      const { data: recentIncentive } = await supabaseAdmin
        .from('retention_incentives')
        .select('id')
        .eq('user_id', user.id)
        .gte('credited_at', sevenDaysAgo.toISOString())
        .maybeSingle();

      if (recentIncentive) continue;

      // Credit user balance
      const newBalance = (user.balance || 0) + INCENTIVE_AMOUNT;
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating balance:', updateError);
        continue;
      }

      // Log incentive
      await supabaseAdmin.from('retention_incentives').insert({
        user_id: user.id,
        amount: INCENTIVE_AMOUNT,
        days_inactive: INACTIVE_DAYS,
        metadata: { email: user.email },
      });

      // Log ledger entry
      await supabaseAdmin.rpc('log_ledger_entry', {
        p_user_id: user.id,
        p_transaction_type: 'retention_bonus',
        p_amount: INCENTIVE_AMOUNT,
        p_currency: 'NGN',
        p_balance_before: user.balance || 0,
        p_balance_after: newBalance,
        p_description: '7-day inactive retention bonus',
      });

      currentSpent += INCENTIVE_AMOUNT;
      credited++;
      results.push({ userId: user.id, amount: INCENTIVE_AMOUNT });
    }

    // Update cap
    await supabaseAdmin
      .from('daily_retention_caps')
      .update({ total_spent: currentSpent, updated_at: new Date().toISOString() })
      .eq('cap_date', today);

    console.log(`Credited ${credited} users with ₦${INCENTIVE_AMOUNT} each`);

    return new Response(
      JSON.stringify({
        success: true,
        usersProcessed: credited,
        totalSpent: currentSpent,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Retention flow error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});