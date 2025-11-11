import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-mfa',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none';",
};

// IP Allowlist - configure for production
const ALLOWED_IPS = Deno.env.get('ADMIN_ALLOWED_IPS')?.split(',') || [];
const ENABLE_IP_WHITELIST = Deno.env.get('ENABLE_ADMIN_IP_WHITELIST') === 'true';

// Rate limiting state (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute per admin

interface AdminValidationResult {
  valid: boolean;
  user?: any;
  role?: string;
  error?: string;
  mfaVerified?: boolean;
}

async function validateAdminAccess(req: Request): Promise<AdminValidationResult> {
  try {
    // 1. Check IP allowlist (if enabled)
    if (ENABLE_IP_WHITELIST && ALLOWED_IPS.length > 0) {
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                       req.headers.get('x-real-ip') || 
                       'unknown';
      
      if (!ALLOWED_IPS.includes(clientIp)) {
        console.warn(`Blocked access from non-whitelisted IP: ${clientIp}`);
        return { valid: false, error: 'IP not authorized' };
      }
    }

    // 2. Validate JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return { valid: false, error: 'Missing authorization' };
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return { valid: false, error: 'Invalid token' };
    }

    // 3. Check token age (must be fresh - not older than 15 minutes)
    const token = authHeader.replace('Bearer ', '');
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        const tokenAge = Date.now() / 1000 - (payload.iat || 0);
        if (tokenAge > 900) { // 15 minutes
          return { valid: false, error: 'Token too old, please re-authenticate' };
        }
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }

    // 4. Check admin role
    const { data: roles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'superadmin']);

    if (roleError || !roles || roles.length === 0) {
      return { valid: false, error: 'Admin role required' };
    }

    // 5. Check MFA verification (optional but recommended)
    const mfaHeader = req.headers.get('x-admin-mfa');
    const mfaVerified = mfaHeader === 'verified';

    // 6. Rate limiting per admin user
    const adminId = user.id;
    const now = Date.now();
    const rateLimitKey = `admin:${adminId}`;
    const rateLimitData = rateLimitMap.get(rateLimitKey);

    if (rateLimitData) {
      if (now < rateLimitData.resetAt) {
        if (rateLimitData.count >= RATE_LIMIT_MAX) {
          return { valid: false, error: 'Rate limit exceeded' };
        }
        rateLimitData.count++;
      } else {
        rateLimitMap.set(rateLimitKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
      }
    } else {
      rateLimitMap.set(rateLimitKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    }

    return {
      valid: true,
      user,
      role: roles[0].role,
      mfaVerified,
    };
  } catch (error) {
    console.error('Error in validateAdminAccess:', error);
    return { valid: false, error: 'Validation error' };
  }
}

async function routeAdminRequest(req: Request, validation: AdminValidationResult): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  // Route to appropriate admin service
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Log the admin API access
  await supabaseClient.rpc('log_admin_action', {
    _admin_id: validation.user.id,
    _action: 'API_GATEWAY_ACCESS',
    _resource_type: 'api_gateway',
    _resource_id: path,
    _ip_address: req.headers.get('x-forwarded-for') || 'unknown',
    _user_agent: req.headers.get('user-agent') || 'unknown',
    _mfa_verified: validation.mfaVerified || false,
    _status: 'success'
  });

  // Admin service routing
  if (path.startsWith('/admin/webhooks')) {
    return new Response(JSON.stringify({ 
      service: 'admin-webhook-settings',
      message: 'Use admin-webhook-settings function directly'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (path.startsWith('/admin/audit-logs')) {
    return new Response(JSON.stringify({ 
      service: 'admin-audit-logs',
      message: 'Use admin-audit-logs function directly'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Service not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate admin access with all checks
    const validation = await validateAdminAccess(req);

    if (!validation.valid) {
      // Log failed access attempt
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const url = new URL(req.url);
      await supabaseClient.rpc('log_admin_action', {
        _admin_id: validation.user?.id || '00000000-0000-0000-0000-000000000000',
        _action: 'API_GATEWAY_ACCESS_DENIED',
        _resource_type: 'api_gateway',
        _resource_id: url.pathname,
        _ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        _user_agent: req.headers.get('user-agent') || 'unknown',
        _status: 'failed',
        _error_message: validation.error || 'Unknown error'
      });

      return new Response(JSON.stringify({ error: validation.error }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route to appropriate admin service
    return await routeAdminRequest(req, validation);

  } catch (error) {
    console.error('Error in admin-api-gateway:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
