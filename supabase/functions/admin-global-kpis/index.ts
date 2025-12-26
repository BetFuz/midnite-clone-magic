import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user and check super admin status
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has superadmin role
    const { data: roles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'superadmin');

    if (roleError || !roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: 'Forbidden: Super Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const tenantId = url.searchParams.get('tenant_id');

    // Get service role client for cross-tenant queries
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch all tenants
    const { data: tenants, error: tenantsError } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('is_active', true);

    if (tenantsError) throw tenantsError;

    // Fetch global user counts
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Fetch bet statistics
    const { data: betStats, error: betError } = await supabaseAdmin
      .from('bet_slips')
      .select('total_stake, status, created_at');

    if (betError) throw betError;

    const totalBets = betStats?.length || 0;
    const totalStaked = betStats?.reduce((sum, b) => sum + Number(b.total_stake || 0), 0) || 0;
    const pendingBets = betStats?.filter(b => b.status === 'pending').length || 0;

    // Calculate 24h stats
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    const bets24h = betStats?.filter(b => new Date(b.created_at) >= oneDayAgo) || [];
    const staked24h = bets24h.reduce((sum, b) => sum + Number(b.total_stake || 0), 0);

    // Fetch admin assignments
    const { data: assignments, error: assignError } = await supabaseAdmin
      .from('admin_tenant_assignments')
      .select('*')
      .is('revoked_at', null);

    if (assignError) throw assignError;

    // Build tenant KPIs
    const tenantKpis = (tenants || []).map(tenant => {
      const tenantAssignments = assignments?.filter(a => a.tenant_id === tenant.id) || [];
      
      return {
        tenant_id: tenant.id,
        country_code: tenant.country_code,
        country_name: tenant.country_name,
        currency: tenant.currency,
        is_active: tenant.is_active,
        regulatory_license: tenant.regulatory_license,
        license_expiry: tenant.license_expiry,
        admin_count: tenantAssignments.length,
        admins_by_role: {
          country_admin: tenantAssignments.filter(a => a.admin_role === 'country_admin').length,
          compliance_officer: tenantAssignments.filter(a => a.admin_role === 'compliance_officer').length,
          finance_admin: tenantAssignments.filter(a => a.admin_role === 'finance_admin').length,
          support_agent: tenantAssignments.filter(a => a.admin_role === 'support_agent').length,
        },
      };
    });

    // Global summary
    const globalSummary = {
      active_countries: tenants?.length || 0,
      total_users: totalUsers || 0,
      total_bets: totalBets,
      total_staked: totalStaked,
      staked_24h: staked24h,
      pending_bets: pendingBets,
      total_admins: assignments?.length || 0,
      gross_revenue_estimate: totalStaked * 0.08, // 8% margin estimate
    };

    // Log the admin action
    await supabaseAdmin.rpc('log_admin_action', {
      _admin_id: user.id,
      _action: 'view_global_kpis',
      _resource_type: 'global_stats',
      _resource_id: tenantId || 'all',
      _status: 'success',
    });

    return new Response(JSON.stringify({
      global_summary: globalSummary,
      tenant_kpis: tenantKpis,
      tenants: tenants,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-global-kpis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
