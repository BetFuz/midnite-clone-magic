import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const oddsApiKey = Deno.env.get('ODDS_API_KEY');
    
    if (!oddsApiKey) {
      return new Response(JSON.stringify({ 
        error: 'ODDS_API_KEY not configured',
        matchesUpdated: 0 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let totalMatches = 0;
    const errors: string[] = [];

    console.log('Fetching football matches from The Odds API...');
    
    // Focus on main football leagues only
    const footballLeagues = [
      { key: 'soccer_epl', title: 'Premier League' },
      { key: 'soccer_spain_la_liga', title: 'La Liga' },
      { key: 'soccer_germany_bundesliga', title: 'Bundesliga' },
      { key: 'soccer_italy_serie_a', title: 'Serie A' },
      { key: 'soccer_france_ligue_one', title: 'Ligue 1' },
      { key: 'soccer_uefa_champs_league', title: 'Champions League' },
    ];
    
    for (const league of footballLeagues) {
      try {
        const response = await fetch(
          `https://api.the-odds-api.com/v4/sports/${league.key}/odds/?regions=uk,eu&markets=h2h&oddsFormat=decimal&apiKey=${oddsApiKey}`,
          { 
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(8000) // 8 second timeout per league
          }
        );

        if (!response.ok) {
          errors.push(`${league.title}: API returned ${response.status}`);
          continue;
        }

        const data = await response.json();
        console.log(`Fetched ${data.length} matches for ${league.title}`);
        
        if (data.length === 0) {
          console.log(`No upcoming matches for ${league.title}`);
          continue;
        }

        // Update sports_leagues
        await supabase
          .from('sports_leagues')
          .upsert({
            sport_key: league.key,
            sport_title: league.title,
            confederation: 'UEFA',
            region: league.title.includes('Champions') ? 'Europe' : league.title.split(' ')[0],
            leagues: [{ name: league.title }],
            updated_at: new Date().toISOString()
          }, { onConflict: 'sport_key' });

        // Process matches
        const matches = data.map((match: any) => {
          const bookmaker = match.bookmakers?.[0];
          const h2hMarket = bookmaker?.markets?.find((m: any) => m.key === 'h2h');
          
          let homeOdds = null;
          let awayOdds = null;
          let drawOdds = null;

          if (h2hMarket?.outcomes) {
            const homeOutcome = h2hMarket.outcomes.find((o: any) => o.name === match.home_team);
            const awayOutcome = h2hMarket.outcomes.find((o: any) => o.name === match.away_team);
            const drawOutcome = h2hMarket.outcomes.find((o: any) => o.name === 'Draw');
            
            homeOdds = homeOutcome?.price || null;
            awayOdds = awayOutcome?.price || null;
            drawOdds = drawOutcome?.price || null;
          }

          return {
            match_id: match.id,
            sport_key: league.key,
            sport_title: 'Football',
            league_name: league.title,
            home_team: match.home_team,
            away_team: match.away_team,
            commence_time: match.commence_time,
            home_odds: homeOdds,
            away_odds: awayOdds,
            draw_odds: drawOdds,
            status: 'upcoming',
            updated_at: new Date().toISOString()
          };
        });

        if (matches.length > 0) {
          const { error: matchError } = await supabase
            .from('matches')
            .upsert(matches, { onConflict: 'match_id' });

          if (matchError) {
            errors.push(`${league.title}: DB error - ${matchError.message}`);
          } else {
            totalMatches += matches.length;
            console.log(`✓ Saved ${matches.length} matches for ${league.title}`);
          }
        }
        
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`${league.title}: ${msg}`);
        console.error(`Error fetching ${league.title}:`, msg);
      }
    }

    console.log(`Total: ${totalMatches} matches updated`);

    return new Response(JSON.stringify({ 
      success: true,
      matchesUpdated: totalMatches,
      leaguesProcessed: footballLeagues.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Fatal error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      matchesUpdated: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
