import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  userId: string;
  phoneNumber: string;
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, phoneNumber, message }: SMSRequest = await req.json();

    // Check retry count for this user/message combo
    const { data: existingLog, error: checkError } = await supabaseClient
      .from('sms_delivery_log')
      .select('*')
      .eq('user_id', userId)
      .eq('phone_number', phoneNumber)
      .eq('message', message)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Enforce retry limit: max 1 retry (0 initial attempt + 1 retry = 2 total attempts)
    if (existingLog && existingLog.retry_count >= 1 && existingLog.status === 'failed') {
      console.log(`SMS retry limit exceeded for user ${userId}. Falling back to push notification.`);
      
      // Update status to fallback_push
      await supabaseClient
        .from('sms_delivery_log')
        .update({ status: 'fallback_push', updated_at: new Date().toISOString() })
        .eq('id', existingLog.id);

      // Create in-app push notification
      await supabaseClient
        .from('pending_notifications')
        .insert({
          user_id: userId,
          title: 'Notification',
          message: message,
          notification_type: 'sms_fallback',
          read: false,
        });

      return new Response(JSON.stringify({
        success: true,
        fallback: true,
        message: 'SMS retry limit reached. Notification sent via in-app push.',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // TODO: Integrate with Africa's Talking SMS API when credentials are available
    // const username = Deno.env.get('AFRICAS_TALKING_USERNAME');
    // const apiKey = Deno.env.get('AFRICAS_TALKING_API_KEY');
    // 
    // const response = await fetch('https://api.africastalking.com/version1/messaging', {
    //   method: 'POST',
    //   headers: {
    //     'apiKey': apiKey,
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: new URLSearchParams({
    //     username: username,
    //     to: phoneNumber,
    //     message: message,
    //   }),
    // });

    // Stub: Simulate SMS send (80% success rate for testing)
    const sendSuccess = Math.random() > 0.2;
    const retryCount = existingLog ? existingLog.retry_count + 1 : 0;

    // Log SMS delivery attempt
    const { data: logEntry, error: logError } = await supabaseClient
      .from('sms_delivery_log')
      .insert({
        user_id: userId,
        phone_number: phoneNumber,
        message: message,
        retry_count: retryCount,
        status: sendSuccess ? 'sent' : 'failed',
        telco_response: {
          simulated: true,
          success: sendSuccess,
          timestamp: new Date().toISOString(),
        },
        delivered_at: sendSuccess ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to log SMS delivery:', logError);
    }

    if (!sendSuccess && retryCount === 0) {
      // First failure - will retry once
      console.log(`SMS delivery failed for user ${userId}. Will retry once.`);
      return new Response(JSON.stringify({
        success: false,
        retry: true,
        message: 'SMS delivery failed. Retrying...',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!sendSuccess && retryCount >= 1) {
      // Second failure - fallback to push
      console.log(`SMS retry failed for user ${userId}. Falling back to push notification.`);
      
      await supabaseClient
        .from('sms_delivery_log')
        .update({ status: 'fallback_push', updated_at: new Date().toISOString() })
        .eq('id', logEntry.id);

      // Create in-app push notification
      await supabaseClient
        .from('pending_notifications')
        .insert({
          user_id: userId,
          title: 'Notification',
          message: message,
          notification_type: 'sms_fallback',
          read: false,
        });

      return new Response(JSON.stringify({
        success: true,
        fallback: true,
        message: 'SMS delivery failed after retry. Notification sent via in-app push.',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`SMS sent successfully to ${phoneNumber} for user ${userId}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'SMS sent successfully',
      logId: logEntry?.id,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
