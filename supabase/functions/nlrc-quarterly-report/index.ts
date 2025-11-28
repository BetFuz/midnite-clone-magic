import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuarterlyReportRequest {
  year: number;
  quarter: number; // 1-4
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { year, quarter }: QuarterlyReportRequest = await req.json();

    if (quarter < 1 || quarter > 4) {
      throw new Error('Quarter must be between 1 and 4');
    }

    console.log(`Generating NLRC quarterly report for Q${quarter} ${year}`);

    // Calculate quarter date range
    const quarterStartMonth = (quarter - 1) * 3;
    const quarterStart = new Date(year, quarterStartMonth, 1).toISOString();
    const quarterEnd = new Date(year, quarterStartMonth + 3, 0, 23, 59, 59).toISOString();

    console.log(`Period: ${quarterStart} to ${quarterEnd}`);

    // 1. Calculate Gross Gaming Revenue (GGR)
    // GGR = Total Stakes - Total Payouts
    const { data: betsData } = await supabase
      .from('bet_slips')
      .select('total_stake, potential_win, status')
      .gte('created_at', quarterStart)
      .lte('created_at', quarterEnd);

    const totalStakes = betsData?.reduce((sum, bet) => sum + Number(bet.total_stake), 0) || 0;
    const totalPayouts = betsData?.filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + Number(bet.potential_win), 0) || 0;
    
    const grossGamingRevenue = totalStakes - totalPayouts;

    // 2. Calculate Tax Payable (assume 20% of GGR for Nigerian sports betting)
    const taxRate = 0.20;
    const taxPayable = grossGamingRevenue * taxRate;

    // 3. Count Total Players (users with at least one bet in quarter)
    const { data: activePlayers } = await supabase
      .from('bet_slips')
      .select('user_id')
      .gte('created_at', quarterStart)
      .lte('created_at', quarterEnd);

    const uniqueActivePlayers = new Set(activePlayers?.map(p => p.user_id)).size;

    // 4. Count Total Registered Players
    const { count: totalPlayers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .lte('created_at', quarterEnd);

    // 5. Count Unpaid Tickets (won bets not yet paid out)
    const { data: unpaidTickets } = await supabase
      .from('bet_slips')
      .select('id, potential_win')
      .eq('status', 'won')
      .gte('created_at', quarterStart)
      .lte('created_at', quarterEnd)
      .is('settled_at', null);

    const unpaidTicketsCount = unpaidTickets?.length || 0;
    const unpaidTicketsValue = unpaidTickets?.reduce((sum, bet) => sum + Number(bet.potential_win), 0) || 0;

    // 6. Additional Metrics
    const { count: totalBets } = await supabase
      .from('bet_slips')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', quarterStart)
      .lte('created_at', quarterEnd);

    const { count: wonBets } = await supabase
      .from('bet_slips')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'won')
      .gte('created_at', quarterStart)
      .lte('created_at', quarterEnd);

    const { count: lostBets } = await supabase
      .from('bet_slips')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'lost')
      .gte('created_at', quarterStart)
      .lte('created_at', quarterEnd);

    const { data: deposits } = await supabase
      .from('ledger_entries')
      .select('amount')
      .eq('transaction_type', 'deposit')
      .gte('created_at', quarterStart)
      .lte('created_at', quarterEnd);

    const totalDeposits = deposits?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

    const { data: withdrawals } = await supabase
      .from('ledger_entries')
      .select('amount')
      .eq('transaction_type', 'withdrawal')
      .gte('created_at', quarterStart)
      .lte('created_at', quarterEnd);

    const totalWithdrawals = withdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;

    // Create report data
    const reportData = {
      period: {
        year,
        quarter,
        quarter_label: `Q${quarter}-${year}`,
        start_date: quarterStart.split('T')[0],
        end_date: quarterEnd.split('T')[0],
      },
      revenue: {
        total_stakes: totalStakes,
        total_payouts: totalPayouts,
        gross_gaming_revenue: grossGamingRevenue,
        tax_rate: taxRate,
        tax_payable: taxPayable,
      },
      players: {
        total_registered: totalPlayers || 0,
        active_players: uniqueActivePlayers,
      },
      bets: {
        total_bets: totalBets || 0,
        won_bets: wonBets || 0,
        lost_bets: lostBets || 0,
        pending_bets: (totalBets || 0) - (wonBets || 0) - (lostBets || 0),
      },
      tickets: {
        unpaid_count: unpaidTicketsCount,
        unpaid_value: unpaidTicketsValue,
      },
      financial: {
        total_deposits: totalDeposits,
        total_withdrawals: totalWithdrawals,
        net_deposits: totalDeposits - totalWithdrawals,
      },
      generated_at: new Date().toISOString(),
    };

    // Insert or update report in database
    const { data: existingReport } = await supabase
      .from('nlrc_reports')
      .select('id')
      .eq('year', year)
      .eq('quarter_number', quarter)
      .single();

    if (existingReport) {
      await supabase
        .from('nlrc_reports')
        .update({
          gross_gaming_revenue: grossGamingRevenue,
          tax_payable: taxPayable,
          total_players: totalPlayers || 0,
          active_players: uniqueActivePlayers,
          unpaid_tickets: unpaidTicketsCount,
          unpaid_tickets_value: unpaidTicketsValue,
          report_data: reportData,
          exported_at: new Date().toISOString(),
        })
        .eq('id', existingReport.id);
    } else {
      await supabase
        .from('nlrc_reports')
        .insert({
          quarter: `Q${quarter}-${year}`,
          year,
          quarter_number: quarter,
          gross_gaming_revenue: grossGamingRevenue,
          tax_payable: taxPayable,
          total_players: totalPlayers || 0,
          active_players: uniqueActivePlayers,
          unpaid_tickets: unpaidTicketsCount,
          unpaid_tickets_value: unpaidTicketsValue,
          report_data: reportData,
          exported_at: new Date().toISOString(),
        });
    }

    console.log(`NLRC report generated successfully for Q${quarter} ${year}`);

    return new Response(
      JSON.stringify({
        success: true,
        report: reportData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('NLRC report generation failed:', error);

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
