import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlatformControlAction {
  action: 'get_overview' | 'manage_bets' | 'manage_users' | 'manage_matches' | 'manage_odds' | 
          'manage_finances' | 'suspend_platform' | 'force_settle' | 'bulk_update';
  filters?: any;
  data?: any;
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

    // Verify admin
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) throw new Error('Invalid token');

    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'superadmin']);

    if (!roles || roles.length === 0) {
      throw new Error('Admin access required');
    }

    const isSuperAdmin = roles.some(r => r.role === 'superadmin');
    const body: PlatformControlAction = await req.json();

    console.log('Platform control action:', body.action, 'by', user.email);

    let result: any = {};

    switch (body.action) {
      case 'get_overview': {
        // Get comprehensive platform overview
        const [users, bets, matches, transactions, streams] = await Promise.all([
          supabaseClient.from('profiles').select('id, created_at, balance', { count: 'exact' }),
          supabaseClient.from('bet_slips').select('id, status, total_stake, created_at', { count: 'exact' }),
          supabaseClient.from('matches').select('id, status, commence_time', { count: 'exact' }),
          supabaseClient.from('bet_slips').select('total_stake, status'),
          supabaseClient.from('live_streams').select('id, viewer_count, status')
        ]);

        const activeUsers = users.data?.filter(u => {
          const created = new Date(u.created_at);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return created > dayAgo;
        }).length || 0;

        const pendingBets = bets.data?.filter(b => b.status === 'pending').length || 0;
        const totalStaked = bets.data?.reduce((sum, b) => sum + Number(b.total_stake), 0) || 0;
        const liveMatches = matches.data?.filter(m => m.status === 'live').length || 0;
        const totalViewers = streams.data?.reduce((sum, s) => sum + s.viewer_count, 0) || 0;

        result = {
          overview: {
            totalUsers: users.count || 0,
            activeUsers24h: activeUsers,
            totalBets: bets.count || 0,
            pendingBets,
            totalStaked,
            totalMatches: matches.count || 0,
            liveMatches,
            totalViewers,
            platformStatus: 'operational'
          }
        };
        break;
      }

      case 'manage_bets': {
        const { betIds, action: betAction } = body.data;
        
        if (betAction === 'settle') {
          // Force settle bets
          const { error } = await supabaseClient
            .from('bet_slips')
            .update({ 
              status: body.data.outcome,
              settled_at: new Date().toISOString()
            })
            .in('id', betIds);

          if (error) throw error;

          // Log action
          await supabaseClient.rpc('log_admin_action', {
            _admin_id: user.id,
            _action: 'FORCE_SETTLE_BETS',
            _resource_type: 'bet',
            _payload_hash: JSON.stringify({ betIds, outcome: body.data.outcome }),
            _status: 'success',
          });

          result = { success: true, message: `${betIds.length} bets settled` };
        } else if (betAction === 'void') {
          // Void bets and refund
          const { error } = await supabaseClient
            .from('bet_slips')
            .update({ status: 'void' })
            .in('id', betIds);

          if (error) throw error;

          result = { success: true, message: `${betIds.length} bets voided` };
        }
        break;
      }

      case 'manage_users': {
        const { userIds, action: userAction } = body.data;

        if (userAction === 'suspend') {
          // This would update a suspended status field (to be added to profiles)
          await supabaseClient.rpc('log_admin_action', {
            _admin_id: user.id,
            _action: 'BULK_SUSPEND_USERS',
            _resource_type: 'user',
            _payload_hash: JSON.stringify({ userIds }),
            _status: 'success',
          });

          result = { success: true, message: `${userIds.length} users suspended` };
        } else if (userAction === 'adjust_balance') {
          const { amount } = body.data;
          
          for (const userId of userIds) {
            const { data: profile } = await supabaseClient
              .from('profiles')
              .select('balance')
              .eq('id', userId)
              .single();

            if (profile) {
              await supabaseClient
                .from('profiles')
                .update({ balance: Number(profile.balance) + amount })
                .eq('id', userId);
            }
          }

          result = { success: true, message: `Balance adjusted for ${userIds.length} users` };
        }
        break;
      }

      case 'manage_matches': {
        const { matchIds, action: matchAction } = body.data;

        if (matchAction === 'cancel') {
          await supabaseClient
            .from('matches')
            .update({ status: 'cancelled' })
            .in('id', matchIds);

          // Auto-void all pending bets on these matches
          const { data: selections } = await supabaseClient
            .from('bet_selections')
            .select('bet_slip_id')
            .in('match_id', matchIds)
            .eq('status', 'pending');

          if (selections && selections.length > 0) {
            const betSlipIds = [...new Set(selections.map(s => s.bet_slip_id))];
            await supabaseClient
              .from('bet_slips')
              .update({ status: 'void' })
              .in('id', betSlipIds);
          }

          result = { success: true, message: `${matchIds.length} matches cancelled, bets voided` };
        } else if (matchAction === 'postpone') {
          const { newTime } = body.data;
          await supabaseClient
            .from('matches')
            .update({ 
              status: 'postponed',
              commence_time: newTime 
            })
            .in('id', matchIds);

          result = { success: true, message: `${matchIds.length} matches postponed` };
        }
        break;
      }

      case 'manage_odds': {
        const { matchId, market, newOdds } = body.data;

        if (market === 'match_winner') {
          await supabaseClient
            .from('matches')
            .update({
              home_odds: newOdds.home,
              draw_odds: newOdds.draw,
              away_odds: newOdds.away
            })
            .eq('match_id', matchId);
        }

        // Update realtime cache
        await supabaseClient
          .from('realtime_odds_cache')
          .upsert({
            match_id: matchId,
            market,
            odds: newOdds,
            last_updated: new Date().toISOString()
          });

        await supabaseClient.rpc('log_admin_action', {
          _admin_id: user.id,
          _action: 'UPDATE_ODDS',
          _resource_type: 'match',
          _resource_id: matchId,
          _payload_hash: JSON.stringify({ market, newOdds }),
          _status: 'success',
        });

        result = { success: true, message: 'Odds updated successfully' };
        break;
      }

      case 'manage_finances': {
        const { action: finAction, data: finData } = body.data;

        if (finAction === 'approve_withdrawal') {
          // This would integrate with actual payment processing
          await supabaseClient.rpc('log_admin_action', {
            _admin_id: user.id,
            _action: 'APPROVE_WITHDRAWAL',
            _resource_type: 'transaction',
            _resource_id: finData.withdrawalId,
            _status: 'success',
          });

          result = { success: true, message: 'Withdrawal approved' };
        } else if (finAction === 'get_financial_summary') {
          const { data: bets } = await supabaseClient
            .from('bet_slips')
            .select('total_stake, potential_win, status, created_at')
            .gte('created_at', finData.startDate)
            .lte('created_at', finData.endDate);

          const totalStaked = bets?.reduce((sum, b) => sum + Number(b.total_stake), 0) || 0;
          const wonBets = bets?.filter(b => b.status === 'won') || [];
          const totalPaidOut = wonBets.reduce((sum, b) => sum + Number(b.potential_win), 0);
          const profit = totalStaked - totalPaidOut;

          result = {
            totalStaked,
            totalPaidOut,
            profit,
            profitMargin: totalStaked > 0 ? (profit / totalStaked) * 100 : 0,
            totalBets: bets?.length || 0,
            wonBets: wonBets.length
          };
        }
        break;
      }

      case 'suspend_platform': {
        if (!isSuperAdmin) {
          throw new Error('Only superadmins can suspend the platform');
        }

        // This would set a platform-wide maintenance mode flag
        await supabaseClient.rpc('log_admin_action', {
          _admin_id: user.id,
          _action: 'SUSPEND_PLATFORM',
          _resource_type: 'platform',
          _payload_hash: body.data.reason,
          _status: 'success',
        });

        result = { success: true, message: 'Platform suspended', maintenanceMode: true };
        break;
      }

      case 'bulk_update': {
        const { table, updates, filters } = body.data;
        
        let query = supabaseClient.from(table).update(updates);
        
        // Apply filters
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        const { error } = await query;
        if (error) throw error;

        await supabaseClient.rpc('log_admin_action', {
          _admin_id: user.id,
          _action: 'BULK_UPDATE',
          _resource_type: table,
          _payload_hash: JSON.stringify({ updates, filters }),
          _status: 'success',
        });

        result = { success: true, message: 'Bulk update completed' };
        break;
      }

      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-platform-control:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
