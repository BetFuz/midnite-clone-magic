import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchData {
  match_id: string;
  sport_key: string;
  sport_title: string;
  league_name: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  home_odds?: number | null;
  away_odds?: number | null;
  draw_odds?: number | null;
  status: string;
  updated_at: string;
}

const LEAGUES = [
  { key: 'soccer_epl', title: 'Premier League', fdCode: 'PL', apiSportsId: 39 },
  { key: 'soccer_spain_la_liga', title: 'La Liga', fdCode: 'PD', apiSportsId: 140 },
  { key: 'soccer_germany_bundesliga', title: 'Bundesliga', fdCode: 'BL1', apiSportsId: 78 },
  { key: 'soccer_italy_serie_a', title: 'Serie A', fdCode: 'SA', apiSportsId: 135 },
  { key: 'soccer_france_ligue_one', title: 'Ligue 1', fdCode: 'FL1', apiSportsId: 61 },
  { key: 'soccer_uefa_champs_league', title: 'Champions League', fdCode: 'CL', apiSportsId: 2 },
];

async function fetchFromOddsAPI(apiKey: string): Promise<{ matches: MatchData[], source: string }> {
  console.log('🎲 Trying The Odds API...');
  const allMatches: MatchData[] = [];
  
  for (const league of LEAGUES) {
    try {
      const response = await fetch(
        `https://api.the-odds-api.com/v4/sports/${league.key}/odds/?regions=uk,eu&markets=h2h&oddsFormat=decimal&apiKey=${apiKey}`,
        { 
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(8000)
        }
      );

      if (!response.ok) {
        console.log(`⚠️ Odds API ${league.title}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      const matches = data.map((match: any) => {
        const bookmaker = match.bookmakers?.[0];
        const h2hMarket = bookmaker?.markets?.find((m: any) => m.key === 'h2h');
        
        let homeOdds = null, awayOdds = null, drawOdds = null;
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

      allMatches.push(...matches);
      console.log(`✓ Odds API ${league.title}: ${matches.length} matches`);
    } catch (error) {
      console.error(`❌ Odds API ${league.title}:`, error);
    }
  }

  if (allMatches.length > 0) {
    return { matches: allMatches, source: 'The Odds API' };
  }
  throw new Error('No data from Odds API');
}

async function fetchFromFootballData(apiKey: string): Promise<{ matches: MatchData[], source: string }> {
  console.log('⚽ Trying Football-Data.org...');
  const allMatches: MatchData[] = [];
  
  for (const league of LEAGUES) {
    if (!league.fdCode) continue;
    
    try {
      const response = await fetch(
        `https://api.football-data.org/v4/competitions/${league.fdCode}/matches?status=SCHEDULED`,
        { 
          headers: { 'X-Auth-Token': apiKey },
          signal: AbortSignal.timeout(8000)
        }
      );

      if (!response.ok) {
        console.log(`⚠️ Football-Data ${league.title}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.matches && data.matches.length > 0) {
        const matches = data.matches.map((match: any) => ({
          match_id: `fd_${match.id}`,
          sport_key: league.key,
          sport_title: 'Football',
          league_name: league.title,
          home_team: match.homeTeam.name,
          away_team: match.awayTeam.name,
          commence_time: match.utcDate,
          home_odds: null,
          away_odds: null,
          draw_odds: null,
          status: 'upcoming',
          updated_at: new Date().toISOString()
        }));

        allMatches.push(...matches);
        console.log(`✓ Football-Data ${league.title}: ${matches.length} matches`);
      }
    } catch (error) {
      console.error(`❌ Football-Data ${league.title}:`, error);
    }
  }

  if (allMatches.length > 0) {
    return { matches: allMatches, source: 'Football-Data.org' };
  }
  throw new Error('No data from Football-Data');
}

async function fetchFromAPISports(apiKey: string): Promise<{ matches: MatchData[], source: string }> {
  console.log('🏆 Trying API-Sports...');
  const allMatches: MatchData[] = [];
  
  for (const league of LEAGUES) {
    if (!league.apiSportsId) continue;
    
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      const response = await fetch(
        `https://v3.football.api-sports.io/fixtures?league=${league.apiSportsId}&season=2024&from=${today.toISOString().split('T')[0]}&to=${futureDate.toISOString().split('T')[0]}`,
        { 
          headers: { 
            'x-apisports-key': apiKey,
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(8000)
        }
      );

      if (!response.ok) {
        console.log(`⚠️ API-Sports ${league.title}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.response && data.response.length > 0) {
        const matches = data.response.map((match: any) => ({
          match_id: `as_${match.fixture.id}`,
          sport_key: league.key,
          sport_title: 'Football',
          league_name: league.title,
          home_team: match.teams.home.name,
          away_team: match.teams.away.name,
          commence_time: match.fixture.date,
          home_odds: null,
          away_odds: null,
          draw_odds: null,
          status: 'upcoming',
          updated_at: new Date().toISOString()
        }));

        allMatches.push(...matches);
        console.log(`✓ API-Sports ${league.title}: ${matches.length} matches`);
      }
    } catch (error) {
      console.error(`❌ API-Sports ${league.title}:`, error);
    }
  }

  if (allMatches.length > 0) {
    return { matches: allMatches, source: 'API-Sports' };
  }
  throw new Error('No data from API-Sports');
}

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

    let matches: MatchData[] = [];
    let dataSource = 'None';
    const attemptedApis: string[] = [];
    const errors: string[] = [];

    // Try APIs in priority order
    if (oddsApiKey) {
      attemptedApis.push('The Odds API');
      try {
        const result = await fetchFromOddsAPI(oddsApiKey);
        matches = result.matches;
        dataSource = result.source;
        console.log(`✅ ${dataSource} returned ${matches.length} matches`);
      } catch (error) {
        errors.push(`The Odds API: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (matches.length === 0 && footballDataKey) {
      attemptedApis.push('Football-Data.org');
      try {
        const result = await fetchFromFootballData(footballDataKey);
        matches = result.matches;
        dataSource = result.source;
        console.log(`✅ ${dataSource} returned ${matches.length} matches`);
      } catch (error) {
        errors.push(`Football-Data.org: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (matches.length === 0 && apiSportsKey) {
      attemptedApis.push('API-Sports');
      try {
        const result = await fetchFromAPISports(apiSportsKey);
        matches = result.matches;
        dataSource = result.source;
        console.log(`✅ ${dataSource} returned ${matches.length} matches`);
      } catch (error) {
        errors.push(`API-Sports: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (matches.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'All APIs failed or returned no data',
        attemptedApis,
        errors,
        matchesUpdated: 0
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    for (const league of LEAGUES) {
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
    }

    const { error: matchError } = await supabase
      .from('matches')
      .upsert(matches, { onConflict: 'match_id' });

    if (matchError) {
      throw new Error(`Database error: ${matchError.message}`);
    }

    console.log(`✅ Saved ${matches.length} matches from ${dataSource}`);

    return new Response(JSON.stringify({ 
      success: true,
      matchesUpdated: matches.length,
      leaguesProcessed: LEAGUES.length,
      dataSource,
      attemptedApis,
      hasOdds: dataSource === 'The Odds API',
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
