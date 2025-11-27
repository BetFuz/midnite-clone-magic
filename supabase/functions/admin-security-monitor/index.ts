import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityAlert {
  level: 'INFO' | 'WARN' | 'CRITICAL';
  message: string;
  count: number;
  timeWindow: string;
  affectedAdmins?: string[];
  ipAddresses?: string[];
  actions?: string[];
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

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const alerts: SecurityAlert[] = [];

    // 1. Check for repeated failed login attempts (potential brute force)
    const { data: failedLogins } = await supabaseClient
      .from('admin_audit_log')
      .select('admin_id, ip_address, action')
      .eq('status', 'failed')
      .in('action', ['API_GATEWAY_ACCESS_DENIED', 'INVALID_JWT', 'EXPIRED_TOKEN'])
      .gte('created_at', oneHourAgo.toISOString());

    if (failedLogins && failedLogins.length > 10) {
      // Group by IP to detect brute force from single source
      const ipGroups = failedLogins.reduce((acc, log) => {
        const ip = log.ip_address || 'unknown';
        acc[ip] = (acc[ip] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const suspiciousIPs = Object.entries(ipGroups)
        .filter(([_, count]) => count > 5)
        .map(([ip]) => ip);

      if (suspiciousIPs.length > 0) {
        alerts.push({
          level: 'CRITICAL',
          message: 'Potential brute force attack detected',
          count: failedLogins.length,
          timeWindow: 'Last 1 hour',
          ipAddresses: suspiciousIPs,
          actions: ['Block IPs in Cloudflare', 'Review audit logs', 'Notify security team']
        });
      } else {
        alerts.push({
          level: 'WARN',
          message: 'High number of failed admin login attempts',
          count: failedLogins.length,
          timeWindow: 'Last 1 hour',
        });
      }
    }

    // 2. Check for successful logins from new/unusual IPs
    const { data: recentLogins } = await supabaseClient
      .from('admin_audit_log')
      .select('admin_id, ip_address, created_at')
      .eq('status', 'success')
      .eq('action', 'API_GATEWAY_ACCESS')
      .gte('created_at', oneHourAgo.toISOString());

    // Get historical IPs for comparison
    const { data: historicalLogins } = await supabaseClient
      .from('admin_audit_log')
      .select('admin_id, ip_address')
      .eq('status', 'success')
      .lt('created_at', oneHourAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000);

    if (recentLogins && historicalLogins) {
      const historicalIPs = new Set(historicalLogins.map(l => l.ip_address));
      const newIPs = recentLogins
        .filter(l => l.ip_address && !historicalIPs.has(l.ip_address))
        .map(l => ({ admin: l.admin_id, ip: l.ip_address, time: l.created_at }));

      if (newIPs.length > 0) {
        alerts.push({
          level: 'WARN',
          message: 'Admin login from new IP address',
          count: newIPs.length,
          timeWindow: 'Last 1 hour',
          actions: ['Verify with admin team', 'Check if VPN change or travel']
        });
      }
    }

    // 3. Check for MFA bypass attempts
    const { data: nonMfaLogins } = await supabaseClient
      .from('admin_audit_log')
      .select('admin_id, mfa_verified, action')
      .eq('status', 'success')
      .eq('mfa_verified', false)
      .gte('created_at', oneHourAgo.toISOString());

    if (nonMfaLogins && nonMfaLogins.length > 0) {
      alerts.push({
        level: 'CRITICAL',
        message: 'Admin access without MFA verification',
        count: nonMfaLogins.length,
        timeWindow: 'Last 1 hour',
        actions: ['Enable ADMIN_REQUIRE_MFA=true', 'Investigate affected sessions', 'Force re-authentication']
      });
    }

    // 4. Check for high-volume admin actions (potential compromise)
    const { data: recentActions } = await supabaseClient
      .from('admin_audit_log')
      .select('admin_id, action')
      .gte('created_at', oneHourAgo.toISOString());

    if (recentActions) {
      const actionsPerAdmin = recentActions.reduce((acc, log) => {
        acc[log.admin_id] = (acc[log.admin_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const highVolumeAdmins = Object.entries(actionsPerAdmin)
        .filter(([_, count]) => count > 200) // More than 200 actions per hour is suspicious
        .map(([adminId]) => adminId);

      if (highVolumeAdmins.length > 0) {
        alerts.push({
          level: 'WARN',
          message: 'Unusually high volume of admin actions',
          count: highVolumeAdmins.length,
          timeWindow: 'Last 1 hour',
          affectedAdmins: highVolumeAdmins,
          actions: ['Review admin activity', 'Check if automated script running', 'Verify admin account not compromised']
        });
      }
    }

    // 5. Send alerts to configured webhooks (Slack, PagerDuty, Email)
    const criticalAlerts = alerts.filter(a => a.level === 'CRITICAL');
    if (criticalAlerts.length > 0 && Deno.env.get('ALERT_WEBHOOK_URL')) {
      // TODO: Implement webhook notification
      // await fetch(Deno.env.get('ALERT_WEBHOOK_URL'), {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ alerts: criticalAlerts })
      // });
      console.log('CRITICAL ALERTS:', criticalAlerts);
    }

    return new Response(JSON.stringify({
      status: 'monitoring_complete',
      timestamp: now.toISOString(),
      summary: {
        total_alerts: alerts.length,
        critical: alerts.filter(a => a.level === 'CRITICAL').length,
        warnings: alerts.filter(a => a.level === 'WARN').length,
        info: alerts.filter(a => a.level === 'INFO').length,
      },
      alerts,
      // TODO: Add webhook integration status
      webhook_status: 'not_configured'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in security monitor:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
