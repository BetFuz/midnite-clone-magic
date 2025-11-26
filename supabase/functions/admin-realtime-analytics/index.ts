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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify admin access
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      throw new Error('Invalid token');
    }

    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'superadmin']);

    if (!roles || roles.length === 0) {
      throw new Error('Admin access required');
    }

    console.log('Fetching real-time analytics for admin dashboard');

    // Get current hour stats (last 60 minutes)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Active users (users who placed bets in last hour)
    const { data: recentBets } = await supabaseClient
      .from('bet_slips')
      .select('user_id, created_at')
      .gte('created_at', oneHourAgo);

    const activeUserIds = new Set(recentBets?.map(b => b.user_id) || []);
    const activeUsers = activeUserIds.size;

    // Recent bets count
    const recentBetsCount = recentBets?.length || 0;

    // Get live bets (pending status)
    const { data: liveBets } = await supabaseClient
      .from('bet_slips')
      .select('total_stake, potential_win')
      .eq('status', 'pending');

    const liveBetsCount = liveBets?.length || 0;
    const liveStake = liveBets?.reduce((sum, bet) => sum + Number(bet.total_stake), 0) || 0;
    const potentialPayout = liveBets?.reduce((sum, bet) => sum + Number(bet.potential_win), 0) || 0;

    // Get today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: todayBets } = await supabaseClient
      .from('bet_slips')
      .select('total_stake, status')
      .gte('created_at', todayStart.toISOString());

    const todayBetsCount = todayBets?.length || 0;
    const todayStaked = todayBets?.reduce((sum, bet) => sum + Number(bet.total_stake), 0) || 0;
    const todayWon = todayBets?.filter(b => b.status === 'won').length || 0;
    const todayLost = todayBets?.filter(b => b.status === 'lost').length || 0;

    // Get trending markets
    const { data: trendingMarkets } = await supabaseClient
      .from('bet_selections')
      .select('sport, league, match_id, bet_slips!inner(created_at)')
      .gte('bet_slips.created_at', oneHourAgo)
      .order('created_at', { ascending: false })
      .limit(100);

    const marketPopularity = trendingMarkets?.reduce((acc: any, selection) => {
      const key = `${selection.sport} - ${selection.league}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}) || {};

    const topMarkets = Object.entries(marketPopularity)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([market, count]) => ({ market, count }));

    // Get recent user registrations (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: newUsersToday } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneDayAgo);

    // Get system health metrics
    const { count: totalUsers } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: totalMatches } = await supabaseClient
      .from('matches')
      .select('*', { count: 'exact', head: true });

    // Calculate average bet size
    const avgBetSize = recentBetsCount > 0 && recentBets
      ? recentBets.reduce((sum, bet) => {
          const betData = liveBets?.find(lb => lb.total_stake);
          return sum + (betData ? Number(betData.total_stake) : 0);
        }, 0) / recentBetsCount
      : 0;

    const analytics = {
      timestamp: new Date().toISOString(),
      realtime: {
        activeUsers,
        recentBetsCount,
        liveBetsCount,
        liveStake,
        potentialPayout,
        avgBetSize,
      },
      today: {
        totalBets: todayBetsCount,
        totalStaked: todayStaked,
        won: todayWon,
        lost: todayLost,
        pending: todayBetsCount - todayWon - todayLost,
        newUsers: newUsersToday || 0,
      },
      trending: {
        markets: topMarkets,
      },
      system: {
        totalUsers: totalUsers || 0,
        totalMatches: totalMatches || 0,
        status: 'operational',
      },
    };

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-realtime-analytics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});