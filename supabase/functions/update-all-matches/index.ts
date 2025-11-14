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
    const footballDataKey = Deno.env.get('FOOTBALL_DATA_ORG_API_KEY');
    const apiSportsKey = Deno.env.get('API_SPORTS_API_KEY');

    let totalMatches = 0;
    let totalLeagues = 0;
    const errors: string[] = [];

    // Fetch from The Odds API (500 free requests/month)
    if (oddsApiKey) {
      try {
        console.log('Fetching from The Odds API...');
        const sports = ['soccer_epl', 'soccer_spain_la_liga', 'soccer_germany_bundesliga', 
                       'soccer_italy_serie_a', 'soccer_france_ligue_one', 'soccer_uefa_champs_league',
                       'basketball_nba', 'basketball_euroleague', 'tennis_atp_wimbledon', 
                       'tennis_atp_us_open', 'americanfootball_nfl', 'icehockey_nhl'];
        
        for (const sport of sports) {
          const response = await fetch(
            `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=uk&markets=h2h&oddsFormat=decimal&apiKey=${oddsApiKey}`,
            { headers: { 'Accept': 'application/json' } }
          );

          if (response.ok) {
            const data = await response.json();
            console.log(`Fetched ${data.length} matches for ${sport}`);
            
            // Map sport keys to our format
            const sportMapping: Record<string, { key: string; title: string }> = {
              'soccer_epl': { key: 'soccer_epl', title: 'Premier League' },
              'soccer_spain_la_liga': { key: 'soccer_spain_la_liga', title: 'La Liga' },
              'soccer_germany_bundesliga': { key: 'soccer_germany_bundesliga', title: 'Bundesliga' },
              'soccer_italy_serie_a': { key: 'soccer_italy_serie_a', title: 'Serie A' },
              'soccer_france_ligue_one': { key: 'soccer_france_ligue_one', title: 'Ligue 1' },
              'soccer_uefa_champs_league': { key: 'soccer_uefa_champs_league', title: 'UEFA Champions League' },
              'basketball_nba': { key: 'basketball_nba', title: 'NBA' },
              'basketball_euroleague': { key: 'basketball_euroleague', title: 'EuroLeague' },
              'tennis_atp_wimbledon': { key: 'tennis_atp_wimbledon', title: 'Wimbledon' },
              'tennis_atp_us_open': { key: 'tennis_atp_us_open', title: 'US Open' },
              'americanfootball_nfl': { key: 'americanfootball_nfl', title: 'NFL' },
              'icehockey_nhl': { key: 'icehockey_nhl', title: 'NHL' }
            };

            const sportInfo = sportMapping[sport];
            if (!sportInfo) continue;

            // Update sports_leagues
            const { error: leagueError } = await supabase
              .from('sports_leagues')
              .upsert({
                sport_key: sportInfo.key,
                sport_title: sportInfo.title,
                leagues: [{ name: sportInfo.title, country: 'International' }],
                updated_at: new Date().toISOString()
              }, { onConflict: 'sport_key' });

            if (!leagueError) totalLeagues++;

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
                sport_key: sportInfo.key,
                sport_title: sportInfo.title,
                league_name: sportInfo.title,
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

              if (!matchError) {
                totalMatches += matches.length;
              } else {
                errors.push(`Error upserting matches for ${sport}: ${matchError.message}`);
              }
            }
          } else {
            errors.push(`Odds API error for ${sport}: ${response.statusText}`);
          }
        }
      } catch (error) {
        errors.push(`Odds API error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Fetch from Football-Data.org (10 calls/minute free tier)
    if (footballDataKey) {
      try {
        console.log('Fetching from Football-Data.org...');
        const competitions = ['PL', 'PD', 'BL1', 'SA', 'FL1', 'CL']; // Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions League
        
        for (const comp of competitions) {
          const response = await fetch(
            `https://api.football-data.org/v4/competitions/${comp}/matches?status=SCHEDULED`,
            { headers: { 'X-Auth-Token': footballDataKey } }
          );

          if (response.ok) {
            const data = await response.json();
            console.log(`Fetched ${data.matches?.length || 0} matches for ${comp}`);
            
            if (data.matches && data.matches.length > 0) {
              const compMapping: Record<string, { key: string; title: string }> = {
                'PL': { key: 'soccer_epl', title: 'Premier League' },
                'PD': { key: 'soccer_spain_la_liga', title: 'La Liga' },
                'BL1': { key: 'soccer_germany_bundesliga', title: 'Bundesliga' },
                'SA': { key: 'soccer_italy_serie_a', title: 'Serie A' },
                'FL1': { key: 'soccer_france_ligue_one', title: 'Ligue 1' },
                'CL': { key: 'soccer_uefa_champs_league', title: 'UEFA Champions League' }
              };

              const sportInfo = compMapping[comp];
              if (!sportInfo) continue;

              const matches = data.matches.map((match: any) => ({
                match_id: `fd_${match.id}`,
                sport_key: sportInfo.key,
                sport_title: 'Football',
                league_name: sportInfo.title,
                home_team: match.homeTeam.name,
                away_team: match.awayTeam.name,
                commence_time: match.utcDate,
                status: 'upcoming',
                updated_at: new Date().toISOString()
              }));

              const { error: matchError } = await supabase
                .from('matches')
                .upsert(matches, { onConflict: 'match_id' });

              if (!matchError) {
                totalMatches += matches.length;
              }
            }
          }
          
          // Rate limiting: wait 6 seconds between calls (10 calls/minute)
          await new Promise(resolve => setTimeout(resolve, 6000));
        }
      } catch (error) {
        errors.push(`Football-Data.org error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Fetch NBA data from Balldontlie (free, no key required)
    try {
      console.log('Fetching NBA data from Balldontlie...');
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 14);

      const response = await fetch(
        `https://api.balldontlie.io/v1/games?start_date=${today.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}&per_page=100`
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`Fetched ${data.data?.length || 0} NBA games`);
        
        if (data.data && data.data.length > 0) {
          const matches = data.data.map((game: any) => ({
            match_id: `nba_${game.id}`,
            sport_key: 'basketball_nba',
            sport_title: 'Basketball',
            league_name: 'NBA',
            home_team: game.home_team.full_name,
            away_team: game.visitor_team.full_name,
            commence_time: game.date,
            status: game.status,
            updated_at: new Date().toISOString()
          }));

          const { error: matchError } = await supabase
            .from('matches')
            .upsert(matches, { onConflict: 'match_id' });

          if (!matchError) {
            totalMatches += matches.length;
          }
        }
      }
    } catch (error) {
      errors.push(`Balldontlie error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${totalMatches} matches and ${totalLeagues} leagues`,
        totalMatches,
        totalLeagues,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
