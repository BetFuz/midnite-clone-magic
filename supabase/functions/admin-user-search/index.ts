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

    const { searchTerm, searchType } = await req.json();

    let query = supabaseClient.from('profiles').select(`
      id,
      email,
      full_name,
      phone,
      balance,
      created_at,
      updated_at
    `);

    // Search by type
    if (searchType === 'email') {
      query = query.ilike('email', `%${searchTerm}%`);
    } else if (searchType === 'phone') {
      query = query.ilike('phone', `%${searchTerm}%`);
    } else if (searchType === 'name') {
      query = query.ilike('full_name', `%${searchTerm}%`);
    } else if (searchType === 'id') {
      query = query.eq('id', searchTerm);
    }

    const { data: users, error: searchError } = await query.limit(50);

    if (searchError) throw searchError;

    // Enrich with bet statistics
    const enrichedUsers = await Promise.all(
      (users || []).map(async (user) => {
        const { data: bets } = await supabaseClient
          .from('bet_slips')
          .select('total_stake, status')
          .eq('user_id', user.id);

        const totalBets = bets?.length || 0;
        const totalStaked = bets?.reduce((sum, bet) => sum + Number(bet.total_stake), 0) || 0;
        const pendingBets = bets?.filter(b => b.status === 'pending').length || 0;

        return {
          ...user,
          totalBets,
          totalStaked,
          pendingBets,
        };
      })
    );

    // Log search action
    await supabaseClient.rpc('log_admin_action', {
      _admin_id: user.id,
      _action: 'USER_SEARCH',
      _resource_type: 'user',
      _payload_hash: searchTerm,
      _status: 'success',
    });

    return new Response(JSON.stringify({ users: enrichedUsers }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-user-search:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
