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
    const { sport } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const leagueTemplates: Record<string, Array<{ name: string; season: string; entry_fee: number; prize_pool: number; max_participants: number }>> = {
      football: [
        { name: "Premier League Fantasy", season: "2024/25", entry_fee: 5000, prize_pool: 5000000, max_participants: 1000 },
        { name: "Champions League Fantasy", season: "2024/25", entry_fee: 10000, prize_pool: 10000000, max_participants: 500 },
        { name: "La Liga Fantasy", season: "2024/25", entry_fee: 5000, prize_pool: 4000000, max_participants: 800 },
        { name: "Serie A Fantasy", season: "2024/25", entry_fee: 5000, prize_pool: 4000000, max_participants: 800 },
        { name: "Bundesliga Fantasy", season: "2024/25", entry_fee: 5000, prize_pool: 4000000, max_participants: 800 },
        { name: "AFCON Fantasy", season: "2025", entry_fee: 10000, prize_pool: 15000000, max_participants: 2000 },
        { name: "CAF Champions League", season: "2024/25", entry_fee: 7500, prize_pool: 7500000, max_participants: 600 },
        { name: "Nigerian Professional League", season: "2024/25", entry_fee: 3000, prize_pool: 2000000, max_participants: 1500 },
        { name: "Egyptian Premier League", season: "2024/25", entry_fee: 3000, prize_pool: 2000000, max_participants: 1000 },
        { name: "South African Premier Division", season: "2024/25", entry_fee: 3000, prize_pool: 2000000, max_participants: 1000 },
      ],
      basketball: [
        { name: "NBA Fantasy", season: "2024/25", entry_fee: 10000, prize_pool: 20000000, max_participants: 2000 },
        { name: "WNBA Fantasy", season: "2025", entry_fee: 5000, prize_pool: 5000000, max_participants: 1000 },
        { name: "EuroLeague Fantasy", season: "2024/25", entry_fee: 7500, prize_pool: 10000000, max_participants: 800 },
        { name: "NCAA March Madness", season: "2025", entry_fee: 5000, prize_pool: 8000000, max_participants: 1500 },
        { name: "Spanish ACB Fantasy", season: "2024/25", entry_fee: 5000, prize_pool: 3000000, max_participants: 600 },
      ],
      cricket: [
        { name: "IPL Fantasy", season: "2025", entry_fee: 10000, prize_pool: 15000000, max_participants: 2000 },
        { name: "T20 World Cup Fantasy", season: "2025", entry_fee: 15000, prize_pool: 25000000, max_participants: 3000 },
        { name: "The Ashes Fantasy", season: "2025", entry_fee: 7500, prize_pool: 10000000, max_participants: 1000 },
        { name: "Big Bash League", season: "2024/25", entry_fee: 5000, prize_pool: 5000000, max_participants: 800 },
      ],
      tennis: [
        { name: "Grand Slam Fantasy", season: "2025", entry_fee: 10000, prize_pool: 15000000, max_participants: 1500 },
        { name: "ATP Masters Fantasy", season: "2025", entry_fee: 7500, prize_pool: 10000000, max_participants: 1000 },
        { name: "WTA Premier Fantasy", season: "2025", entry_fee: 7500, prize_pool: 10000000, max_participants: 1000 },
      ],
      rugby: [
        { name: "Six Nations Fantasy", season: "2025", entry_fee: 7500, prize_pool: 10000000, max_participants: 1000 },
        { name: "Rugby Championship Fantasy", season: "2025", entry_fee: 7500, prize_pool: 8000000, max_participants: 800 },
        { name: "Super Rugby Fantasy", season: "2025", entry_fee: 5000, prize_pool: 5000000, max_participants: 600 },
      ],
      "ice-hockey": [
        { name: "NHL Fantasy", season: "2024/25", entry_fee: 10000, prize_pool: 15000000, max_participants: 1500 },
        { name: "KHL Fantasy", season: "2024/25", entry_fee: 5000, prize_pool: 5000000, max_participants: 800 },
      ],
      baseball: [
        { name: "MLB Fantasy", season: "2025", entry_fee: 10000, prize_pool: 20000000, max_participants: 2000 },
        { name: "World Series Fantasy", season: "2025", entry_fee: 15000, prize_pool: 25000000, max_participants: 2500 },
      ],
      "american-football": [
        { name: "NFL Fantasy", season: "2024/25", entry_fee: 15000, prize_pool: 30000000, max_participants: 3000 },
        { name: "Super Bowl Fantasy", season: "2025", entry_fee: 20000, prize_pool: 40000000, max_participants: 5000 },
        { name: "College Football Fantasy", season: "2024/25", entry_fee: 7500, prize_pool: 10000000, max_participants: 1500 },
      ],
      volleyball: [
        { name: "FIVB World Championship Fantasy", season: "2025", entry_fee: 5000, prize_pool: 5000000, max_participants: 800 },
        { name: "European Volleyball Championship", season: "2025", entry_fee: 5000, prize_pool: 4000000, max_participants: 600 },
      ],
    };

    const templates = leagueTemplates[sport.toLowerCase()];
    if (!templates) {
      return new Response(
        JSON.stringify({ error: `No templates found for sport: ${sport}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 14);

    const sportName = sport === 'football' ? 'Football' 
      : sport === 'basketball' ? 'Basketball'
      : sport === 'cricket' ? 'Cricket'
      : sport === 'tennis' ? 'Tennis'
      : sport === 'rugby' ? 'Rugby'
      : sport === 'ice-hockey' ? 'Ice Hockey'
      : sport === 'baseball' ? 'Baseball'
      : sport === 'american-football' ? 'American Football'
      : sport === 'volleyball' ? 'Volleyball'
      : sport;

    const leagues = templates.map(template => ({
      ...template,
      sport: sportName,
      deadline: deadline.toISOString(),
      status: 'open',
    }));

    const { data, error } = await supabaseClient
      .from('fantasy_leagues')
      .insert(leagues)
      .select();

    if (error) {
      console.error('Error creating leagues:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Also generate players for this sport if they don't exist
    try {
      await supabaseClient.functions.invoke('fantasy-player-projections', {
        body: { sport: sportName, leagueId: data[0]?.id }
      });
    } catch (playerError) {
      console.error('Error generating players:', playerError);
      // Don't fail the whole request if player generation fails
    }

    return new Response(
      JSON.stringify({ success: true, leagues: data, count: data.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-fantasy-leagues function:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
