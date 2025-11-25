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

    const { notificationIds } = await req.json();

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return jsonResponse({ error: 'Invalid notification IDs' }, 400);
    }

    // Mark notifications as read
    const { error: updateError } = await supabase
      .from('pending_notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .in('id', notificationIds);

    if (updateError) {
      console.error('Error marking notifications as read:', updateError);
      return jsonResponse({ error: 'Failed to update notifications' }, 500);
    }

    return jsonResponse({ 
      success: true,
      marked: notificationIds.length 
    });

  } catch (error) {
    console.error('Error in mark-notifications-read function:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
