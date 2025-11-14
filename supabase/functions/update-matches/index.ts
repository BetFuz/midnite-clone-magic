import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Match {
  match_id: string;
  sport_key: string;
  sport_title: string;
  league_name: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  home_odds?: number;
  draw_odds?: number;
  away_odds?: number;
  status?: string;
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

    const body: { matches: Match[] } = await req.json();
    
    if (!body.matches || !Array.isArray(body.matches)) {
      console.error('Invalid request body:', body);
      return new Response(JSON.stringify({ error: 'Invalid request body - matches array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Received ${body.matches.length} matches to update`);

    // Upsert matches data
    const { error } = await supabaseClient
      .from('matches')
      .upsert(body.matches, {
        onConflict: 'match_id'
      });

    if (error) {
      console.error('Error upserting matches:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Successfully updated ${body.matches.length} matches`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Updated ${body.matches.length} matches` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in update-matches:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});