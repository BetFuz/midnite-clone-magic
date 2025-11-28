import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AMLCheckRequest {
  userId: string;
  transactionType: 'deposit' | 'withdrawal';
  amount: number;
  metadata?: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, transactionType, amount, metadata }: AMLCheckRequest = await req.json();

    console.log(`Running AML checks for user ${userId}, type: ${transactionType}, amount: ${amount}`);

    const alerts: any[] = [];

    // Check 1: Duplicate BVN Detection
    const { data: kycRecords, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('nin, user_id')
      .eq('user_id', userId);

    if (!kycError && kycRecords && kycRecords.length > 0) {
      const userNin = kycRecords[0].nin;
      
      // Check if this NIN exists for other users
      const { data: duplicateNins } = await supabase
        .from('kyc_verifications')
        .select('user_id')
        .eq('nin', userNin)
        .neq('user_id', userId);

      if (duplicateNins && duplicateNins.length > 0) {
        alerts.push({
          user_id: userId,
          alert_type: 'duplicate_bvn',
          severity: 'critical',
          description: `Duplicate BVN/NIN detected. This NIN is associated with ${duplicateNins.length + 1} different accounts.`,
          metadata: {
            nin: userNin,
            duplicate_accounts: duplicateNins.map(d => d.user_id),
            transaction_type: transactionType,
            amount,
          },
        });
      }
    }

    // Check 2: Structuring Deposits (Multiple deposits below threshold within 24h)
    if (transactionType === 'deposit') {
      const threshold = 50000; // ₦50,000 threshold
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: recentDeposits } = await supabase
        .from('ledger_entries')
        .select('amount, created_at')
        .eq('user_id', userId)
        .eq('transaction_type', 'deposit')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false });

      if (recentDeposits && recentDeposits.length >= 3) {
        // Check if deposits are structured (multiple deposits just below threshold)
        const structuredDeposits = recentDeposits.filter(
          d => d.amount > threshold * 0.7 && d.amount < threshold
        );

        if (structuredDeposits.length >= 3) {
          const totalAmount = structuredDeposits.reduce((sum, d) => sum + Number(d.amount), 0);
          
          alerts.push({
            user_id: userId,
            alert_type: 'structuring_deposits',
            severity: 'high',
            description: `Potential structuring detected: ${structuredDeposits.length} deposits totaling ₦${totalAmount.toFixed(2)} within 24 hours, all just below ₦${threshold} threshold.`,
            metadata: {
              deposit_count: structuredDeposits.length,
              total_amount: totalAmount,
              threshold,
              time_window: '24h',
              deposits: structuredDeposits,
            },
          });
        }
      }
    }

    // Check 3: Round-Trip Transfers (Deposit followed by immediate withdrawal)
    if (transactionType === 'withdrawal') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data: recentTransactions } = await supabase
        .from('ledger_entries')
        .select('transaction_type, amount, created_at')
        .eq('user_id', userId)
        .gte('created_at', oneHourAgo)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentTransactions && recentTransactions.length >= 2) {
        // Look for deposit followed by withdrawal of similar amount
        for (let i = 0; i < recentTransactions.length - 1; i++) {
          const current = recentTransactions[i];
          const previous = recentTransactions[i + 1];

          if (
            previous.transaction_type === 'deposit' &&
            current.transaction_type === 'withdrawal' &&
            Math.abs(Number(current.amount) - Number(previous.amount)) < Number(previous.amount) * 0.1
          ) {
            alerts.push({
              user_id: userId,
              alert_type: 'round_trip_transfer',
              severity: 'high',
              description: `Round-trip transfer detected: Deposit of ₦${Number(previous.amount).toFixed(2)} followed by withdrawal of ₦${Number(current.amount).toFixed(2)} within 1 hour.`,
              metadata: {
                deposit_amount: previous.amount,
                deposit_time: previous.created_at,
                withdrawal_amount: current.amount,
                withdrawal_time: current.created_at,
                time_diff_minutes: Math.round(
                  (new Date(current.created_at).getTime() - new Date(previous.created_at).getTime()) / 60000
                ),
              },
            });
            break;
          }
        }
      }
    }

    // Insert alerts into database
    if (alerts.length > 0) {
      const { error: insertError } = await supabase
        .from('aml_alerts')
        .insert(alerts);

      if (insertError) {
        console.error('Failed to insert AML alerts:', insertError);
      } else {
        console.log(`Created ${alerts.length} AML alert(s) for user ${userId}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        alerts_triggered: alerts.length,
        alerts: alerts.map(a => ({
          type: a.alert_type,
          severity: a.severity,
          description: a.description,
        })),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('AML detection failed:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
