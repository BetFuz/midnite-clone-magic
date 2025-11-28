import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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

    const { action } = await req.json();
    
    console.log('Processing free bet expiry action:', action);

    const now = new Date();
    const reminderThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    let processed = 0;
    let reminders = 0;
    let expired = 0;

    if (action === 'send_reminders') {
      // Find tokens expiring in 24 hours that haven't had reminder sent
      const { data: expiringTokens, error: expiringError } = await supabaseClient
        .from('free_bet_tokens')
        .select('id, user_id, token_code, amount, expires_at')
        .eq('status', 'active')
        .eq('reminder_sent', false)
        .lte('expires_at', reminderThreshold.toISOString())
        .gt('expires_at', now.toISOString());

      if (expiringError) {
        throw expiringError;
      }

      console.log('Found', expiringTokens?.length || 0, 'tokens expiring within 24h');

      // Send reminders
      for (const token of expiringTokens || []) {
        const hoursRemaining = Math.floor(
          (new Date(token.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60)
        );

        // Mark reminder as sent
        await supabaseClient
          .from('free_bet_tokens')
          .update({
            reminder_sent: true,
            reminder_sent_at: now.toISOString()
          })
          .eq('id', token.id);

        // TODO: Send push notification or SMS
        console.log('Reminder sent for token:', token.token_code, {
          userId: token.user_id,
          amount: token.amount,
          hoursRemaining
        });

        reminders++;
      }

      processed = reminders;
    }

    if (action === 'expire_tokens') {
      // Find expired tokens
      const { data: expiredTokens, error: expiredError } = await supabaseClient
        .from('free_bet_tokens')
        .select('id, user_id, token_code, amount')
        .eq('status', 'active')
        .lt('expires_at', now.toISOString());

      if (expiredError) {
        throw expiredError;
      }

      console.log('Found', expiredTokens?.length || 0, 'expired tokens');

      // Expire tokens
      for (const token of expiredTokens || []) {
        await supabaseClient
          .from('free_bet_tokens')
          .update({ status: 'expired' })
          .eq('id', token.id);

        // Log to ledger
        await supabaseClient.rpc('log_ledger_entry', {
          p_user_id: token.user_id,
          p_transaction_type: 'free_bet_expiry',
          p_amount: -token.amount,
          p_currency: 'NGN',
          p_balance_before: 0,
          p_balance_after: 0,
          p_reference_id: token.id,
          p_reference_type: 'free_bet_token',
          p_description: `Free bet expired: ${token.token_code} (₦${token.amount})`,
          p_metadata: {
            tokenCode: token.token_code,
            amount: token.amount,
            expiredAt: now.toISOString()
          }
        });

        console.log('Token expired:', token.token_code);
        expired++;
      }

      processed = expired;
    }

    if (action === 'check_status') {
      // Get statistics
      const { data: stats } = await supabaseClient
        .from('free_bet_tokens')
        .select('status, expires_at')
        .eq('status', 'active');

      const activeCount = stats?.length || 0;
      const expiringCount = stats?.filter(
        t => new Date(t.expires_at) <= reminderThreshold && new Date(t.expires_at) > now
      ).length || 0;
      const overdueCount = stats?.filter(
        t => new Date(t.expires_at) <= now
      ).length || 0;

      return new Response(
        JSON.stringify({
          success: true,
          stats: {
            active: activeCount,
            expiringSoon: expiringCount,
            overdue: overdueCount
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log('Free bet expiry processing complete:', {
      action,
      processed,
      reminders,
      expired
    });

    return new Response(
      JSON.stringify({
        success: true,
        action,
        processed,
        reminders,
        expired,
        message: action === 'send_reminders' ? 
          `Sent ${reminders} expiry reminders (T-24h)` :
          `Expired ${expired} free bet tokens`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Free bet expiry error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
