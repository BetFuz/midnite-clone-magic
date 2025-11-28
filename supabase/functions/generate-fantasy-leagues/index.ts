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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get all upcoming matches for the next 7 days
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data: matches, error: matchError } = await supabaseClient
      .from('matches')
      .select('*')
      .gte('commence_time', now.toISOString())
      .lte('commence_time', nextWeek.toISOString())
      .eq('status', 'upcoming')
      .order('commence_time', { ascending: true });

    if (matchError) throw matchError;

    if (!matches || matches.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No upcoming matches found', created: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For each match, check if fantasy league exists, if not create it
    const leaguesToCreate = [];
    
    for (const match of matches) {
      // Check if league already exists for this match
      const { data: existingLeague } = await supabaseClient
        .from('fantasy_leagues')
        .select('id')
        .eq('sport', match.sport_title)
        .eq('season', match.league_name)
        .eq('name', `${match.home_team} vs ${match.away_team}`)
        .maybeSingle();

      if (!existingLeague) {
        // Calculate prize pool based on entry fee
        const entryFee = 5000; // ₦5,000 base entry fee
        const estimatedParticipants = 50;
        const prizePool = entryFee * estimatedParticipants * 0.9; // 90% goes to prize pool

        leaguesToCreate.push({
          name: `${match.home_team} vs ${match.away_team}`,
          sport: match.sport_title,
          season: match.league_name,
          entry_fee: entryFee,
          prize_pool: prizePool,
          deadline: new Date(new Date(match.commence_time).getTime() - 60 * 60 * 1000).toISOString(), // 1 hour before match
          status: 'open',
          max_participants: 100,
        });
      }
    }

    if (leaguesToCreate.length > 0) {
      const { data: createdLeagues, error: createError } = await supabaseClient
        .from('fantasy_leagues')
        .insert(leaguesToCreate)
        .select();

      if (createError) throw createError;

      return new Response(
        JSON.stringify({ 
          message: 'Fantasy leagues generated successfully',
          created: leaguesToCreate.length,
          leagues: createdLeagues,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: 'All fantasy leagues already exist',
        created: 0,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating fantasy leagues:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
