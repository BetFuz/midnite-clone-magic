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

    // Get all upcoming matches for the next 14 days
    const now = new Date();
    const nextTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const { data: matches, error: matchError } = await supabaseClient
      .from('matches')
      .select('*')
      .gte('commence_time', now.toISOString())
      .lte('commence_time', nextTwoWeeks.toISOString())
      .eq('status', 'upcoming')
      .order('commence_time', { ascending: true });

    if (matchError) throw matchError;

    if (!matches || matches.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No upcoming matches found', created: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sport-specific configurations
    const sportConfig: Record<string, { entryFee: number; prizeMultiplier: number }> = {
      'Football': { entryFee: 10000, prizeMultiplier: 15 },
      'Soccer': { entryFee: 10000, prizeMultiplier: 15 },
      'Basketball': { entryFee: 8000, prizeMultiplier: 12 },
      'Tennis': { entryFee: 5000, prizeMultiplier: 10 },
      'Cricket': { entryFee: 7000, prizeMultiplier: 12 },
      'Rugby': { entryFee: 6000, prizeMultiplier: 10 },
      'Ice Hockey': { entryFee: 5000, prizeMultiplier: 10 },
      'Baseball': { entryFee: 5000, prizeMultiplier: 10 },
      'American Football': { entryFee: 8000, prizeMultiplier: 12 },
      'Volleyball': { entryFee: 4000, prizeMultiplier: 8 }
    };

    // For each match, check if fantasy league exists, if not create multiple tiers
    const leaguesToCreate = [];
    
    for (const match of matches) {
      const sport = match.sport_title;
      const config = sportConfig[sport] || { entryFee: 5000, prizeMultiplier: 10 };
      const isPopularSport = ['Football', 'Soccer', 'Basketball'].includes(sport);
      
      // Check if league already exists for this match
      const { data: existingLeague } = await supabaseClient
        .from('fantasy_leagues')
        .select('id')
        .eq('sport', sport)
        .eq('season', match.league_name)
        .eq('name', `${match.home_team} vs ${match.away_team}`)
        .maybeSingle();

      if (!existingLeague) {
        const deadline = new Date(new Date(match.commence_time).getTime() - 60 * 60 * 1000).toISOString();
        
        // Standard League
        leaguesToCreate.push({
          name: `${match.home_team} vs ${match.away_team}`,
          sport: sport,
          season: match.league_name,
          entry_fee: config.entryFee,
          prize_pool: config.entryFee * config.prizeMultiplier,
          deadline: deadline,
          status: 'open',
          max_participants: 100,
        });

        // Premium & Beginner tiers for popular sports
        if (isPopularSport) {
          leaguesToCreate.push({
            name: `${match.home_team} vs ${match.away_team} - Premium`,
            sport: sport,
            season: match.league_name,
            entry_fee: config.entryFee * 5,
            prize_pool: config.entryFee * 5 * config.prizeMultiplier * 1.2,
            deadline: deadline,
            status: 'open',
            max_participants: 50,
          });
          
          leaguesToCreate.push({
            name: `${match.home_team} vs ${match.away_team} - Beginner`,
            sport: sport,
            season: match.league_name,
            entry_fee: Math.floor(config.entryFee / 2),
            prize_pool: Math.floor(config.entryFee / 2) * config.prizeMultiplier,
            deadline: deadline,
            status: 'open',
            max_participants: 200,
          });
        }
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
