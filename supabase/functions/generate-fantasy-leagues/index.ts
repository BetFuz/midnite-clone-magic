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
    // Start background generation - fire and forget
    const backgroundTask = (async () => {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      const now = new Date();
      const nextTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      const { data: matches, error: matchError } = await supabaseClient
        .from('matches')
        .select('*')
        .gte('commence_time', now.toISOString())
        .lte('commence_time', nextTwoWeeks.toISOString())
        .eq('status', 'upcoming')
        .order('commence_time', { ascending: true });

      if (matchError || !matches || matches.length === 0) {
        console.log('No matches to process');
        return;
      }

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

      const leaguesToCreate = [];
      
      for (const match of matches) {
        const sport = match.sport_title;
        const config = sportConfig[sport] || { entryFee: 5000, prizeMultiplier: 10 };
        const isPopularSport = ['Football', 'Soccer', 'Basketball'].includes(sport);
        
        const { data: existingLeague } = await supabaseClient
          .from('fantasy_leagues')
          .select('id')
          .eq('sport', sport)
          .eq('season', match.league_name)
          .eq('name', `${match.home_team} vs ${match.away_team}`)
          .maybeSingle();

        if (!existingLeague) {
          const deadline = new Date(new Date(match.commence_time).getTime() - 60 * 60 * 1000).toISOString();
          
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
        await supabaseClient
          .from('fantasy_leagues')
          .insert(leaguesToCreate);
        console.log(`Background: Created ${leaguesToCreate.length} leagues`);
      }
    })();

    // Return immediately without waiting
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'League generation started'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error starting fantasy league generation:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
