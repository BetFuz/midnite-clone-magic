import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface USSDRequest {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { sessionId, serviceCode, phoneNumber, text }: USSDRequest = await req.json();

    console.log('USSD Request:', { sessionId, serviceCode, phoneNumber, text });

    // Parse input levels (text is cumulative: "" -> "1" -> "1*ABC123" -> "1*ABC123*5000")
    const inputs = text.split('*');
    const level = inputs.length;

    let response = '';
    let isContinue = true; // CON vs END

    // Extract affiliate ID from service code: *347*88*AFF-ID#
    const affiliateIdMatch = serviceCode.match(/\*347\*88\*([A-Z0-9]+)/);
    const affiliateId = affiliateIdMatch ? affiliateIdMatch[1] : null;

    if (level === 1 && text === '') {
      // Initial menu
      response = 'CON Welcome to Betfuz USSD Betting\n';
      response += '1. Place Bet (Flash Slip)\n';
      response += '2. Check Balance\n';
      response += '3. View Bet History';
    } else if (level === 2 && inputs[0] === '1') {
      // Option 1: Place bet - ask for flash slip code
      response = 'CON Enter your 6-character Flash Slip code:';
    } else if (level === 3 && inputs[0] === '1') {
      // Decode flash slip
      const code = inputs[1].toUpperCase();

      // Call edge function to decode flash slip
      const { data: slipData, error: slipError } = await supabase.functions.invoke(
        'decode-flash-slip',
        { body: { code } }
      );

      if (slipError || !slipData?.selections) {
        response = 'END Invalid flash slip code. Please try again.';
        isContinue = false;
      } else {
        // Display bet legs
        const selections = slipData.selections;
        response = 'CON Your bet slip:\n';
        selections.forEach((sel: any, idx: number) => {
          response += `${idx + 1}. ${sel.home_team} vs ${sel.away_team}\n`;
          response += `   ${sel.selection_value} @ ${sel.odds}\n`;
        });
        response += '\nEnter stake amount (NGN):';
      }
    } else if (level === 4 && inputs[0] === '1') {
      // Place bet with stake
      const code = inputs[1].toUpperCase();
      const stake = parseInt(inputs[2]);

      if (isNaN(stake) || stake < 100) {
        response = 'END Invalid stake amount. Minimum bet is ₦100.';
        isContinue = false;
      } else {
        // Decode flash slip again
        const { data: slipData } = await supabase.functions.invoke('decode-flash-slip', {
          body: { code },
        });

        if (!slipData?.selections) {
          response = 'END Invalid flash slip code.';
          isContinue = false;
        } else {
          // Find or create user by phone number
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, balance')
            .eq('phone', phoneNumber)
            .single();

          if (profileError || !profile) {
            response = 'END User not found. Please register at betfuz.com first.';
            isContinue = false;
          } else if (profile.balance < stake) {
            response = 'END Insufficient balance. Please deposit funds.';
            isContinue = false;
          } else {
            // Place bet
            const totalOdds = slipData.selections.reduce((acc: number, sel: any) => acc * sel.odds, 1);
            const potentialWin = stake * totalOdds;

            // Create bet slip
            const { data: betSlip, error: betError } = await supabase
              .from('bet_slips')
              .insert({
                user_id: profile.id,
                total_stake: stake,
                total_odds: totalOdds,
                potential_win: potentialWin,
                status: 'pending',
                bet_type: 'multi',
              })
              .select()
              .single();

            if (betError) {
              response = 'END Failed to place bet. Please try again.';
              isContinue = false;
            } else {
              // Insert selections
              const selectionsToInsert = slipData.selections.map((sel: any) => ({
                bet_slip_id: betSlip.id,
                match_id: sel.match_id,
                home_team: sel.home_team,
                away_team: sel.away_team,
                sport: sel.sport,
                selection_type: sel.selection_type,
                selection_value: sel.selection_value,
                odds: sel.odds,
              }));

              await supabase.from('bet_selections').insert(selectionsToInsert);

              // Deduct balance
              await supabase
                .from('profiles')
                .update({ balance: profile.balance - stake })
                .eq('id', profile.id);

              // Tag affiliate for lifetime tracking if provided
              if (affiliateId) {
                await supabase.from('bet_slips').update({
                  metadata: { affiliateId },
                }).eq('id', betSlip.id);
              }

              response = `END Bet placed successfully!\n`;
              response += `Stake: ₦${stake.toLocaleString()}\n`;
              response += `Potential Win: ₦${potentialWin.toLocaleString()}\n`;
              response += `Bet ID: ${betSlip.id.substring(0, 8)}`;
              isContinue = false;
            }
          }
        }
      }
    } else if (level === 2 && inputs[0] === '2') {
      // Check balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('phone', phoneNumber)
        .single();

      if (profile) {
        response = `END Your balance: ₦${profile.balance.toLocaleString()}`;
      } else {
        response = 'END User not found. Please register at betfuz.com first.';
      }
      isContinue = false;
    } else if (level === 2 && inputs[0] === '3') {
      // Bet history
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', phoneNumber)
        .single();

      if (!profile) {
        response = 'END User not found.';
        isContinue = false;
      } else {
        const { data: bets } = await supabase
          .from('bet_slips')
          .select('id, total_stake, status, created_at')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!bets || bets.length === 0) {
          response = 'END No bet history found.';
        } else {
          response = 'END Recent Bets:\n';
          bets.forEach((bet: any) => {
            const date = new Date(bet.created_at).toLocaleDateString();
            response += `${date}: ₦${bet.total_stake} - ${bet.status}\n`;
          });
        }
        isContinue = false;
      }
    } else {
      response = 'END Invalid option. Please try again.';
      isContinue = false;
    }

    return new Response(isContinue ? response : response.replace('CON', 'END'), {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });
  } catch (error: any) {
    console.error('USSD Error:', error);
    return new Response('END Service temporarily unavailable.', {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });
  }
});
