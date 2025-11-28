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

    const { action, userId, periodStart, periodEnd } = await req.json();

    if (action === 'accrue_tax') {
      // Get user's state
      const { data: profile } = await supabase
        .from('profiles')
        .select('state_code')
        .eq('id', userId)
        .single();

      if (!profile?.state_code) {
        return new Response(
          JSON.stringify({ error: 'User state not set' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Get state tax rate
      const { data: taxRate } = await supabase
        .from('state_tax_rates')
        .select('tax_rate')
        .eq('state_code', profile.state_code)
        .single();

      if (!taxRate) {
        return new Response(
          JSON.stringify({ error: 'Tax rate not found for state' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Calculate GGR (Gross Gaming Revenue) for period
      const { data: bets } = await supabase
        .from('bet_slips')
        .select('total_stake, potential_win, status')
        .eq('user_id', userId)
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd)
        .in('status', ['won', 'lost']);

      let ggr = 0;
      bets?.forEach(bet => {
        if (bet.status === 'lost') {
          ggr += bet.total_stake; // Platform keeps stake
        } else if (bet.status === 'won') {
          ggr -= (bet.potential_win - bet.total_stake); // Platform pays out (winnings - stake)
        }
      });

      // Only accrue tax if GGR is positive
      if (ggr > 0) {
        const taxAmount = (ggr * taxRate.tax_rate) / 100;

        // Insert tax accrual
        const { data: accrual, error } = await supabase
          .from('tax_accruals')
          .insert({
            user_id: userId,
            state_code: profile.state_code,
            period_start: periodStart,
            period_end: periodEnd,
            gross_gaming_revenue: ggr,
            tax_rate: taxRate.tax_rate,
            tax_amount: taxAmount,
            status: 'pending'
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ accrual, message: 'Tax accrued successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ message: 'No tax to accrue (GGR <= 0)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'remit_tax') {
      const { accrualId } = await req.json();

      // TODO: Integrate with state tax authority payment API
      // For now, just mark as remitted
      const { data: accrual, error } = await supabase
        .from('tax_accruals')
        .update({
          status: 'remitted',
          remitted_at: new Date().toISOString()
        })
        .eq('id', accrualId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ accrual, message: 'Tax remitted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error: any) {
    console.error('Error in state-tax-engine:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
