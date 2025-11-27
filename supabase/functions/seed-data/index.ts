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

    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create sample bet slips for the user
    const now = new Date();
    const betSlips = [];

    // Pending bets
    for (let i = 0; i < 5; i++) {
      const stake = Math.floor(Math.random() * 50000) + 5000;
      const odds = (Math.random() * 3 + 1.5).toFixed(2);
      const { data: betSlip } = await supabaseClient
        .from('bet_slips')
        .insert({
          user_id: userId,
          bet_type: Math.random() > 0.5 ? 'single' : 'accumulator',
          total_stake: stake,
          total_odds: parseFloat(odds),
          potential_win: stake * parseFloat(odds),
          status: 'pending',
          created_at: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();
      
      if (betSlip) betSlips.push(betSlip);
    }

    // Won bets
    for (let i = 0; i < 3; i++) {
      const stake = Math.floor(Math.random() * 50000) + 5000;
      const odds = (Math.random() * 3 + 1.5).toFixed(2);
      const { data: betSlip } = await supabaseClient
        .from('bet_slips')
        .insert({
          user_id: userId,
          bet_type: Math.random() > 0.5 ? 'single' : 'accumulator',
          total_stake: stake,
          total_odds: parseFloat(odds),
          potential_win: stake * parseFloat(odds),
          status: 'won',
          created_at: new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
          settled_at: new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();
      
      if (betSlip) betSlips.push(betSlip);
    }

    // Lost bets
    for (let i = 0; i < 2; i++) {
      const stake = Math.floor(Math.random() * 50000) + 5000;
      const odds = (Math.random() * 3 + 1.5).toFixed(2);
      const { data: betSlip } = await supabaseClient
        .from('bet_slips')
        .insert({
          user_id: userId,
          bet_type: Math.random() > 0.5 ? 'single' : 'accumulator',
          total_stake: stake,
          total_odds: parseFloat(odds),
          potential_win: stake * parseFloat(odds),
          status: 'lost',
          created_at: new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
          settled_at: new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();
      
      if (betSlip) betSlips.push(betSlip);
    }

    // Get sample matches to create bet selections
    const { data: matches } = await supabaseClient
      .from('matches')
      .select('*')
      .limit(20);

    // Create bet selections for each bet slip
    for (const betSlip of betSlips) {
      const numSelections = betSlip.bet_type === 'single' ? 1 : Math.floor(Math.random() * 4) + 2;
      const selectedMatches = matches?.slice(0, numSelections) || [];

      for (const match of selectedMatches) {
        const selectionTypes = ['home_win', 'draw', 'away_win', 'over_2.5', 'under_2.5', 'both_teams_score'];
        const selectionType = selectionTypes[Math.floor(Math.random() * selectionTypes.length)];
        
        await supabaseClient
          .from('bet_selections')
          .insert({
            bet_slip_id: betSlip.id,
            match_id: match.match_id,
            sport: match.sport_title,
            league: match.league_name,
            home_team: match.home_team,
            away_team: match.away_team,
            match_time: match.commence_time,
            selection_type: selectionType,
            selection_value: selectionType.includes('win') ? selectionType.split('_')[0] : selectionType,
            odds: match.home_odds || 2.0,
            status: betSlip.status
          });
      }
    }

    // Create sample user statistics
    const totalStaked = betSlips.reduce((sum, bet) => sum + Number(bet.total_stake), 0);
    const wonBets = betSlips.filter(b => b.status === 'won');
    const totalReturns = wonBets.reduce((sum, bet) => sum + Number(bet.potential_win), 0);

    await supabaseClient
      .from('user_statistics')
      .upsert({
        user_id: userId,
        total_bets: betSlips.length,
        total_wins: wonBets.length,
        total_losses: betSlips.filter(b => b.status === 'lost').length,
        total_pending: betSlips.filter(b => b.status === 'pending').length,
        total_staked: totalStaked,
        total_returns: totalReturns,
        profit_loss: totalReturns - totalStaked,
        win_rate: betSlips.length > 0 ? (wonBets.length / betSlips.length) * 100 : 0,
        current_streak: 2,
        best_streak: 5,
        biggest_win: wonBets.length > 0 ? Math.max(...wonBets.map(b => Number(b.potential_win))) : 0,
        biggest_loss: betSlips.filter(b => b.status === 'lost').length > 0 
          ? Math.max(...betSlips.filter(b => b.status === 'lost').map(b => Number(b.total_stake))) 
          : 0,
        favorite_sport: 'Soccer'
      }, {
        onConflict: 'user_id'
      });

    // Create sample leaderboard entry
    await supabaseClient
      .from('leaderboard_entries')
      .upsert({
        user_id: userId,
        week_start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString().split('T')[0],
        total_points: Math.floor(Math.random() * 1000) + 500,
        total_bets: betSlips.length,
        total_wins: wonBets.length,
        win_streak: Math.floor(Math.random() * 5) + 1,
        bonus_points: Math.floor(Math.random() * 200),
        rank: Math.floor(Math.random() * 50) + 1,
        reward_tier: ['Bronze', 'Silver', 'Gold'][Math.floor(Math.random() * 3)]
      }, {
        onConflict: 'user_id,week_start'
      });

    // Create sample admin audit log entries
    const adminActions = [
      { action: 'USER_VIEW', resource_type: 'users', status: 'success' },
      { action: 'BET_SETTLEMENT', resource_type: 'bets', status: 'success' },
      { action: 'ODDS_UPDATE', resource_type: 'matches', status: 'success' },
      { action: 'FINANCIAL_REPORT', resource_type: 'reports', status: 'success' },
      { action: 'WEBHOOK_CONFIG', resource_type: 'webhooks', status: 'success' },
    ];

    for (const action of adminActions) {
      await supabaseClient
        .from('admin_audit_log')
        .insert({
          admin_id: userId,
          action: action.action,
          resource_type: action.resource_type,
          status: action.status,
          created_at: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sample data seeded successfully',
        stats: {
          betSlips: betSlips.length,
          pending: betSlips.filter(b => b.status === 'pending').length,
          won: wonBets.length,
          lost: betSlips.filter(b => b.status === 'lost').length
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding data:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
