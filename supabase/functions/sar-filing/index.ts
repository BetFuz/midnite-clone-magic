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

    const { action, userId } = await req.json();

    if (action === 'check_suspicious_activity') {
      // Check 24h volume
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: transactions } = await supabase
        .from('ledger_entries')
        .select('amount, transaction_type')
        .eq('user_id', userId)
        .gte('created_at', twentyFourHoursAgo);

      let totalVolume = 0;
      let depositCount = 0;
      let withdrawalCount = 0;

      transactions?.forEach(tx => {
        totalVolume += Math.abs(tx.amount);
        if (tx.transaction_type === 'deposit') depositCount++;
        if (tx.transaction_type === 'withdrawal') withdrawalCount++;
      });

      const triggers = [];

      // Trigger 1: Single user > ₦15M in 24h
      if (totalVolume > 15000000) {
        triggers.push({
          type: 'high_volume_24h',
          amount: totalVolume,
          transactionCount: transactions?.length || 0
        });
      }

      // Trigger 2: Structuring pattern (multiple deposits just under threshold)
      if (depositCount > 5) {
        const { data: deposits } = await supabase
          .from('ledger_entries')
          .select('amount')
          .eq('user_id', userId)
          .eq('transaction_type', 'deposit')
          .gte('created_at', twentyFourHoursAgo);

        const suspiciousDeposits = deposits?.filter(d => 
          d.amount > 1000000 && d.amount < 1500000
        );

        if (suspiciousDeposits && suspiciousDeposits.length >= 5) {
          triggers.push({
            type: 'structuring',
            amount: totalVolume,
            transactionCount: suspiciousDeposits.length
          });
        }
      }

      // Trigger 3: Rapid in-out (deposit then immediate withdrawal)
      if (depositCount > 0 && withdrawalCount > 0) {
        const rapidInOut = depositCount === withdrawalCount && 
                          Math.abs(depositCount - withdrawalCount) <= 2;
        if (rapidInOut) {
          triggers.push({
            type: 'rapid_in_out',
            amount: totalVolume,
            transactionCount: depositCount + withdrawalCount
          });
        }
      }

      // Generate SAR if triggers found
      if (triggers.length > 0) {
        for (const trigger of triggers) {
          // Generate SAR XML
          const sarXml = generateSARXml(userId, trigger);

          const { data: sar, error } = await supabase
            .from('sar_filings')
            .insert({
              user_id: userId,
              trigger_type: trigger.type,
              amount_24h: trigger.amount,
              transaction_count: trigger.transactionCount,
              pattern_details: { trigger },
              xml_content: sarXml,
              xml_path: `/sar/${userId}_${Date.now()}.xml`,
              status: 'pending'
            })
            .select()
            .single();

          if (error) {
            console.error('Error creating SAR:', error);
          }
        }

        return new Response(
          JSON.stringify({ 
            suspicious: true, 
            triggers,
            message: 'SAR filed automatically'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ suspicious: false, message: 'No suspicious activity detected' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'file_sar') {
      const { sarId } = await req.json();

      // TODO: Integrate with FINCEN/NLRC SAR submission endpoint
      // For now, mark as filed
      const { data: sar, error } = await supabase
        .from('sar_filings')
        .update({
          status: 'filed',
          filed_at: new Date().toISOString()
        })
        .eq('id', sarId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ sar, message: 'SAR filed successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error: any) {
    console.error('Error in sar-filing:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function generateSARXml(userId: string, trigger: any): string {
  const now = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<SuspiciousActivityReport>
  <Header>
    <ReportingEntity>Betfuz Limited</ReportingEntity>
    <ReportDate>${now}</ReportDate>
    <ReportType>Automated SAR</ReportType>
  </Header>
  <Subject>
    <UserId>${userId}</UserId>
    <DetectionDate>${now}</DetectionDate>
  </Subject>
  <Activity>
    <TriggerType>${trigger.type}</TriggerType>
    <Amount24h>${trigger.amount}</Amount24h>
    <TransactionCount>${trigger.transactionCount}</TransactionCount>
    <Currency>NGN</Currency>
  </Activity>
  <Narrative>
    Automated detection of suspicious activity pattern: ${trigger.type}. 
    Total transaction volume in 24h period: ₦${trigger.amount.toLocaleString()}.
    Transaction count: ${trigger.transactionCount}.
  </Narrative>
</SuspiciousActivityReport>`;
}
