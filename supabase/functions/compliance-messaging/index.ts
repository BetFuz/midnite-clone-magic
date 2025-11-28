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

    const { action, userId, channel, messageType, messageContent } = await req.json();

    if (action === 'send_message') {
      // Add mandatory compliance footer
      const complianceFooter = getComplianceFooter();
      const fullMessage = `${messageContent}\n\n${complianceFooter}`;

      // Log message with compliance footer
      const { data: log, error: logError } = await supabase
        .from('advertising_logs')
        .insert({
          user_id: userId,
          channel: channel,
          message_type: messageType,
          message_content: messageContent,
          compliance_footer: complianceFooter,
          helpline_included: true,
          sent_at: new Date().toISOString()
        })
        .select()
        .single();

      if (logError) throw logError;

      // Send message via appropriate channel
      let sendResult;
      switch (channel) {
        case 'sms':
          sendResult = await sendSMS(userId, fullMessage);
          break;
        case 'email':
          sendResult = await sendEmail(userId, messageContent, complianceFooter);
          break;
        case 'push':
          sendResult = await sendPushNotification(userId, fullMessage);
          break;
        case 'in_app':
          sendResult = await sendInAppNotification(userId, fullMessage);
          break;
        default:
          throw new Error('Invalid channel');
      }

      return new Response(
        JSON.stringify({ 
          log,
          sendResult,
          message: 'Message sent with compliance footer'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_compliance_footer') {
      return new Response(
        JSON.stringify({ 
          footer: getComplianceFooter(),
          message: 'Compliance footer retrieved'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error: any) {
    console.error('Error in compliance-messaging:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function getComplianceFooter(): string {
  return `18+ Only. Bet Responsibly. 
Gambling Helpline: 0800-BET-HELP (Free & Confidential)
If you or someone you know has a gambling problem, call our toll-free helpline 24/7.
National Responsible Gaming Council: www.nrgc.ng
Licensed by NLRC. License No: 0000123. www.betfuz.com`;
}

async function sendSMS(userId: string, message: string): Promise<any> {
  // TODO: Integrate with Africa's Talking or other SMS provider
  console.log(`[SMS] Sending to user ${userId}: ${message}`);
  return { success: true, channel: 'sms' };
}

async function sendEmail(userId: string, content: string, footer: string): Promise<any> {
  // TODO: Integrate with SendGrid/AWS SES
  const htmlContent = `
    <div style="font-family: Arial, sans-serif;">
      <div>${content}</div>
      <hr style="margin: 20px 0; border: 1px solid #ccc;" />
      <div style="font-size: 12px; color: #666;">
        ${footer.split('\n').join('<br/>')}
      </div>
    </div>
  `;
  
  console.log(`[EMAIL] Sending to user ${userId}`);
  return { success: true, channel: 'email' };
}

async function sendPushNotification(userId: string, message: string): Promise<any> {
  // TODO: Integrate with Firebase Cloud Messaging or OneSignal
  console.log(`[PUSH] Sending to user ${userId}: ${message}`);
  return { success: true, channel: 'push' };
}

async function sendInAppNotification(userId: string, message: string): Promise<any> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: 'Betfuz Notification',
      message: message,
      type: 'promotional',
      read: false
    });

  if (error) throw error;

  return { success: true, channel: 'in_app' };
}
