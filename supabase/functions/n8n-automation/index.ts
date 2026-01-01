import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-n8n-signature',
};

interface N8nWebhookPayload {
  workflow_id: string;
  workflow_name: string;
  trigger_event: 'bet_placed' | 'bet_won' | 'bet_lost' | 'deposit' | 'withdrawal' | 'user_registered' | 'kyc_approved' | 'fraud_detected';
  data: Record<string, unknown>;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const n8nBearerToken = Deno.env.get('N8N_BEARER_TOKEN');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify n8n signature if configured
    const authHeader = req.headers.get('authorization');
    if (n8nBearerToken && authHeader !== `Bearer ${n8nBearerToken}`) {
      console.warn('Invalid n8n authorization token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: N8nWebhookPayload = await req.json();
    console.log(`n8n automation received: ${payload.trigger_event}`, payload.workflow_name);

    let responseData: Record<string, unknown> = { success: true };
    let responseStatus = 200;

    // Handle different automation triggers
    switch (payload.trigger_event) {
      case 'bet_placed':
        // Trigger fraud detection
        const { data: fraudResult } = await supabase.functions.invoke('ai-fraud-detection', {
          body: { bet_id: payload.data.bet_id, user_id: payload.data.user_id }
        });
        responseData = { ...responseData, fraud_check: fraudResult };
        break;

      case 'bet_won':
        // Process affiliate commission
        if (payload.data.affiliate_code) {
          // First get current commission, then update
          const { data: affiliate } = await supabase
            .from('affiliate_links')
            .select('commission')
            .eq('code', payload.data.affiliate_code as string)
            .single();
          
          if (affiliate) {
            const newCommission = (affiliate.commission || 0) + (Number(payload.data.commission_amount) || 0);
            const { error: commError } = await supabase
              .from('affiliate_links')
              .update({ commission: newCommission })
              .eq('code', payload.data.affiliate_code as string);
            
            if (commError) console.error('Commission update error:', commError);
          }
        }
        
        // Send win notification
        if (payload.data.push_token) {
          // Queue push notification (would integrate with FCM/APNS)
          console.log('Would send push notification to:', payload.data.push_token);
        }
        responseData = { ...responseData, commission_processed: true };
        break;

      case 'bet_lost':
        // Trigger retention flow for significant losses
        if (Number(payload.data.amount) > 50000) {
          await supabase.functions.invoke('retention-flow', {
            body: { user_id: payload.data.user_id, trigger: 'significant_loss' }
          });
        }
        break;

      case 'deposit':
        // Update float health metrics
        await supabase.functions.invoke('float-health-metrics', {
          body: { action: 'deposit', amount: payload.data.amount }
        });
        
        // Check for first deposit bonus
        const { data: profile } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('id', payload.data.user_id)
          .single();
        
        if (profile) {
          const hoursSinceSignup = (Date.now() - new Date(profile.created_at).getTime()) / 3600000;
          if (hoursSinceSignup < 24) {
            responseData = { ...responseData, first_deposit_bonus_eligible: true };
          }
        }
        break;

      case 'withdrawal':
        // AML check for large withdrawals
        if (Number(payload.data.amount) >= 1000000) {
          await supabase.functions.invoke('aml-check', {
            body: { user_id: payload.data.user_id, amount: payload.data.amount, type: 'withdrawal' }
          });
        }
        break;

      case 'user_registered':
        // Send welcome SMS
        if (payload.data.phone) {
          await supabase.functions.invoke('send-sms', {
            body: { 
              phone: payload.data.phone, 
              message: 'Welcome to Betfuz! Get ₦1000 free bet on your first deposit. Bet responsibly. 18+' 
            }
          });
        }
        break;

      case 'kyc_approved':
        // Increase withdrawal limits
        await supabase
          .from('profiles')
          .update({ nin_verification_status: 'verified' } as any)
          .eq('id', payload.data.user_id);
        break;

      case 'fraud_detected':
        // Log security event and potentially freeze account
        await supabase
          .from('security_events')
          .insert({
            event_type: 'fraud_detected',
            severity: payload.data.severity || 'high',
            user_id: payload.data.user_id,
            payload_sample: payload.data,
            action_taken: 'flagged_for_review'
          } as any);
        break;

      default:
        console.log(`Unknown trigger event: ${payload.trigger_event}`);
    }

    const executionTime = Date.now() - startTime;

    // Log the webhook execution
    await supabase
      .from('n8n_webhook_logs')
      .insert({
        workflow_id: payload.workflow_id,
        workflow_name: payload.workflow_name,
        trigger_event: payload.trigger_event,
        payload: payload.data,
        response_status: responseStatus,
        response_body: responseData,
        execution_time_ms: executionTime
      } as any);

    return new Response(
      JSON.stringify(responseData),
      { status: responseStatus, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('n8n automation error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
