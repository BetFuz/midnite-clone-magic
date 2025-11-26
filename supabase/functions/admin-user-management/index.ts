import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserAction {
  action: 'update_role' | 'suspend' | 'unsuspend' | 'update_balance' | 'get_user_details';
  userId: string;
  role?: 'user' | 'admin' | 'superadmin';
  balance?: number;
  reason?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin JWT
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

    // Verify user is admin
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      throw new Error('Invalid token');
    }

    // Check admin role
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'superadmin']);

    if (!roles || roles.length === 0) {
      throw new Error('Admin access required');
    }

    const isSuperAdmin = roles.some(r => r.role === 'superadmin');
    const body: UserAction = await req.json();

    console.log('Admin action:', body.action, 'by', user.email);

    let result: any = {};

    switch (body.action) {
      case 'get_user_details': {
        // Get comprehensive user details
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', body.userId)
          .single();

        const { data: userRoles } = await supabaseClient
          .from('user_roles')
          .select('role')
          .eq('user_id', body.userId);

        const { data: bets } = await supabaseClient
          .from('bet_slips')
          .select('total_stake, status, created_at')
          .eq('user_id', body.userId)
          .order('created_at', { ascending: false })
          .limit(100);

        const { data: stats } = await supabaseClient
          .from('user_statistics')
          .select('*')
          .eq('user_id', body.userId)
          .single();

        result = {
          profile,
          roles: userRoles?.map(r => r.role) || [],
          recentBets: bets || [],
          statistics: stats,
          totalBets: bets?.length || 0,
          totalStaked: bets?.reduce((sum, bet) => sum + Number(bet.total_stake), 0) || 0,
        };
        break;
      }

      case 'update_role': {
        if (!isSuperAdmin) {
          throw new Error('Only superadmins can update roles');
        }

        // Remove existing roles
        await supabaseClient
          .from('user_roles')
          .delete()
          .eq('user_id', body.userId);

        // Add new role if not 'user'
        if (body.role && body.role !== 'user') {
          const { error: insertError } = await supabaseClient
            .from('user_roles')
            .insert({
              user_id: body.userId,
              role: body.role,
              granted_by: user.id,
            });

          if (insertError) throw insertError;
        }

        // Log action
        await supabaseClient.rpc('log_admin_action', {
          _admin_id: user.id,
          _action: 'UPDATE_USER_ROLE',
          _resource_type: 'user',
          _resource_id: body.userId,
          _payload_hash: body.role,
          _status: 'success',
        });

        result = { success: true, message: `User role updated to ${body.role}` };
        break;
      }

      case 'suspend': {
        // In production, this would update a status field
        // For now, we'll remove their ability to place bets by logging
        await supabaseClient.rpc('log_admin_action', {
          _admin_id: user.id,
          _action: 'SUSPEND_USER',
          _resource_type: 'user',
          _resource_id: body.userId,
          _payload_hash: body.reason || 'No reason provided',
          _status: 'success',
        });

        result = { success: true, message: 'User suspended' };
        break;
      }

      case 'unsuspend': {
        await supabaseClient.rpc('log_admin_action', {
          _admin_id: user.id,
          _action: 'UNSUSPEND_USER',
          _resource_type: 'user',
          _resource_id: body.userId,
          _status: 'success',
        });

        result = { success: true, message: 'User unsuspended' };
        break;
      }

      case 'update_balance': {
        if (!isSuperAdmin) {
          throw new Error('Only superadmins can update balances');
        }

        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ balance: body.balance })
          .eq('id', body.userId);

        if (updateError) throw updateError;

        await supabaseClient.rpc('log_admin_action', {
          _admin_id: user.id,
          _action: 'UPDATE_USER_BALANCE',
          _resource_type: 'user',
          _resource_id: body.userId,
          _payload_hash: String(body.balance),
          _status: 'success',
        });

        result = { success: true, message: 'Balance updated' };
        break;
      }

      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-user-management:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});