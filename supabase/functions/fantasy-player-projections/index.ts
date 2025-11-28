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

    // Otherwise generate realistic players for this sport
    const generatedPlayers = generateRealisticPlayers(sport);

    const playersToInsert = generatedPlayers.map((p: any) => ({
      external_player_id: `${p.full_name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      full_name: p.full_name,
      team: p.team,
      position: p.position,
      salary: p.salary,
      projected_points: p.projected_points,
      average_points: p.average_points || p.projected_points,
      sport: sport,
      injury_status: p.injury_status || 'healthy',
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

function generateRealisticPlayers(sport: string) {
  const normalizedSport = sport.toLowerCase();
  
  if (normalizedSport.includes('football') || normalizedSport.includes('soccer') || 
      normalizedSport.includes('premier') || normalizedSport.includes('la liga') ||
      normalizedSport.includes('serie a') || normalizedSport.includes('bundesliga') ||
      normalizedSport.includes('ligue 1')) {
    return generateSoccerPlayers();
  } else if (normalizedSport.includes('nfl') || normalizedSport.includes('american football')) {
    return generateNFLPlayers();
  } else if (normalizedSport.includes('nba') || normalizedSport.includes('basketball')) {
    return generateNBAPlayers();
  } else if (normalizedSport.includes('nhl') || normalizedSport.includes('hockey')) {
    return generateNHLPlayers();
  } else if (normalizedSport.includes('cricket')) {
    return generateCricketPlayers();
  } else if (normalizedSport.includes('tennis')) {
    return generateTennisPlayers();
  } else if (normalizedSport.includes('baseball') || normalizedSport.includes('mlb')) {
    return generateBaseballPlayers();
  } else {
    // Default to soccer
    return generateSoccerPlayers();
  }
}

function generateSoccerPlayers() {
  const players = [
    // Goalkeepers
    { full_name: 'Alisson Becker', team: 'Liverpool', position: 'GK', salary: 6500, projected_points: 14 },
    { full_name: 'Ederson Moraes', team: 'Manchester City', position: 'GK', salary: 6300, projected_points: 13 },
    { full_name: 'Marc-André ter Stegen', team: 'Barcelona', position: 'GK', salary: 6000, projected_points: 12 },
    { full_name: 'Thibaut Courtois', team: 'Real Madrid', position: 'GK', salary: 6200, projected_points: 13 },
    
    // Defenders
    { full_name: 'Virgil van Dijk', team: 'Liverpool', position: 'DEF', salary: 7500, projected_points: 16 },
    { full_name: 'Rúben Dias', team: 'Manchester City', position: 'DEF', salary: 7200, projected_points: 15 },
    { full_name: 'Antonio Rüdiger', team: 'Real Madrid', position: 'DEF', salary: 6800, projected_points: 14 },
    { full_name: 'William Saliba', team: 'Arsenal', position: 'DEF', salary: 6500, projected_points: 13 },
    { full_name: 'Theo Hernández', team: 'AC Milan', position: 'DEF', salary: 7000, projected_points: 15 },
    { full_name: 'Alphonso Davies', team: 'Bayern Munich', position: 'DEF', salary: 6700, projected_points: 14 },
    { full_name: 'João Cancelo', team: 'Barcelona', position: 'DEF', salary: 6600, projected_points: 13 },
    { full_name: 'Trent Alexander-Arnold', team: 'Liverpool', position: 'DEF', salary: 7300, projected_points: 16 },
    
    // Midfielders
    { full_name: 'Kevin De Bruyne', team: 'Manchester City', position: 'MID', salary: 11000, projected_points: 24 },
    { full_name: 'Bruno Fernandes', team: 'Manchester United', position: 'MID', salary: 9500, projected_points: 21 },
    { full_name: 'Jude Bellingham', team: 'Real Madrid', position: 'MID', salary: 10500, projected_points: 23 },
    { full_name: 'Bernardo Silva', team: 'Manchester City', position: 'MID', salary: 9000, projected_points: 20 },
    { full_name: 'Bukayo Saka', team: 'Arsenal', position: 'MID', salary: 9800, projected_points: 22 },
    { full_name: 'Martin Ødegaard', team: 'Arsenal', position: 'MID', salary: 9200, projected_points: 20 },
    { full_name: 'Rodri Hernández', team: 'Manchester City', position: 'MID', salary: 8500, projected_points: 18 },
    { full_name: 'Federico Valverde', team: 'Real Madrid', position: 'MID', salary: 8800, projected_points: 19 },
    { full_name: 'Phil Foden', team: 'Manchester City', position: 'MID', salary: 9400, projected_points: 21 },
    { full_name: 'Jamal Musiala', team: 'Bayern Munich', position: 'MID', salary: 9100, projected_points: 20 },
    
    // Forwards
    { full_name: 'Erling Haaland', team: 'Manchester City', position: 'FWD', salary: 12500, projected_points: 28 },
    { full_name: 'Kylian Mbappé', team: 'Real Madrid', position: 'FWD', salary: 12000, projected_points: 27 },
    { full_name: 'Mohamed Salah', team: 'Liverpool', position: 'FWD', salary: 11500, projected_points: 26 },
    { full_name: 'Harry Kane', team: 'Bayern Munich', position: 'FWD', salary: 11000, projected_points: 25 },
    { full_name: 'Vinícius Júnior', team: 'Real Madrid', position: 'FWD', salary: 10500, projected_points: 24 },
    { full_name: 'Victor Osimhen', team: 'Napoli', position: 'FWD', salary: 10000, projected_points: 23 },
    { full_name: 'Robert Lewandowski', team: 'Barcelona', position: 'FWD', salary: 10800, projected_points: 24 },
    { full_name: 'Son Heung-min', team: 'Tottenham', position: 'FWD', salary: 10200, projected_points: 23 },
    { full_name: 'Rafael Leão', team: 'AC Milan', position: 'FWD', salary: 9500, projected_points: 21 },
    { full_name: 'Gabriel Jesus', team: 'Arsenal', position: 'FWD', salary: 9000, projected_points: 20 },
  ];

  return players.map(p => ({
    ...p,
    average_points: p.projected_points - Math.floor(Math.random() * 3),
    injury_status: Math.random() > 0.9 ? 'questionable' : 'healthy'
  }));
}

function generateNFLPlayers() {
  const players = [
    // Quarterbacks
    { full_name: 'Patrick Mahomes', team: 'Kansas City Chiefs', position: 'QB', salary: 9500, projected_points: 28 },
    { full_name: 'Josh Allen', team: 'Buffalo Bills', position: 'QB', salary: 9200, projected_points: 27 },
    { full_name: 'Jalen Hurts', team: 'Philadelphia Eagles', position: 'QB', salary: 9000, projected_points: 26 },
    { full_name: 'Joe Burrow', team: 'Cincinnati Bengals', position: 'QB', salary: 8800, projected_points: 25 },
    
    // Running Backs
    { full_name: 'Christian McCaffrey', team: 'San Francisco 49ers', position: 'RB', salary: 9800, projected_points: 24 },
    { full_name: 'Austin Ekeler', team: 'LA Chargers', position: 'RB', salary: 8500, projected_points: 21 },
    { full_name: 'Saquon Barkley', team: 'New York Giants', position: 'RB', salary: 8200, projected_points: 20 },
    { full_name: 'Josh Jacobs', team: 'Las Vegas Raiders', position: 'RB', salary: 7800, projected_points: 19 },
    { full_name: 'Derrick Henry', team: 'Tennessee Titans', position: 'RB', salary: 7500, projected_points: 18 },
    
    // Wide Receivers
    { full_name: 'Tyreek Hill', team: 'Miami Dolphins', position: 'WR', salary: 9000, projected_points: 22 },
    { full_name: 'Justin Jefferson', team: 'Minnesota Vikings', position: 'WR', salary: 8800, projected_points: 21 },
    { full_name: 'Ja\'Marr Chase', team: 'Cincinnati Bengals', position: 'WR', salary: 8500, projected_points: 20 },
    { full_name: 'Stefon Diggs', team: 'Buffalo Bills', position: 'WR', salary: 8200, projected_points: 19 },
    { full_name: 'Cooper Kupp', team: 'LA Rams', position: 'WR', salary: 8000, projected_points: 18 },
    { full_name: 'Davante Adams', team: 'Las Vegas Raiders', position: 'WR', salary: 7800, projected_points: 17 },
    
    // Tight Ends
    { full_name: 'Travis Kelce', team: 'Kansas City Chiefs', position: 'TE', salary: 7500, projected_points: 16 },
    { full_name: 'Mark Andrews', team: 'Baltimore Ravens', position: 'TE', salary: 6800, projected_points: 14 },
    { full_name: 'George Kittle', team: 'San Francisco 49ers', position: 'TE', salary: 6500, projected_points: 13 },
    
    // Kickers
    { full_name: 'Justin Tucker', team: 'Baltimore Ravens', position: 'K', salary: 5000, projected_points: 10 },
    { full_name: 'Harrison Butker', team: 'Kansas City Chiefs', position: 'K', salary: 4800, projected_points: 9 },
    
    // Defense
    { full_name: 'San Francisco 49ers', team: 'San Francisco', position: 'DEF', salary: 4500, projected_points: 12 },
    { full_name: 'Dallas Cowboys', team: 'Dallas', position: 'DEF', salary: 4300, projected_points: 11 },
  ];

  return players.map(p => ({
    ...p,
    average_points: p.projected_points - Math.floor(Math.random() * 3),
    injury_status: Math.random() > 0.9 ? 'questionable' : 'healthy'
  }));
}

function generateNBAPlayers() {
  const players = [
    // Point Guards
    { full_name: 'Luka Dončić', team: 'Dallas Mavericks', position: 'PG', salary: 11500, projected_points: 58 },
    { full_name: 'Stephen Curry', team: 'Golden State Warriors', position: 'PG', salary: 10800, projected_points: 54 },
    { full_name: 'Trae Young', team: 'Atlanta Hawks', position: 'PG', salary: 10000, projected_points: 50 },
    { full_name: 'Damian Lillard', team: 'Milwaukee Bucks', position: 'PG', salary: 9800, projected_points: 48 },
    
    // Shooting Guards
    { full_name: 'Devin Booker', team: 'Phoenix Suns', position: 'SG', salary: 10500, projected_points: 52 },
    { full_name: 'Donovan Mitchell', team: 'Cleveland Cavaliers', position: 'SG', salary: 9500, projected_points: 47 },
    { full_name: 'Anthony Edwards', team: 'Minnesota Timberwolves', position: 'SG', salary: 9200, projected_points: 45 },
    
    // Small Forwards
    { full_name: 'LeBron James', team: 'LA Lakers', position: 'SF', salary: 11000, projected_points: 55 },
    { full_name: 'Kevin Durant', team: 'Phoenix Suns', position: 'SF', salary: 10800, projected_points: 54 },
    { full_name: 'Jayson Tatum', team: 'Boston Celtics', position: 'SF', salary: 10500, projected_points: 52 },
    { full_name: 'Kawhi Leonard', team: 'LA Clippers', position: 'SF', salary: 10200, projected_points: 50 },
    
    // Power Forwards
    { full_name: 'Giannis Antetokounmpo', team: 'Milwaukee Bucks', position: 'PF', salary: 12000, projected_points: 60 },
    { full_name: 'Zion Williamson', team: 'New Orleans Pelicans', position: 'PF', salary: 9800, projected_points: 48 },
    { full_name: 'Paolo Banchero', team: 'Orlando Magic', position: 'PF', salary: 8500, projected_points: 42 },
    
    // Centers
    { full_name: 'Nikola Jokić', team: 'Denver Nuggets', position: 'C', salary: 12500, projected_points: 62 },
    { full_name: 'Joel Embiid', team: 'Philadelphia 76ers', position: 'C', salary: 11800, projected_points: 58 },
    { full_name: 'Anthony Davis', team: 'LA Lakers', position: 'C', salary: 10500, projected_points: 52 },
    { full_name: 'Bam Adebayo', team: 'Miami Heat', position: 'C', salary: 9000, projected_points: 44 },
  ];

  return players.map(p => ({
    ...p,
    average_points: p.projected_points - Math.floor(Math.random() * 5),
    injury_status: Math.random() > 0.9 ? 'questionable' : 'healthy'
  }));
}

function generateNHLPlayers() {
  const players = [
    // Centers
    { full_name: 'Connor McDavid', team: 'Edmonton Oilers', position: 'C', salary: 10500, projected_points: 28 },
    { full_name: 'Nathan MacKinnon', team: 'Colorado Avalanche', position: 'C', salary: 10000, projected_points: 26 },
    { full_name: 'Auston Matthews', team: 'Toronto Maple Leafs', position: 'C', salary: 9800, projected_points: 25 },
    
    // Wingers
    { full_name: 'David Pastrňák', team: 'Boston Bruins', position: 'RW', salary: 9500, projected_points: 24 },
    { full_name: 'Artemi Panarin', team: 'New York Rangers', position: 'LW', salary: 9200, projected_points: 23 },
    { full_name: 'Mikko Rantanen', team: 'Colorado Avalanche', position: 'RW', salary: 9000, projected_points: 22 },
    
    // Defensemen
    { full_name: 'Cale Makar', team: 'Colorado Avalanche', position: 'D', salary: 8500, projected_points: 20 },
    { full_name: 'Erik Karlsson', team: 'Pittsburgh Penguins', position: 'D', salary: 8000, projected_points: 18 },
    
    // Goalies
    { full_name: 'Igor Shesterkin', team: 'New York Rangers', position: 'G', salary: 7500, projected_points: 16 },
    { full_name: 'Connor Hellebuyck', team: 'Winnipeg Jets', position: 'G', salary: 7200, projected_points: 15 },
  ];

  return players.map(p => ({
    ...p,
    average_points: p.projected_points - Math.floor(Math.random() * 3),
    injury_status: Math.random() > 0.9 ? 'questionable' : 'healthy'
  }));
}

function generateCricketPlayers() {
  const players = [
    // Batsmen
    { full_name: 'Virat Kohli', team: 'India', position: 'BAT', salary: 11000, projected_points: 85 },
    { full_name: 'Babar Azam', team: 'Pakistan', position: 'BAT', salary: 10500, projected_points: 82 },
    { full_name: 'Steve Smith', team: 'Australia', position: 'BAT', salary: 10000, projected_points: 78 },
    
    // Bowlers
    { full_name: 'Jasprit Bumrah', team: 'India', position: 'BOWL', salary: 9500, projected_points: 75 },
    { full_name: 'Pat Cummins', team: 'Australia', position: 'BOWL', salary: 9000, projected_points: 72 },
    
    // All-Rounders
    { full_name: 'Ben Stokes', team: 'England', position: 'ALL', salary: 10500, projected_points: 80 },
    { full_name: 'Ravindra Jadeja', team: 'India', position: 'ALL', salary: 9800, projected_points: 76 },
  ];

  return players.map(p => ({
    ...p,
    average_points: p.projected_points - Math.floor(Math.random() * 8),
    injury_status: Math.random() > 0.9 ? 'questionable' : 'healthy'
  }));
}

function generateTennisPlayers() {
  const players = [
    { full_name: 'Carlos Alcaraz', team: 'Spain', position: 'SINGLES', salary: 11000, projected_points: 92 },
    { full_name: 'Novak Djokovic', team: 'Serbia', position: 'SINGLES', salary: 10800, projected_points: 90 },
    { full_name: 'Iga Świątek', team: 'Poland', position: 'SINGLES', salary: 10500, projected_points: 88 },
    { full_name: 'Aryna Sabalenka', team: 'Belarus', position: 'SINGLES', salary: 10000, projected_points: 85 },
  ];

  return players.map(p => ({
    ...p,
    average_points: p.projected_points - Math.floor(Math.random() * 10),
    injury_status: Math.random() > 0.9 ? 'questionable' : 'healthy'
  }));
}

function generateBaseballPlayers() {
  const players = [
    // Pitchers
    { full_name: 'Gerrit Cole', team: 'New York Yankees', position: 'P', salary: 10500, projected_points: 32 },
    { full_name: 'Spencer Strider', team: 'Atlanta Braves', position: 'P', salary: 10000, projected_points: 30 },
    
    // Catchers
    { full_name: 'J.T. Realmuto', team: 'Philadelphia Phillies', position: 'C', salary: 7500, projected_points: 18 },
    
    // Infielders
    { full_name: 'Ronald Acuña Jr.', team: 'Atlanta Braves', position: 'OF', salary: 9500, projected_points: 26 },
    { full_name: 'Mookie Betts', team: 'LA Dodgers', position: 'OF', salary: 9000, projected_points: 24 },
    
    // Outfielders
    { full_name: 'Aaron Judge', team: 'New York Yankees', position: 'OF', salary: 9800, projected_points: 28 },
    { full_name: 'Mike Trout', team: 'LA Angels', position: 'OF', salary: 9200, projected_points: 25 },
  ];

  return players.map(p => ({
    ...p,
    average_points: p.projected_points - Math.floor(Math.random() * 4),
    injury_status: Math.random() > 0.9 ? 'questionable' : 'healthy'
  }));
}
