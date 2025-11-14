import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeaguesData {
  sport_key: string;
  sport_title: string;
  leagues: any[];
}

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

    const body: { leaguesData: LeaguesData } = await req.json();
    
    if (!body.leaguesData || !body.leaguesData.sport_key || !body.leaguesData.sport_title) {
      console.error('Invalid request body:', body);
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Received leagues data:', body.leaguesData.sport_key);

    // Upsert leagues data
    const { error } = await supabaseClient
      .from('sports_leagues')
      .upsert({
        sport_key: body.leaguesData.sport_key,
        sport_title: body.leaguesData.sport_title,
        leagues: body.leaguesData.leagues || [],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'sport_key'
      });

    if (error) {
      console.error('Error upserting leagues:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Successfully updated leagues for:', body.leaguesData.sport_key);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Leagues updated for ${body.leaguesData.sport_key}` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in update-leagues:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
