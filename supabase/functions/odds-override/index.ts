import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate trader
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { action, matchId, marketType, selectionValue, originalOdds, overrideOdds, reason, durationMinutes } = await req.json();

    if (action === 'push_override') {
      // Calculate expiry time
      const expiresAt = durationMinutes 
        ? new Date(Date.now() + durationMinutes * 60 * 1000).toISOString()
        : null;

      // Deactivate any existing active overrides for this selection
      await supabase
        .from('odds_overrides')
        .update({ is_active: false })
        .eq('match_id', matchId)
        .eq('market_type', marketType)
        .eq('selection_value', selectionValue)
        .eq('is_active', true);

      // Create new override
      const { data: override, error: overrideError } = await supabase
        .from('odds_overrides')
        .insert({
          match_id: matchId,
          market_type: marketType,
          selection_value: selectionValue,
          original_odds: originalOdds,
          override_odds: overrideOdds,
          trader_id: user.id,
          reason: reason || 'Manual trader override',
          expires_at: expiresAt,
          is_active: true
        })
        .select()
        .single();

      if (overrideError) throw overrideError;

      // Log to admin audit trail
      await supabase.rpc('log_admin_action', {
        _admin_id: user.id,
        _action: 'odds_override',
        _resource_type: 'market',
        _resource_id: matchId,
        _status: 'success'
      });

      // Broadcast odds change via WebSocket
      await supabase
        .channel('odds_updates')
        .send({
          type: 'broadcast',
          event: 'odds_changed',
          payload: {
            matchId,
            marketType,
            selectionValue,
            newOdds: overrideOdds,
            override: true
          }
        });

      return new Response(
        JSON.stringify({ 
          override,
          message: 'Odds override pushed successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'deactivate_override') {
      const { overrideId } = await req.json();

      const { data: override, error } = await supabase
        .from('odds_overrides')
        .update({ is_active: false })
        .eq('id', overrideId)
        .eq('trader_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ override, message: 'Override deactivated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_active_overrides') {
      const { data: overrides } = await supabase
        .from('odds_overrides')
        .select('*')
        .eq('is_active', true)
        .order('applied_at', { ascending: false });

      return new Response(
        JSON.stringify({ overrides }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error: any) {
    console.error('Error in odds-override:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
