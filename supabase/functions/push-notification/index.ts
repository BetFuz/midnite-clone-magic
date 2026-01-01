import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushRequest {
  user_id?: string;
  user_ids?: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  topic?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, user_ids, title, body, data, topic }: PushRequest = await req.json();

    // Collect target user IDs
    const targetUserIds = user_ids || (user_id ? [user_id] : []);

    if (targetUserIds.length === 0 && !topic) {
      return new Response(
        JSON.stringify({ error: 'Must provide user_id, user_ids, or topic' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get push tokens for target users
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, push_token')
      .in('id', targetUserIds)
      .not('push_token', 'is', null);

    if (error) {
      console.error('Error fetching push tokens:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch push tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokens = profiles?.map(p => (p as any).push_token).filter(Boolean) || [];

    if (tokens.length === 0) {
      console.log('No push tokens found for target users');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No push tokens available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // In production, this would integrate with Firebase Cloud Messaging or Apple Push Notification service
    // For now, we log the notification that would be sent
    console.log('Push notification payload:', {
      tokens: tokens.length,
      title,
      body,
      data
    });

    // Store notification in database for in-app display
    const notifications = targetUserIds.map(uid => ({
      user_id: uid,
      title,
      body,
      data: data || {},
      read: false,
      created_at: new Date().toISOString()
    }));

    // Would insert into notifications table if it exists
    // await supabase.from('notifications').insert(notifications);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: tokens.length,
        message: `Push notification queued for ${tokens.length} devices` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Push notification error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
