import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookConfig {
  bet_placed?: string;
  bet_won?: string;
  bet_lost?: string;
  deposit?: string;
  withdrawal?: string;
  user_registered?: string;
}

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

    // Verify JWT and get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has admin or superadmin role
    const { data: roles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'superadmin']);

    if (roleError || !roles || roles.length === 0) {
      console.error('Role check failed:', roleError);
      
      // Log failed admin access attempt
      await supabaseClient.rpc('log_admin_action', {
        _admin_id: user.id,
        _action: 'WEBHOOK_ACCESS_DENIED',
        _resource_type: 'webhook_settings',
        _ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        _user_agent: req.headers.get('user-agent') || 'unknown',
        _status: 'failed',
        _error_message: 'User does not have admin privileges'
      });

      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { method } = req;
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    if (method === 'GET') {
      // Fetch webhook settings from a secure admin table
      const { data, error } = await supabaseClient
        .from('admin_webhook_settings')
        .select('*')
        .single();

      // Log admin action
      await supabaseClient.rpc('log_admin_action', {
        _admin_id: user.id,
        _action: 'WEBHOOK_SETTINGS_VIEW',
        _resource_type: 'webhook_settings',
        _ip_address: clientIp,
        _user_agent: userAgent,
        _status: 'success'
      });

      return new Response(JSON.stringify({ data: data || {} }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'POST' || method === 'PUT') {
      const body: WebhookConfig = await req.json();

      // Validate webhook URLs
      for (const [key, url] of Object.entries(body)) {
        if (url && !url.startsWith('https://')) {
          return new Response(JSON.stringify({ error: `Invalid URL for ${key}: must use HTTPS` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Create payload hash for audit
      const payloadStr = JSON.stringify(body);
      const payloadHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(payloadStr)
      ).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));

      // Save to secure admin table
      const { data, error } = await supabaseClient
        .from('admin_webhook_settings')
        .upsert({
          id: 1, // Single row for webhook config
          ...body,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      // Log admin action
      await supabaseClient.rpc('log_admin_action', {
        _admin_id: user.id,
        _action: 'WEBHOOK_SETTINGS_UPDATE',
        _resource_type: 'webhook_settings',
        _resource_id: '1',
        _payload_hash: payloadHash,
        _ip_address: clientIp,
        _user_agent: userAgent,
        _status: error ? 'failed' : 'success',
        _error_message: error?.message || null
      });

      if (error) {
        console.error('Update error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'DELETE') {
      const { eventType } = await req.json();

      // Log admin action
      await supabaseClient.rpc('log_admin_action', {
        _admin_id: user.id,
        _action: 'WEBHOOK_SETTINGS_DELETE',
        _resource_type: 'webhook_settings',
        _resource_id: eventType,
        _ip_address: clientIp,
        _user_agent: userAgent,
        _status: 'success'
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-webhook-settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
