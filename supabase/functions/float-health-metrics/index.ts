import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    // 1. Calculate total user balances (available to pay winners)
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('balance');

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    const totalUserBalances = profiles.reduce(
      (sum, profile) => sum + parseFloat(profile.balance?.toString() || '0'),
      0
    );

    // 2. Calculate locked in open bets (pending bets)
    const { data: openBets, error: openBetsError } = await supabaseClient
      .from('bet_slips')
      .select('total_stake, potential_win')
      .in('status', ['pending', 'active']);

    if (openBetsError) {
      throw new Error(`Failed to fetch open bets: ${openBetsError.message}`);
    }

    const totalLockedInBets = openBets.reduce(
      (sum, bet) => sum + parseFloat(bet.total_stake?.toString() || '0'),
      0
    );

    const totalPotentialWinnings = openBets.reduce(
      (sum, bet) => sum + parseFloat(bet.potential_win?.toString() || '0'),
      0
    );

    // 3. Calculate reserved for bonuses
    // This would come from a bonus_accounts table or calculated from ledger entries
    const { data: bonusEntries, error: bonusError } = await supabaseClient
      .from('ledger_entries')
      .select('amount')
      .eq('transaction_type', 'bonus')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    if (bonusError) {
      console.error('Failed to fetch bonus entries:', bonusError);
    }

    const totalBonusReserved = bonusEntries?.reduce(
      (sum, entry) => sum + parseFloat(entry.amount?.toString() || '0'),
      0
    ) || 0;

    // 4. Calculate total revenue (from ledger)
    const { data: revenue, error: revenueError } = await supabaseClient
      .from('ledger_entries')
      .select('amount')
      .in('transaction_type', ['deposit', 'bet_lost']);

    if (revenueError) {
      console.error('Failed to fetch revenue:', revenueError);
    }

    const totalRevenue = revenue?.reduce(
      (sum, entry) => sum + Math.abs(parseFloat(entry.amount?.toString() || '0')),
      0
    ) || 0;

    // 5. Calculate total payouts
    const { data: payouts, error: payoutsError } = await supabaseClient
      .from('ledger_entries')
      .select('amount')
      .in('transaction_type', ['withdrawal', 'bet_won']);

    if (payoutsError) {
      console.error('Failed to fetch payouts:', payoutsError);
    }

    const totalPayouts = payouts?.reduce(
      (sum, entry) => sum + Math.abs(parseFloat(entry.amount?.toString() || '0')),
      0
    ) || 0;

    // Calculate available float
    const availableFloat = totalUserBalances - totalLockedInBets - totalBonusReserved;

    // Calculate max payout exposure (worst case: all pending bets win)
    const maxPayoutExposure = totalPotentialWinnings - totalLockedInBets;

    // Calculate health ratio (available / max exposure)
    const healthRatio = maxPayoutExposure > 0 ? (availableFloat / maxPayoutExposure) * 100 : 100;

    // Determine health status
    let healthStatus: 'healthy' | 'warning' | 'critical';
    if (healthRatio >= 50) {
      healthStatus = 'healthy';
    } else if (healthRatio >= 25) {
      healthStatus = 'warning';
    } else {
      healthStatus = 'critical';
    }

    // Get recent large withdrawals (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentWithdrawals, error: withdrawalsError } = await supabaseClient
      .from('ledger_entries')
      .select('amount, created_at, user_id')
      .eq('transaction_type', 'withdrawal')
      .gte('created_at', oneDayAgo)
      .order('amount', { ascending: false })
      .limit(10);

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      float_health: {
        available_to_pay_winners: availableFloat,
        locked_in_open_bets: totalLockedInBets,
        reserved_for_bonuses: totalBonusReserved,
        total_user_balances: totalUserBalances,
      },
      exposure: {
        total_potential_winnings: totalPotentialWinnings,
        max_payout_exposure: maxPayoutExposure,
        health_ratio: healthRatio,
        health_status: healthStatus,
      },
      metrics: {
        open_bets_count: openBets.length,
        total_revenue: totalRevenue,
        total_payouts: totalPayouts,
        net_revenue: totalRevenue - totalPayouts,
      },
      recent_activity: {
        large_withdrawals_24h: recentWithdrawals || [],
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error calculating float health:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
