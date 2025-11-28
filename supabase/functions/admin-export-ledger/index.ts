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
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify admin
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      throw new Error('Invalid token');
    }

    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'superadmin']);

    if (!roles || roles.length === 0) {
      throw new Error('Admin access required');
    }

    const { startDate, endDate, userId, format = 'csv' } = await req.json();

    // Build query
    let query = supabaseClient
      .from('ledger_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: entries, error: queryError } = await query.limit(10000);

    if (queryError) throw queryError;

    // Generate CSV
    if (format === 'csv') {
      const headers = [
        'Entry Number',
        'Date',
        'User ID',
        'Transaction Type',
        'Amount',
        'Currency',
        'Balance Before',
        'Balance After',
        'Description',
        'Reference Type',
        'Reference ID',
        'Entry Hash',
      ].join(',');

      const rows = (entries || []).map(entry => [
        entry.entry_number,
        entry.created_at,
        entry.user_id,
        entry.transaction_type,
        entry.amount,
        entry.currency,
        entry.balance_before,
        entry.balance_after,
        `"${entry.description}"`,
        entry.reference_type || '',
        entry.reference_id || '',
        entry.entry_hash || '',
      ].join(','));

      const csv = [headers, ...rows].join('\n');

      // Log export action
      await supabaseClient.rpc('log_admin_action', {
        _admin_id: user.id,
        _action: 'EXPORT_LEDGER',
        _resource_type: 'ledger',
        _payload_hash: `${entries?.length || 0} entries`,
        _status: 'success',
      });

      return new Response(csv, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ledger_export_${new Date().toISOString()}.csv"`
        },
      });
    }

    // Return JSON
    return new Response(JSON.stringify({ entries }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-export-ledger:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
