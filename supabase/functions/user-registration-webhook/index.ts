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
      console.error('Missing authorization header');
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const body: { userId: string } = await req.json();
    
    if (!body.userId) {
      console.error('Missing userId in request body');
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing user registration webhook for userId:', body.userId);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', body.userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch webhook URL from settings
    const { data: webhookSettings } = await supabaseClient
      .from('admin_webhook_settings')
      .select('user_registered')
      .eq('id', 1)
      .single();

    const n8nWebhookUrl = webhookSettings?.user_registered || 'https://pannaafric.app.n8n.cloud/webhook/user-registration';

    console.log('Sending user registration to n8n:', n8nWebhookUrl);

    // Send to n8n webhook
    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: profile.id,
        username: profile.full_name || 'Unknown',
        email: profile.email,
        registered_at: profile.created_at
      })
    });

    if (!webhookResponse.ok) {
      console.error('Failed to send webhook to n8n:', await webhookResponse.text());
    } else {
      console.log('Successfully sent user registration to n8n');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'User registration webhook processed' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in user-registration-webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
