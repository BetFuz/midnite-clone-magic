import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SettlementRequest {
  action: 'settle_bet' | 'settle_match' | 'auto_settle';
  betId?: string;
  matchId?: string;
  result?: 'won' | 'lost' | 'void';
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

    const body: SettlementRequest = await req.json();
    console.log('Settlement action:', body.action);

    let result: any = {};

    switch (body.action) {
      case 'settle_bet': {
        if (!body.betId || !body.result) {
          throw new Error('betId and result required');
        }

        // Get bet details
        const { data: bet } = await supabaseClient
          .from('bet_slips')
          .select('*, profiles(balance)')
          .eq('id', body.betId)
          .single();

        if (!bet) {
          throw new Error('Bet not found');
        }

        if (bet.status !== 'pending') {
          throw new Error('Bet already settled');
        }

        // Update bet status
        const { error: updateError } = await supabaseClient
          .from('bet_slips')
          .update({ 
            status: body.result,
            settled_at: new Date().toISOString(),
          })
          .eq('id', body.betId);

        if (updateError) throw updateError;

        // Update user balance if won
        if (body.result === 'won') {
          const newBalance = Number((bet.profiles as any)?.balance || 0) + Number(bet.potential_win);
          await supabaseClient
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', bet.user_id);
        }

        // Update user statistics
        const { data: stats } = await supabaseClient
          .from('user_statistics')
          .select('*')
          .eq('user_id', bet.user_id)
          .single();

        if (stats) {
          const updates: any = {};
          if (body.result === 'won') {
            updates.total_wins = (stats.total_wins || 0) + 1;
            updates.total_returns = (stats.total_returns || 0) + Number(bet.potential_win);
            updates.current_streak = (stats.current_streak || 0) + 1;
            updates.best_streak = Math.max(stats.best_streak || 0, updates.current_streak);
          } else if (body.result === 'lost') {
            updates.total_losses = (stats.total_losses || 0) + 1;
            updates.current_streak = 0;
          }

          await supabaseClient
            .from('user_statistics')
            .update(updates)
            .eq('user_id', bet.user_id);
        }

        // Log settlement
        await supabaseClient.rpc('log_admin_action', {
          _admin_id: user.id,
          _action: 'SETTLE_BET',
          _resource_type: 'bet',
          _resource_id: body.betId,
          _payload_hash: body.result,
          _status: 'success',
        });

        result = { 
          success: true, 
          message: `Bet settled as ${body.result}`,
          betId: body.betId,
          payout: body.result === 'won' ? bet.potential_win : 0,
        };
        break;
      }

      case 'settle_match': {
        if (!body.matchId || !body.result) {
          throw new Error('matchId and result required');
        }

        // Get all pending bets for this match
        const { data: matchBets } = await supabaseClient
          .from('bet_selections')
          .select('bet_slip_id, bet_slips!inner(*)')
          .eq('match_id', body.matchId)
          .eq('bet_slips.status', 'pending');

        if (!matchBets || matchBets.length === 0) {
          result = { success: true, message: 'No pending bets for this match', settled: 0 };
          break;
        }

        // Settle all bets for this match
        const settledBets = [];
        for (const bet of matchBets) {
          const betSlip = bet.bet_slips as any;
          
          await supabaseClient
            .from('bet_slips')
            .update({
              status: body.result,
              settled_at: new Date().toISOString(),
            })
            .eq('id', bet.bet_slip_id);

          if (body.result === 'won') {
            const { data: profile } = await supabaseClient
              .from('profiles')
              .select('balance')
              .eq('id', betSlip.user_id)
              .single();

            const newBalance = Number(profile?.balance || 0) + Number(betSlip.potential_win);
            await supabaseClient
              .from('profiles')
              .update({ balance: newBalance })
              .eq('id', betSlip.user_id);
          }

          settledBets.push(bet.bet_slip_id);
        }

        // Log settlement
        await supabaseClient.rpc('log_admin_action', {
          _admin_id: user.id,
          _action: 'SETTLE_MATCH',
          _resource_type: 'match',
          _resource_id: body.matchId,
          _payload_hash: `${body.result} - ${settledBets.length} bets`,
          _status: 'success',
        });

        result = {
          success: true,
          message: `Settled ${settledBets.length} bets for match`,
          matchId: body.matchId,
          settledBets: settledBets.length,
        };
        break;
      }

      case 'auto_settle': {
        // TODO: In production, this would integrate with match result APIs
        // For now, return stats on pending bets
        const { data: pendingBets } = await supabaseClient
          .from('bet_slips')
          .select('id, created_at, total_stake')
          .eq('status', 'pending')
          .order('created_at', { ascending: true })
          .limit(100);

        result = {
          success: true,
          message: 'Auto-settlement would run here',
          pendingBets: pendingBets?.length || 0,
          oldestPending: pendingBets?.[0]?.created_at || null,
        };
        break;
      }

      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-bet-settlement:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});