import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

    const { action, betSlipId, userId, matchId, league, totalStake, potentialWin } = await req.json();

    if (action === 'check_delay_required') {
      // Check if league requires bet delay
      const { data: leagueConfig } = await supabase
        .from('high_risk_leagues')
        .select('*')
        .eq('league_name', league)
        .eq('is_active', true)
        .single();

      if (!leagueConfig) {
        return new Response(
          JSON.stringify({ delayRequired: false, message: 'League not in high-risk list' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create delay record
      const delaySeconds = leagueConfig.bet_delay_seconds;
      const expiresAt = new Date(Date.now() + delaySeconds * 1000).toISOString();

      const { data: delay, error } = await supabase
        .from('bet_delays')
        .insert({
          bet_slip_id: betSlipId,
          user_id: userId,
          match_id: matchId,
          league: league,
          total_stake: totalStake,
          potential_win: potentialWin,
          delay_seconds: delaySeconds,
          expires_at: expiresAt,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          delayRequired: true,
          delay,
          message: `Bet delayed for ${delaySeconds} seconds - trader review required`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'accept_bet') {
      const authHeader = req.headers.get('Authorization');
      const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', '') || '');
      
      const { delayId, reason } = await req.json();

      const { data: delay, error } = await supabase
        .from('bet_delays')
        .update({
          status: 'accepted',
          trader_id: user?.id,
          decision_reason: reason || 'Accepted by trader',
          decided_at: new Date().toISOString()
        })
        .eq('id', delayId)
        .select()
        .single();

      if (error) throw error;

      // Process bet normally
      // (This would trigger the normal bet placement flow)

      return new Response(
        JSON.stringify({ delay, message: 'Bet accepted and processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'reject_bet') {
      const authHeader = req.headers.get('Authorization');
      const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', '') || '');
      
      const { delayId, reason } = await req.json();

      const { data: delay, error } = await supabase
        .from('bet_delays')
        .update({
          status: 'rejected',
          trader_id: user?.id,
          decision_reason: reason || 'Rejected by trader',
          decided_at: new Date().toISOString()
        })
        .eq('id', delayId)
        .select()
        .single();

      if (error) throw error;

      // Refund stake to user
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', delay.user_id)
        .single();

      const { error: refundError } = await supabase
        .from('profiles')
        .update({ 
          balance: (profile?.balance || 0) + delay.total_stake
        })
        .eq('id', delay.user_id);

      if (refundError) throw refundError;

      return new Response(
        JSON.stringify({ delay, message: 'Bet rejected and stake refunded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_pending_delays') {
      const { data: delays } = await supabase
        .from('bet_delays')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true });

      return new Response(
        JSON.stringify({ delays }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'expire_delays') {
      // Auto-expire delays past their expiry time
      const { data: expired, error } = await supabase
        .from('bet_delays')
        .update({ status: 'expired' })
        .eq('status', 'pending')
        .lt('expires_at', new Date().toISOString())
        .select();

      if (error) throw error;

      // Refund stakes for expired bets
      for (const delay of expired || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', delay.user_id)
          .single();

        await supabase
          .from('profiles')
          .update({ 
            balance: (profile?.balance || 0) + delay.total_stake
          })
          .eq('id', delay.user_id);
      }

      return new Response(
        JSON.stringify({ 
          expiredCount: expired?.length || 0,
          message: 'Expired delays processed and refunded'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error: any) {
    console.error('Error in bet-delay-processor:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
