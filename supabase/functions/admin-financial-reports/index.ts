import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate?: string;
  endDate?: string;
}

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

    const body: ReportRequest = await req.json();
    
    // Calculate date range
    let startDate = body.startDate;
    let endDate = body.endDate || new Date().toISOString();

    if (!startDate) {
      const now = new Date();
      switch (body.reportType) {
        case 'daily':
          startDate = new Date(now.setDate(now.getDate() - 1)).toISOString();
          break;
        case 'weekly':
          startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
          break;
        case 'monthly':
          startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 30)).toISOString();
      }
    }

    console.log('Generating financial report from', startDate, 'to', endDate);

    // Get bet statistics
    const { data: bets } = await supabaseClient
      .from('bet_slips')
      .select('total_stake, potential_win, status, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const totalBets = bets?.length || 0;
    const totalStaked = bets?.reduce((sum, bet) => sum + Number(bet.total_stake), 0) || 0;
    const wonBets = bets?.filter(b => b.status === 'won') || [];
    const lostBets = bets?.filter(b => b.status === 'lost') || [];
    const pendingBets = bets?.filter(b => b.status === 'pending') || [];
    
    const totalWonAmount = wonBets.reduce((sum, bet) => sum + Number(bet.potential_win), 0);
    const totalLostAmount = lostBets.reduce((sum, bet) => sum + Number(bet.total_stake), 0);
    const pendingAmount = pendingBets.reduce((sum, bet) => sum + Number(bet.total_stake), 0);
    
    const platformProfit = totalLostAmount - totalWonAmount;
    const platformMargin = totalStaked > 0 ? (platformProfit / totalStaked) * 100 : 0;

    // Get user registrations
    const { count: newUsers } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Get top betting users
    const { data: topUsers } = await supabaseClient
      .from('bet_slips')
      .select('user_id, profiles(email), total_stake')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('total_stake', { ascending: false })
      .limit(10);

    // Get sport distribution
    const { data: sportBets } = await supabaseClient
      .from('bet_selections')
      .select('sport, bet_slips!inner(created_at)')
      .gte('bet_slips.created_at', startDate)
      .lte('bet_slips.created_at', endDate);

    const sportDistribution = sportBets?.reduce((acc: any, bet) => {
      acc[bet.sport] = (acc[bet.sport] || 0) + 1;
      return acc;
    }, {}) || {};

    // Daily breakdown
    const dailyStats = bets?.reduce((acc: any, bet) => {
      const date = new Date(bet.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { totalBets: 0, totalStaked: 0, won: 0, lost: 0 };
      }
      acc[date].totalBets++;
      acc[date].totalStaked += Number(bet.total_stake);
      if (bet.status === 'won') acc[date].won++;
      if (bet.status === 'lost') acc[date].lost++;
      return acc;
    }, {}) || {};

    // Log report generation
    await supabaseClient.rpc('log_admin_action', {
      _admin_id: user.id,
      _action: 'GENERATE_FINANCIAL_REPORT',
      _resource_type: 'report',
      _resource_id: body.reportType,
      _status: 'success',
    });

    const report = {
      period: {
        type: body.reportType,
        startDate,
        endDate,
      },
      summary: {
        totalBets,
        totalStaked,
        totalWonAmount,
        totalLostAmount,
        pendingAmount,
        platformProfit,
        platformMargin: platformMargin.toFixed(2) + '%',
        newUsers: newUsers || 0,
      },
      bets: {
        won: wonBets.length,
        lost: lostBets.length,
        pending: pendingBets.length,
        winRate: totalBets > 0 ? ((wonBets.length / totalBets) * 100).toFixed(2) + '%' : '0%',
      },
      topUsers: topUsers?.map(u => ({
        email: (u.profiles as any)?.email || 'Unknown',
        totalStaked: Number(u.total_stake),
      })) || [],
      sportDistribution,
      dailyStats,
      generatedAt: new Date().toISOString(),
      generatedBy: user.email,
    };

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-financial-reports:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});