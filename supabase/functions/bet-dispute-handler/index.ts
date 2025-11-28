import { createClientWithAuth } from '../_shared/supabase-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DisputeRequest {
  betSlipId: string;
  reason: string;
  details?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClientWithAuth(authHeader);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { betSlipId, reason, details }: DisputeRequest = await req.json();

    if (!betSlipId || !reason) {
      throw new Error('Missing required fields: betSlipId, reason');
    }

    // Verify bet belongs to user and is settled
    const { data: betSlip, error: betError } = await supabase
      .from('bet_slips')
      .select('*')
      .eq('id', betSlipId)
      .eq('user_id', user.id)
      .single();

    if (betError || !betSlip) {
      throw new Error('Bet slip not found or does not belong to user');
    }

    if (betSlip.status !== 'won' && betSlip.status !== 'lost') {
      throw new Error('Only settled bets can be disputed');
    }

    // Calculate frozen amount
    const frozenAmount = betSlip.status === 'won' ? betSlip.potential_win : 0;

    // Create Zendesk ticket (stub - TODO: integrate with Zendesk API)
    const zendeskTicketId = `ZD-${Date.now()}-${betSlipId.substring(0, 8)}`;
    
    // TODO: Uncomment when Zendesk is configured
    // const zendeskToken = Deno.env.get('ZENDESK_API_TOKEN');
    // const zendeskSubdomain = Deno.env.get('ZENDESK_SUBDOMAIN');
    // if (zendeskToken && zendeskSubdomain) {
    //   const zendeskResponse = await fetch(
    //     `https://${zendeskSubdomain}.zendesk.com/api/v2/tickets.json`,
    //     {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Basic ${btoa(Deno.env.get('ZENDESK_EMAIL') + '/token:' + zendeskToken)}`,
    //       },
    //       body: JSON.stringify({
    //         ticket: {
    //           subject: `Bet Dispute - ${betSlipId}`,
    //           comment: {
    //             body: `User ${user.email} has disputed bet ${betSlipId}\n\nReason: ${reason}\n\nDetails: ${details || 'N/A'}`,
    //           },
    //           priority: 'high',
    //           tags: ['bet-dispute', 'requires-trader-review'],
    //         },
    //       }),
    //     }
    //   );
    //   const zendeskData = await zendeskResponse.json();
    //   zendeskTicketId = zendeskData.ticket.id.toString();
    // }

    // Create dispute record
    const { data: dispute, error: disputeError } = await supabase
      .from('bet_disputes')
      .insert({
        user_id: user.id,
        bet_slip_id: betSlipId,
        dispute_reason: reason,
        dispute_details: details,
        zendesk_ticket_id: zendeskTicketId,
        winnings_frozen: frozenAmount > 0,
        frozen_amount: frozenAmount,
      })
      .select()
      .single();

    if (disputeError) throw disputeError;

    // If winnings need to be frozen, deduct from user balance
    if (frozenAmount > 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ balance: profile.balance - frozenAmount })
          .eq('id', user.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        dispute,
        message: `Dispute created successfully. Ticket ID: ${zendeskTicketId}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Bet dispute handler error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
