import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sample leagues data organized by confederation
const leagues = [
  // UEFA - Europe
  { sport_key: 'soccer_epl', sport_title: 'Premier League', confederation: 'UEFA', region: 'England', leagues: [{ name: 'Premier League', country: 'England' }] },
  { sport_key: 'soccer_spain_la_liga', sport_title: 'La Liga', confederation: 'UEFA', region: 'Spain', leagues: [{ name: 'La Liga', country: 'Spain' }] },
  { sport_key: 'soccer_germany_bundesliga', sport_title: 'Bundesliga', confederation: 'UEFA', region: 'Germany', leagues: [{ name: 'Bundesliga', country: 'Germany' }] },
  { sport_key: 'soccer_italy_serie_a', sport_title: 'Serie A', confederation: 'UEFA', region: 'Italy', leagues: [{ name: 'Serie A', country: 'Italy' }] },
  { sport_key: 'soccer_france_ligue_one', sport_title: 'Ligue 1', confederation: 'UEFA', region: 'France', leagues: [{ name: 'Ligue 1', country: 'France' }] },
  { sport_key: 'soccer_uefa_champs_league', sport_title: 'UEFA Champions League', confederation: 'UEFA', region: 'Europe', leagues: [{ name: 'Champions League', country: 'Europe' }] },
  
  // CAF - Africa
  { sport_key: 'soccer_africa_cup_of_nations', sport_title: 'AFCON', confederation: 'CAF', region: 'Africa', leagues: [{ name: 'Africa Cup of Nations', country: 'Africa' }] },
  
  // CONMEBOL - South America
  { sport_key: 'soccer_brazil_campeonato', sport_title: 'Brasileirão', confederation: 'CONMEBOL', region: 'Brazil', leagues: [{ name: 'Brasileirão', country: 'Brazil' }] },
  { sport_key: 'soccer_argentina_primera_division', sport_title: 'Argentine Primera', confederation: 'CONMEBOL', region: 'Argentina', leagues: [{ name: 'Primera División', country: 'Argentina' }] },
  
  // Basketball
  { sport_key: 'basketball_nba', sport_title: 'NBA', confederation: null, region: 'USA', leagues: [{ name: 'NBA', country: 'USA' }] },
  { sport_key: 'basketball_euroleague', sport_title: 'EuroLeague', confederation: null, region: 'Europe', leagues: [{ name: 'EuroLeague', country: 'Europe' }] },
  
  // Tennis
  { sport_key: 'tennis_atp', sport_title: 'ATP Masters 1000', confederation: null, region: 'International', leagues: [{ name: 'ATP Masters 1000', country: 'International' }] },
  { sport_key: 'tennis_wimbledon', sport_title: 'Wimbledon', confederation: null, region: 'England', leagues: [{ name: 'Wimbledon', country: 'England' }] },
];

// Generate sample matches for the next 14 days
function generateSampleMatches() {
  interface Match {
    match_id: string;
    sport_key: string;
    sport_title: string;
    league_name: string;
    home_team: string;
    away_team: string;
    commence_time: string;
    home_odds: number;
    draw_odds: number;
    away_odds: number;
    status: string;
  }

  const matches: Match[] = [];
  const now = new Date();
  
  // Football teams by league
  const teams: Record<string, string[][]> = {
    'Premier League': [
      ['Manchester City', 'Liverpool'], ['Arsenal', 'Chelsea'], ['Manchester United', 'Tottenham'],
      ['Newcastle', 'Brighton'], ['Aston Villa', 'West Ham'], ['Brentford', 'Fulham']
    ],
    'La Liga': [
      ['Real Madrid', 'Barcelona'], ['Atletico Madrid', 'Sevilla'], ['Real Sociedad', 'Athletic Bilbao'],
      ['Valencia', 'Villarreal'], ['Real Betis', 'Girona'], ['Osasuna', 'Rayo Vallecano']
    ],
    'Bundesliga': [
      ['Bayern Munich', 'Borussia Dortmund'], ['RB Leipzig', 'Bayer Leverkusen'], ['Union Berlin', 'Freiburg'],
      ['Eintracht Frankfurt', 'Wolfsburg'], ['Hoffenheim', 'Borussia M\'gladbach'], ['Stuttgart', 'Mainz']
    ],
    'Serie A': [
      ['Inter Milan', 'AC Milan'], ['Juventus', 'Napoli'], ['Roma', 'Lazio'],
      ['Atalanta', 'Fiorentina'], ['Bologna', 'Torino'], ['Sassuolo', 'Udinese']
    ],
    'Ligue 1': [
      ['PSG', 'Marseille'], ['Monaco', 'Lyon'], ['Lille', 'Nice'],
      ['Rennes', 'Lens'], ['Toulouse', 'Montpellier'], ['Strasbourg', 'Nantes']
    ],
    'NBA': [
      ['Lakers', 'Warriors'], ['Celtics', 'Heat'], ['Bucks', '76ers'],
      ['Nuggets', 'Suns'], ['Mavericks', 'Clippers'], ['Nets', 'Knicks']
    ],
    'EuroLeague': [
      ['Real Madrid', 'Barcelona'], ['Olympiacos', 'Panathinaikos'], ['Bayern Munich', 'Fenerbahce'],
      ['Maccabi Tel Aviv', 'Zalgiris Kaunas'], ['CSKA Moscow', 'Anadolu Efes']
    ],
    'ATP Masters 1000': [
      ['Djokovic', 'Alcaraz'], ['Sinner', 'Medvedev'], ['Rune', 'Tsitsipas'],
      ['Zverev', 'Rublev'], ['Fritz', 'Ruud'], ['Hurkacz', 'Dimitrov']
    ],
    'Wimbledon': [
      ['Djokovic', 'Sinner'], ['Alcaraz', 'Medvedev'], ['Swiatek', 'Sabalenka'],
      ['Rybakina', 'Gauff'], ['Pegula', 'Rybakina']
    ]
  };

  leagues.forEach(league => {
    const leagueName = league.leagues[0].name;
    const leagueTeams = teams[leagueName] || [];
    
    // Generate 6-8 matches per league over 14 days
    leagueTeams.forEach((teamPair: string[], idx: number) => {
      const daysOffset = Math.floor(idx * 2.5); // Spread matches across 14 days
      const matchDate = new Date(now);
      matchDate.setDate(matchDate.getDate() + daysOffset);
      matchDate.setHours(15 + (idx % 6), 0, 0, 0); // Stagger times
      
      const homeOdds = 1.5 + Math.random() * 2;
      const drawOdds = league.sport_key.includes('basketball') || league.sport_key.includes('tennis') 
        ? 15 + Math.random() * 15 
        : 3.0 + Math.random() * 1.5;
      const awayOdds = 1.5 + Math.random() * 2;
      
      matches.push({
        match_id: `${league.sport_key}_${teamPair[0]}_${teamPair[1]}_${matchDate.getTime()}`,
        sport_key: league.sport_key,
        sport_title: league.sport_title,
        league_name: leagueName,
        home_team: teamPair[0],
        away_team: teamPair[1],
        commence_time: matchDate.toISOString(),
        home_odds: Number(homeOdds.toFixed(2)),
        draw_odds: Number(drawOdds.toFixed(2)),
        away_odds: Number(awayOdds.toFixed(2)),
        status: 'upcoming'
      });
    });
  });
  
  return matches;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting database seeding...');

    // Step 1: Insert leagues
    console.log('Inserting leagues...');
    const { error: leaguesError } = await supabase
      .from('sports_leagues')
      .upsert(leagues, { 
        onConflict: 'sport_key',
        ignoreDuplicates: false 
      });

    if (leaguesError) {
      console.error('Error inserting leagues:', leaguesError);
      throw leaguesError;
    }

    console.log(`Successfully inserted ${leagues.length} leagues`);

    // Step 2: Generate and insert matches
    const matches = generateSampleMatches();
    console.log(`Generated ${matches.length} sample matches`);

    // Delete old matches first
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('Error deleting old matches:', deleteError);
    }

    // Insert new matches in batches
    const batchSize = 50;
    for (let i = 0; i < matches.length; i += batchSize) {
      const batch = matches.slice(i, i + batchSize);
      const { error: matchesError } = await supabase
        .from('matches')
        .insert(batch);

      if (matchesError) {
        console.error('Error inserting matches batch:', matchesError);
        throw matchesError;
      }
    }

    console.log(`Successfully inserted ${matches.length} matches`);

    return new Response(
      JSON.stringify({
        success: true,
        leagues_inserted: leagues.length,
        matches_inserted: matches.length,
        message: 'Database seeded successfully with sample data'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding database:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
