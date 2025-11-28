import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leagueId, sport } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Fetch existing players for this sport
    const { data: existingPlayers, error: existingError } = await supabaseClient
      .from('fantasy_players')
      .select('*')
      .eq('sport', sport);

    if (existingError) {
      console.error('Error loading existing players:', existingError);
    }

    // If players already exist for this sport, just return them
    if (existingPlayers && existingPlayers.length > 0) {
      return new Response(
        JSON.stringify({
          players: existingPlayers,
          generated: false,
          count: existingPlayers.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Otherwise generate a fresh pool of default players for this sport
    const generatedPlayers = generateDefaultPlayers(sport, sport + ' Fantasy Match');

    const playersToInsert = generatedPlayers.map((p: any) => ({
      external_player_id: `${p.full_name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
      full_name: p.full_name,
      team: p.team || 'Team A',
      position: p.position,
      salary: p.salary || 5000,
      projected_points: p.projected_points || 15,
      average_points: p.average_points || p.projected_points || 15,
      sport: sport,
      injury_status: 'healthy',
      metadata: {},
    }));

    const { data: insertedPlayers, error: insertError } = await supabaseClient
      .from('fantasy_players')
      .insert(playersToInsert)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      // As a last resort, just return the generated (unpersisted) players
      return new Response(
        JSON.stringify({
          players: generatedPlayers,
          generated: true,
          count: generatedPlayers.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        players: insertedPlayers,
        generated: true,
        count: insertedPlayers?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating player projections:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function generateDefaultPlayers(sport: string, matchName: string) {
  const positions = sport === 'Football' || sport === 'Soccer' 
    ? ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'K', 'DEF']
    : sport === 'Basketball'
    ? ['PG', 'SG', 'SF', 'PF', 'C']
    : ['BAT', 'BOWL', 'ALL'];

  return positions.map((pos, idx) => ({
    full_name: `Player ${idx + 1}`,
    team: matchName.split(' vs ')[idx % 2] || 'Team A',
    position: pos,
    salary: 3000 + Math.floor(Math.random() * 7000),
    projected_points: 5 + Math.floor(Math.random() * 30),
    average_points: 5 + Math.floor(Math.random() * 30)
  }));
}
