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
    // Verify Bearer token
    const authHeader = req.headers.get('Authorization');
    const expectedToken = Deno.env.get('N8N_BEARER_TOKEN');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    if (token !== expectedToken) {
      console.error('Invalid bearer token');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: { content: string } = await req.json();
    
    if (!body.content || typeof body.content !== 'string') {
      console.error('Invalid request body:', body);
      return new Response(JSON.stringify({ error: 'Content is required and must be a string' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Received marketing post content, length:', body.content.length);

    // Insert marketing post
    const { data, error } = await supabaseClient
      .from('marketing_posts')
      .insert({
        content: body.content,
        status: 'active',
        posted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting marketing post:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Successfully created marketing post:', data.id);

    // Broadcast to realtime channel for instant updates
    const channel = supabaseClient.channel('marketing:updates');
    await channel.send({
      type: 'broadcast',
      event: 'new_post',
      payload: {
        id: data.id,
        content: data.content,
        posted_at: data.posted_at
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Marketing post created successfully',
      post_id: data.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in marketing-post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
