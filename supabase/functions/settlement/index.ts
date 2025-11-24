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

    // TODO: DEV – Call Go settlement service here
    // const goServiceUrl = Deno.env.get('GO_SETTLEMENT_SERVICE_URL');
    // const settlementResult = await fetch(`${goServiceUrl}/settle`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(body)
    // });
    // const settlementData = await settlementResult.json();

    // Start transaction (stub implementation)
    // In production, this would be handled by the Go service
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
      const { error: balanceError } = await supabase.rpc(
        'increment_balance',
        { 
          user_id: bet.user_id,
          amount: body.winnings 
        }
      );

      if (balanceError) {
        console.error('Error updating balance:', balanceError);
      }
    }

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

    return jsonResponse({
      success: true,
      message: 'Settlement processed',
      bet_id: body.bet_id,
      result: body.result,
      // TODO: DEV – Return actual settlement data from Go service
      note: 'STUB: Replace with Go settlement service call'
    });

  } catch (error) {
    console.error('Error in settlement function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ error: errorMessage }, 500);
  }
});
