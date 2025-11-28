import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClientWithAuth } from "../_shared/supabase-client.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization header' }, 401);
    }

    const supabase = createClientWithAuth(authHeader);

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { 
      daily_stake_limit, 
      daily_loss_limit, 
      session_time_limit,
      cooling_off_days,
      self_exclusion_days
    } = await req.json();

    console.log('Setting gaming limits for user:', user.id);

    // Calculate cooling off and self-exclusion dates
    const cooling_off_until = cooling_off_days 
      ? new Date(Date.now() + cooling_off_days * 24 * 60 * 60 * 1000).toISOString()
      : null;
    
    const self_excluded_until = self_exclusion_days
      ? new Date(Date.now() + self_exclusion_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Upsert gaming limits
    const { data: limits, error: limitsError } = await supabase
      .from('responsible_gaming_limits')
      .upsert({
        user_id: user.id,
        daily_stake_limit: daily_stake_limit || 100000,
        daily_loss_limit: daily_loss_limit || 50000,
        session_time_limit: session_time_limit || 180,
        cooling_off_until,
        self_excluded_until,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (limitsError) {
      console.error('Error setting gaming limits:', limitsError);
      return jsonResponse({ error: 'Failed to set gaming limits' }, 500);
    }

    console.log('Gaming limits set successfully:', limits);

    return jsonResponse({ 
      limits,
      message: 'Gaming limits updated successfully'
    }, 200);

  } catch (error) {
    console.error('Error in set-gaming-limits function:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
