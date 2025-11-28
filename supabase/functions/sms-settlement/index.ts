import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const AT_API_KEY = Deno.env.get('AFRICAS_TALKING_API_KEY');
const AT_USERNAME = Deno.env.get('AFRICAS_TALKING_USERNAME') || 'betfuz';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { betSlipId, result, winnings } = await req.json();

    // Fetch bet slip details
    const { data: betSlip, error: betError } = await supabase
      .from('bet_slips')
      .select('id, total_stake, potential_win, status, user_id')
      .eq('id', betSlipId)
      .single();

    if (betError || !betSlip) {
      return new Response(
        JSON.stringify({ error: 'Bet slip not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user profile separately
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('phone, full_name')
      .eq('id', betSlip.user_id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const phone = profile.phone;
    const name = profile.full_name || 'User';

    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'User phone number not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update bet slip status
    await supabase
      .from('bet_slips')
      .update({
        status: result,
        settled_at: new Date().toISOString(),
      })
      .eq('id', betSlipId);

    // If won, credit user balance
    if (result === 'won' && winnings) {
      await supabase.rpc('increment_balance', {
        user_id: betSlip.user_id,
        amount: winnings,
      });
    }

    // Compose SMS message
    let message = '';
    if (result === 'won') {
      message = `Congratulations ${name}! Your bet (ID: ${betSlipId.substring(0, 8)}) has WON! `;
      message += `You've won ₦${winnings?.toLocaleString()}. `;
      message += `Funds have been credited to your Betfuz account.`;
    } else if (result === 'lost') {
      message = `Hello ${name}, your bet (ID: ${betSlipId.substring(0, 8)}) has been settled as LOST. `;
      message += `Better luck next time! Visit betfuz.com for more bets.`;
    } else {
      message = `Hello ${name}, your bet (ID: ${betSlipId.substring(0, 8)}) has been settled as ${result.toUpperCase()}.`;
    }

    // Send SMS via Africa's Talking
    if (!AT_API_KEY) {
      console.warn('Africa\'s Talking API key not configured');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Bet settled but SMS not sent (API key missing)',
          smsPreview: message 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const atResponse = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': AT_API_KEY,
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        username: AT_USERNAME,
        to: phone,
        message: message,
      }),
    });

    const atData = await atResponse.json();

    console.log('SMS Response:', atData);

    return new Response(
      JSON.stringify({
        success: true,
        betSlipId,
        result,
        smsStatus: atData.SMSMessageData?.Recipients?.[0]?.status || 'unknown',
        message: 'Bet settled and SMS notification sent',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('SMS Settlement Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
