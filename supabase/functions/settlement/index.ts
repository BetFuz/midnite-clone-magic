import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createServiceClient } from '../_shared/supabase-client.ts';
import { corsHeaders, handleCorsOptions, jsonResponse } from '../_shared/cors.ts';

// TODO: DEV – call Go settlement service before commit
// This is a STUB function for bet settlement
// Production: Replace with call to Go microservice for settlement logic

interface SettlementRequest {
  bet_id: string;
  result: 'won' | 'lost' | 'void';
  winnings?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const expectedToken = Deno.env.get('N8N_BEARER_TOKEN');
    
    if (token !== expectedToken) {
      return jsonResponse({ error: 'Invalid token' }, 401);
    }

    const body: SettlementRequest = await req.json();
    console.log('Settlement request:', body);

    if (!body.bet_id || !body.result) {
      return jsonResponse({ error: 'bet_id and result are required' }, 400);
    }

    const supabase = createServiceClient();

    // TODO: Uncomment when GO_SETTLEMENT_SERVICE_URL is configured
    /*
    const goServiceUrl = Deno.env.get('GO_SETTLEMENT_SERVICE_URL');
    if (goServiceUrl) {
      const settlementResult = await fetch(`${goServiceUrl}/settle`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('GO_SERVICE_AUTH_TOKEN')}`
        },
        body: JSON.stringify({
          bet_id: body.bet_id,
          result: body.result,
          winnings: body.winnings,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!settlementResult.ok) {
        throw new Error('Go settlement service failed');
      }
      
      const settlementData = await settlementResult.json();
      console.log('Settlement processed by Go service:', settlementData);
      
      return jsonResponse({
        success: true,
        message: 'Settlement processed',
        bet_id: body.bet_id,
        result: body.result,
        data: settlementData
      });
    }
    */

    // STUB IMPLEMENTATION - Remove when Go service is ready
    console.log('[STUB] Settlement processing without Go service:', body);

    // Start transaction
    const { data: bet, error: betError } = await supabase
      .from('bet_slips')
      .select('user_id, total_stake')
      .eq('id', body.bet_id)
      .single();

    if (betError || !bet) {
      console.error('Bet not found:', betError);
      return jsonResponse({ error: 'Bet not found' }, 404);
    }

    // Update bet status
    const { error: updateError } = await supabase
      .from('bet_slips')
      .update({ 
        status: body.result,
        settled_at: new Date().toISOString()
      })
      .eq('id', body.bet_id);

    if (updateError) {
      console.error('Error updating bet:', updateError);
      return jsonResponse({ error: 'Failed to update bet' }, 500);
    }

    // Update user balance if won
    if (body.result === 'won' && body.winnings) {
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', bet.user_id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return jsonResponse({ error: 'Failed to update balance' }, 500);
      }

      const newBalance = (currentProfile?.balance || 0) + body.winnings;

      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', bet.user_id);

      if (balanceError) {
        console.error('Error updating balance:', balanceError);
        return jsonResponse({ error: 'Failed to update balance' }, 500);
      }

      console.log(`Balance updated for user ${bet.user_id}: +₦${body.winnings}`);
    }

    // Update user statistics
    await supabase.from('user_statistics').upsert({
      user_id: bet.user_id,
      [`total_${body.result === 'won' ? 'wins' : body.result === 'lost' ? 'losses' : 'pending'}`]: 1
    }, {
      onConflict: 'user_id',
      ignoreDuplicates: false
    });

    // Broadcast balance change to realtime channel
    const channel = supabase.channel(`user:${bet.user_id}`);
    await channel.send({
      type: 'broadcast',
      event: 'balance_change',
      payload: {
        bet_id: body.bet_id,
        result: body.result,
        winnings: body.winnings || 0,
        timestamp: new Date().toISOString()
      }
    });

    console.log('Settlement processed successfully');

    // Log settlement to audit trail
    await supabase.from('admin_audit_log').insert({
      admin_id: bet.user_id,
      action: 'bet_settled',
      resource_type: 'bet',
      resource_id: body.bet_id,
      status: 'success',
      payload_hash: JSON.stringify({
        result: body.result,
        winnings: body.winnings || 0,
        settled_at: new Date().toISOString()
      })
    });

    return jsonResponse({
      success: true,
      message: 'Settlement processed successfully',
      bet_id: body.bet_id,
      result: body.result,
      winnings: body.winnings || 0,
      settled_at: new Date().toISOString(),
      note: 'STUB: Add GO_SETTLEMENT_SERVICE_URL for production settlement logic'
    });

  } catch (error) {
    console.error('Error in settlement function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ error: errorMessage }, 500);
  }
});
