import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, userId, exclusionType, reason, duration } = await req.json();

    if (action === 'request_exclusion') {
      // Calculate expiry date for temporary exclusions
      let expiresAt = null;
      if (exclusionType === 'temporary' && duration) {
        expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString();
      } else if (exclusionType === 'cooling_off') {
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
      }

      // Create self-exclusion record
      const { data: exclusion, error: exclusionError } = await supabase
        .from('self_exclusion_registry')
        .insert({
          user_id: userId,
          exclusion_type: exclusionType,
          reason: reason || '',
          expires_at: expiresAt,
          nlrc_sync_status: 'pending'
        })
        .select()
        .single();

      if (exclusionError) throw exclusionError;

      // Immediately block user from betting
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          is_self_excluded: true,
          self_excluded_until: expiresAt 
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Sync to NLRC central database
      const syncResult = await syncToNLRC(exclusion);

      // Update sync status
      await supabase
        .from('self_exclusion_registry')
        .update({
          nlrc_sync_status: syncResult.success ? 'synced' : 'failed',
          synced_to_nlrc_at: syncResult.success ? new Date().toISOString() : null,
          nlrc_reference_id: syncResult.referenceId
        })
        .eq('id', exclusion.id);

      return new Response(
        JSON.stringify({ 
          exclusion,
          syncResult,
          message: 'Self-exclusion activated and synced to NLRC'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'check_exclusion') {
      const { data: exclusion } = await supabase
        .from('self_exclusion_registry')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!exclusion) {
        return new Response(
          JSON.stringify({ excluded: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if temporary exclusion has expired
      if (exclusion.exclusion_type !== 'permanent' && exclusion.expires_at) {
        const now = new Date();
        const expiryDate = new Date(exclusion.expires_at);
        
        if (now > expiryDate) {
          // Exclusion has expired, remove it
          await supabase
            .from('profiles')
            .update({ 
              is_self_excluded: false,
              self_excluded_until: null 
            })
            .eq('id', userId);

          return new Response(
            JSON.stringify({ 
              excluded: false, 
              message: 'Exclusion period has expired' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ 
          excluded: true, 
          exclusion,
          message: 'User is currently self-excluded'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'sync_pending') {
      // Sync all pending records to NLRC (run as cron job)
      const { data: pending } = await supabase
        .from('self_exclusion_registry')
        .select('*')
        .eq('nlrc_sync_status', 'pending');

      const results = [];
      for (const record of pending || []) {
        const syncResult = await syncToNLRC(record);
        
        await supabase
          .from('self_exclusion_registry')
          .update({
            nlrc_sync_status: syncResult.success ? 'synced' : 'failed',
            synced_to_nlrc_at: syncResult.success ? new Date().toISOString() : null,
            nlrc_reference_id: syncResult.referenceId
          })
          .eq('id', record.id);

        results.push({ recordId: record.id, syncResult });
      }

      return new Response(
        JSON.stringify({ results, message: 'Batch sync completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error: any) {
    console.error('Error in self-exclusion-sync:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function syncToNLRC(exclusion: any): Promise<{ success: boolean; referenceId?: string }> {
  try {
    // TODO: Integrate with NLRC Central Self-Exclusion Database API
    // This endpoint must be called when user self-excludes (mandatory 2025 code)
    
    // Mock implementation
    const nlrcApiUrl = Deno.env.get('NLRC_SELF_EXCLUSION_API_URL');
    const nlrcApiKey = Deno.env.get('NLRC_API_KEY');

    if (!nlrcApiUrl || !nlrcApiKey) {
      console.warn('NLRC API credentials not configured');
      return { success: false };
    }

    // In production, this would make actual API call to NLRC
    const response = await fetch(nlrcApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${nlrcApiKey}`
      },
      body: JSON.stringify({
        userId: exclusion.user_id,
        exclusionType: exclusion.exclusion_type,
        reason: exclusion.reason,
        requestedAt: exclusion.requested_at,
        expiresAt: exclusion.expires_at
      })
    });

    if (!response.ok) {
      throw new Error(`NLRC API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, referenceId: data.referenceId };

  } catch (error) {
    console.error('Error syncing to NLRC:', error);
    return { success: false };
  }
}
