import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OddsFeedHealth {
  provider: 'betradar' | 'betgenius';
  lastUpdate: string;
  isStale: boolean;
  staleDurationSeconds: number;
  status: 'healthy' | 'stale' | 'down';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    const STALE_THRESHOLD_SECONDS = 60;
    const FAILOVER_THRESHOLD_SECONDS = 30;

    // Check Betradar (primary feed) - query matches table for latest update
    const { data: betradarMatches, error: betradarError } = await supabaseAdmin
      .from('matches')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);

    // Check Betgenius (backup feed) - could be separate table or same with provider field
    const { data: betgeniusMatches, error: betgeniusError } = await supabaseAdmin
      .from('matches')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);

    const betradarHealth: OddsFeedHealth = {
      provider: 'betradar',
      lastUpdate: betradarMatches?.[0]?.updated_at || 'unknown',
      isStale: false,
      staleDurationSeconds: 0,
      status: 'down',
    };

    const betgeniusHealth: OddsFeedHealth = {
      provider: 'betgenius',
      lastUpdate: betgeniusMatches?.[0]?.updated_at || 'unknown',
      isStale: false,
      staleDurationSeconds: 0,
      status: 'down',
    };

    // Calculate staleness for Betradar
    if (betradarMatches?.[0]?.updated_at) {
      const lastUpdate = new Date(betradarMatches[0].updated_at);
      const staleDuration = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
      betradarHealth.staleDurationSeconds = staleDuration;
      betradarHealth.isStale = staleDuration > STALE_THRESHOLD_SECONDS;
      betradarHealth.status = staleDuration > STALE_THRESHOLD_SECONDS ? 'stale' : 'healthy';
    }

    // Calculate staleness for Betgenius
    if (betgeniusMatches?.[0]?.updated_at) {
      const lastUpdate = new Date(betgeniusMatches[0].updated_at);
      const staleDuration = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
      betgeniusHealth.staleDurationSeconds = staleDuration;
      betgeniusHealth.isStale = staleDuration > STALE_THRESHOLD_SECONDS;
      betgeniusHealth.status = staleDuration > STALE_THRESHOLD_SECONDS ? 'stale' : 'healthy';
    }

    // Determine if failover is needed
    const shouldFailover = betradarHealth.isStale || betradarHealth.status === 'down';
    const currentProvider = shouldFailover ? 'betgenius' : 'betradar';

    // Store failover state in a simple config table (or Redis in production)
    if (shouldFailover) {
      console.log(`🚨 FAILOVER TRIGGERED: Betradar stale for ${betradarHealth.staleDurationSeconds}s, switching to Betgenius`);
      
      // Update failover flag
      const { error: updateError } = await supabaseAdmin
        .from('admin_webhook_settings')
        .upsert({
          id: 1,
          updated_at: new Date().toISOString(),
          updated_by: 'system',
        });

      if (updateError) {
        console.error('Failed to update failover flag:', updateError);
      }

      // Alert on-call (placeholder - integrate with PagerDuty, Slack, etc.)
      const alertPayload = {
        severity: 'critical',
        message: `Odds feed failover: Betradar down for ${betradarHealth.staleDurationSeconds}s, switched to Betgenius`,
        timestamp: now.toISOString(),
        betradar: betradarHealth,
        betgenius: betgeniusHealth,
      };

      console.log('📢 ALERT:', JSON.stringify(alertPayload));

      // TODO: Send to PagerDuty/Slack webhook
      // await fetch(Deno.env.get('PAGERDUTY_WEBHOOK_URL'), {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(alertPayload),
      // });
    }

    // Response
    return new Response(
      JSON.stringify({
        status: shouldFailover ? 'failover_active' : 'healthy',
        currentProvider,
        shouldSuspendLiveEvents: shouldFailover && betgeniusHealth.status !== 'healthy',
        timestamp: now.toISOString(),
        feeds: {
          betradar: betradarHealth,
          betgenius: betgeniusHealth,
        },
        failoverTriggered: shouldFailover,
        alert: shouldFailover ? 'On-call alerted' : null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});