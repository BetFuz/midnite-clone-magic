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

    const { userId, transactionType, amount } = await req.json();

    console.log(`AML check for user ${userId}: ${transactionType} ${amount}`);

    const alerts = [];

    // Check 1: Duplicate BVN (mock - would check profiles table for BVN duplicates)
    const { data: profileCheck } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    // Check 2: Structuring deposits (multiple small deposits < 50k within 24h)
    if (transactionType === 'deposit' && amount < 50000) {
      const { data: recentDeposits } = await supabase
        .from('ledger_entries')
        .select('amount')
        .eq('user_id', userId)
        .eq('transaction_type', 'deposit')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (recentDeposits && recentDeposits.length > 5) {
        alerts.push({
          alert_type: 'structuring',
          severity: 'high',
          description: `Multiple small deposits detected: ${recentDeposits.length} deposits in 24h`,
          metadata: { deposit_count: recentDeposits.length, amounts: recentDeposits.map(d => d.amount) }
        });
      }
    }

    // Check 3: Round-trip transfers (deposit then immediate withdrawal)
    if (transactionType === 'withdrawal') {
      const { data: recentDeposit } = await supabase
        .from('ledger_entries')
        .select('amount, created_at')
        .eq('user_id', userId)
        .eq('transaction_type', 'deposit')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // 1 hour
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (recentDeposit && Math.abs(recentDeposit.amount - amount) < 1000) {
        alerts.push({
          alert_type: 'round_trip',
          severity: 'critical',
          description: 'Potential money laundering: deposit followed by immediate withdrawal',
          metadata: { 
            deposit_amount: recentDeposit.amount, 
            withdrawal_amount: amount,
            time_diff_minutes: (Date.now() - new Date(recentDeposit.created_at).getTime()) / 60000
          }
        });
      }
    }

    // Insert alerts if any
    if (alerts.length > 0) {
      for (const alert of alerts) {
        await supabase.from('aml_alerts').insert({
          user_id: userId,
          ...alert
        });
      }
    }

    return new Response(JSON.stringify({
      flagged: alerts.length > 0,
      alerts,
      safe_to_proceed: alerts.filter(a => a.severity === 'critical').length === 0
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AML check error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
