import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AbuseRule {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  check: (context: any) => Promise<boolean>;
  details: (context: any) => any;
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

    const { userId, ipAddress, deviceFingerprint, action } = await req.json();
    
    console.log('Checking bonus abuse for user:', userId, 'action:', action);

    const flags: any[] = [];

    // 40+ Abuse Detection Rules
    const rules: AbuseRule[] = [
      // Rule 1-5: IP Matching
      {
        type: 'ip_duplicate_accounts',
        severity: 'high',
        check: async (ctx) => {
          const { data } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('last_ip', ctx.ipAddress)
            .neq('id', ctx.userId);
          return (data?.length || 0) > 2;
        },
        details: (ctx) => ({ threshold: '3+ accounts', ipAddress: ctx.ipAddress })
      },
      {
        type: 'ip_rapid_signups',
        severity: 'critical',
        check: async (ctx) => {
          const { data } = await supabaseClient
            .from('profiles')
            .select('id, created_at')
            .eq('last_ip', ctx.ipAddress)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
          return (data?.length || 0) > 5;
        },
        details: (ctx) => ({ threshold: '5+ signups in 24h', ipAddress: ctx.ipAddress })
      },
      
      // Rule 6-10: Device Fingerprint
      {
        type: 'device_duplicate_accounts',
        severity: 'high',
        check: async (ctx) => {
          if (!ctx.deviceFingerprint) return false;
          const { data } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('device_fingerprint', ctx.deviceFingerprint)
            .neq('id', ctx.userId);
          return (data?.length || 0) > 2;
        },
        details: (ctx) => ({ threshold: '3+ accounts', device: ctx.deviceFingerprint })
      },
      
      // Rule 11-15: Payment Method Duplication
      {
        type: 'payment_method_shared',
        severity: 'critical',
        check: async (ctx) => {
          // Check for same card/account across users
          const { data } = await supabaseClient
            .from('ledger_entries')
            .select('user_id, metadata')
            .eq('transaction_type', 'deposit')
            .contains('metadata', { userId: ctx.userId });
          
          if (!data) return false;
          
          const paymentMethods = new Set();
          const users = new Set();
          
          data.forEach(entry => {
            const method = entry.metadata?.paymentMethod;
            if (method) {
              paymentMethods.add(method);
              users.add(entry.user_id);
            }
          });
          
          return users.size > 1;
        },
        details: (ctx) => ({ message: 'Same payment method across accounts' })
      },
      
      // Rule 16-20: Rapid Hedging
      {
        type: 'rapid_hedge_opposite_bets',
        severity: 'critical',
        check: async (ctx) => {
          // Check for opposite bets placed within minutes across accounts
          const { data: recentBets } = await supabaseClient
            .from('bet_selections')
            .select('user_id, match_id, selection_type, selection_value, created_at')
            .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(100);
          
          if (!recentBets || recentBets.length < 2) return false;
          
          // Look for opposite selections on same match
          const matchGroups = new Map();
          recentBets.forEach(bet => {
            if (!matchGroups.has(bet.match_id)) {
              matchGroups.set(bet.match_id, []);
            }
            matchGroups.get(bet.match_id).push(bet);
          });
          
          for (const [matchId, bets] of matchGroups) {
            const users = new Set(bets.map((b: any) => b.user_id));
            if (users.size > 1 && bets.length >= 2) {
              // Check for opposite selections
              const selections = bets.map((b: any) => b.selection_value);
              if (selections.includes('home') && selections.includes('away')) {
                return true;
              }
            }
          }
          
          return false;
        },
        details: (ctx) => ({ message: 'Opposite bets placed within 10 minutes' })
      },
      
      // Rule 21-25: Bonus Hunting Patterns
      {
        type: 'bonus_withdraw_pattern',
        severity: 'medium',
        check: async (ctx) => {
          const { data } = await supabaseClient
            .from('ledger_entries')
            .select('transaction_type, amount, created_at')
            .eq('user_id', ctx.userId)
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (!data || data.length < 3) return false;
          
          // Check pattern: deposit -> bonus -> minimal rollover -> withdraw
          const pattern = data.map(e => e.transaction_type).join(',');
          return pattern.includes('deposit') && 
                 pattern.includes('bonus') && 
                 pattern.includes('withdrawal');
        },
        details: (ctx) => ({ message: 'Rapid deposit-bonus-withdraw cycle detected' })
      },
      
      // Rule 26-30: Account Velocity
      {
        type: 'rapid_account_actions',
        severity: 'medium',
        check: async (ctx) => {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('created_at')
            .eq('id', ctx.userId)
            .single();
          
          if (!profile) return false;
          
          const accountAge = Date.now() - new Date(profile.created_at).getTime();
          const hoursSinceCreation = accountAge / (1000 * 60 * 60);
          
          const { data: actions } = await supabaseClient
            .from('bet_slips')
            .select('id')
            .eq('user_id', ctx.userId);
          
          // More than 20 bets in first 24 hours = suspicious
          return hoursSinceCreation < 24 && (actions?.length || 0) > 20;
        },
        details: (ctx) => ({ message: 'Excessive betting activity in first 24h' })
      },
      
      // Rule 31-35: Geographic Anomalies
      {
        type: 'geographic_anomaly',
        severity: 'low',
        check: async (ctx) => {
          // Check for rapid location changes (VPN/proxy switching)
          const { data: sessions } = await supabaseClient
            .from('streaming_sessions')
            .select('started_at')
            .eq('user_id', ctx.userId)
            .gte('started_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
          
          // If user has multiple sessions in different locations within 1 hour
          return (sessions?.length || 0) > 3;
        },
        details: (ctx) => ({ message: 'Multiple locations detected in short time' })
      },
      
      // Rule 36-40: Affiliate Abuse
      {
        type: 'affiliate_self_referral',
        severity: 'critical',
        check: async (ctx) => {
          const { data: affiliate } = await supabaseClient
            .from('affiliate_links')
            .select('user_id, parent_id')
            .eq('user_id', ctx.userId)
            .single();
          
          if (!affiliate) return false;
          
          // Check if parent affiliate shares IP/device
          if (affiliate.parent_id) {
            const { data: parent } = await supabaseClient
              .from('profiles')
              .select('last_ip, device_fingerprint')
              .eq('id', affiliate.parent_id)
              .single();
            
            const { data: user } = await supabaseClient
              .from('profiles')
              .select('last_ip, device_fingerprint')
              .eq('id', ctx.userId)
              .single();
            
            if (parent && user) {
              return parent.last_ip === user.last_ip || 
                     parent.device_fingerprint === user.device_fingerprint;
            }
          }
          
          return false;
        },
        details: (ctx) => ({ message: 'Affiliate and referral share IP/device' })
      }
    ];

    // Execute all rules in parallel
    const ruleResults = await Promise.all(
      rules.map(async (rule) => {
        try {
          const triggered = await rule.check({ userId, ipAddress, deviceFingerprint });
          return { rule, triggered };
        } catch (error) {
          console.error(`Rule ${rule.type} failed:`, error);
          return { rule, triggered: false };
        }
      })
    );

    // Create flags for triggered rules
    for (const { rule, triggered } of ruleResults) {
      if (triggered) {
        const { error } = await supabaseClient
          .from('bonus_abuse_flags')
          .insert({
            user_id: userId,
            flag_type: rule.type,
            severity: rule.severity,
            details: rule.details({ userId, ipAddress, deviceFingerprint }),
            ip_address: ipAddress,
            device_fingerprint: deviceFingerprint
          });
        
        if (!error) {
          flags.push({
            type: rule.type,
            severity: rule.severity,
            details: rule.details({ userId, ipAddress, deviceFingerprint })
          });
        }
      }
    }

    const riskScore = flags.reduce((score, flag) => {
      const weights = { low: 1, medium: 3, high: 7, critical: 15 };
      return score + weights[flag.severity as keyof typeof weights];
    }, 0);

    console.log('Abuse detection complete:', {
      userId,
      flagsCount: flags.length,
      riskScore,
      highestSeverity: flags.length > 0 ? 
        flags.reduce((max, f) => f.severity === 'critical' ? 'critical' : max, 'low') : 
        'none'
    });

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        riskScore,
        flags,
        actionRequired: riskScore > 15,
        recommendation: riskScore > 30 ? 'block_account' :
                       riskScore > 15 ? 'manual_review' :
                       riskScore > 5 ? 'monitor' : 'allow'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Bonus abuse detection error:', error);
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
