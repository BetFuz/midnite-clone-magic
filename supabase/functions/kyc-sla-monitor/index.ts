import { createServiceClient } from '../_shared/supabase-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SLAConfig {
  BRONZE: number;
  SILVER: number;
  GOLD: number;
}

const SLA_MINUTES: SLAConfig = {
  BRONZE: 30,
  SILVER: 15,
  GOLD: 5,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createServiceClient();

    // Get all pending KYC submissions that are past their SLA deadline
    const { data: breachedSubmissions, error: fetchError } = await supabase
      .from('kyc_submissions')
      .select('*')
      .eq('status', 'pending')
      .lt('sla_deadline', new Date().toISOString());

    if (fetchError) throw fetchError;

    console.log(`Found ${breachedSubmissions?.length || 0} SLA-breached submissions`);

    const escalations = [];

    for (const submission of breachedSubmissions || []) {
      // Update status to escalated
      const { error: updateError } = await supabase
        .from('kyc_submissions')
        .update({
          status: 'escalated',
          escalated_at: new Date().toISOString(),
        })
        .eq('id', submission.id);

      if (updateError) {
        console.error(`Failed to escalate ${submission.id}:`, updateError);
        continue;
      }

      // Send Telegram alert (stub - TODO: integrate with Telegram Bot API)
      const minutesOverdue = Math.floor(
        (Date.now() - new Date(submission.sla_deadline).getTime()) / 60000
      );

      const telegramMessage = {
        chat_id: Deno.env.get('TELEGRAM_ON_CALL_CHAT_ID') || 'placeholder',
        text: `🚨 KYC SLA BREACH ALERT 🚨\n\n` +
          `User ID: ${submission.user_id}\n` +
          `Tier: ${submission.tier}\n` +
          `SLA: ${SLA_MINUTES[submission.tier as keyof SLAConfig]} minutes\n` +
          `Overdue by: ${minutesOverdue} minutes\n` +
          `Submitted: ${new Date(submission.submitted_at).toLocaleString()}\n` +
          `Document: ${submission.document_type}\n\n` +
          `Action Required: Immediate review`,
      };

      // TODO: Uncomment when Telegram Bot Token is configured
      // const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
      // if (telegramBotToken) {
      //   await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(telegramMessage),
      //   });
      // }

      escalations.push({
        submission_id: submission.id,
        tier: submission.tier,
        minutes_overdue: minutesOverdue,
        telegram_message: telegramMessage.text,
      });

      console.log(`Escalated ${submission.id} - ${submission.tier} tier`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        escalations_count: escalations.length,
        escalations,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('KYC SLA Monitor error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
