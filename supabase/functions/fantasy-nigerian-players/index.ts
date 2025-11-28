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

    // Check if Nigerian players already exist
    const { data: existing } = await supabaseClient
      .from('fantasy_players')
      .select('id')
      .eq('sport', 'Nigerian Fantasy')
      .limit(1);

    if (existing && existing.length > 0) {
      const { data: allPlayers } = await supabaseClient
        .from('fantasy_players')
        .select('*')
        .eq('sport', 'Nigerian Fantasy');
      
      return new Response(
        JSON.stringify({ players: allPlayers, already_seeded: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Nigerian and African players with pricing in Naira (millions)
    const players = [
      // Nigerian Stars (Premium Tier - ₦15M-22M)
      { full_name: 'Victor Osimhen', team: 'Napoli', position: 'FWD', salary: 22000000, club_id: 'napoli' },
      { full_name: 'Ademola Lookman', team: 'Atalanta', position: 'FWD', salary: 18000000, club_id: 'atalanta' },
      { full_name: 'Victor Boniface', team: 'Bayer Leverkusen', position: 'FWD', salary: 17000000, club_id: 'leverkusen' },
      { full_name: 'Samuel Chukwueze', team: 'AC Milan', position: 'MID', salary: 16000000, club_id: 'milan' },
      { full_name: 'Alex Iwobi', team: 'Fulham', position: 'MID', salary: 15000000, club_id: 'fulham' },
      
      // Solid Starters (Mid Tier - ₦8M-14M)
      { full_name: 'Calvin Bassey', team: 'Fulham', position: 'DEF', salary: 13000000, club_id: 'fulham' },
      { full_name: 'Ola Aina', team: 'Nottingham Forest', position: 'DEF', salary: 12000000, club_id: 'forest' },
      { full_name: 'Wilfred Ndidi', team: 'Leicester City', position: 'MID', salary: 14000000, club_id: 'leicester' },
      { full_name: 'Joe Aribo', team: 'Southampton', position: 'MID', salary: 11000000, club_id: 'southampton' },
      { full_name: 'Kelechi Iheanacho', team: 'Sevilla', position: 'FWD', salary: 10000000, club_id: 'sevilla' },
      { full_name: 'Taiwo Awoniyi', team: 'Nottingham Forest', position: 'FWD', salary: 12000000, club_id: 'forest' },
      { full_name: 'Semi Ajayi', team: 'West Brom', position: 'DEF', salary: 9000000, club_id: 'westbrom' },
      { full_name: 'Frank Onyeka', team: 'Brentford', position: 'MID', salary: 11000000, club_id: 'brentford' },
      
      // Budget Options (Value Tier - ₦4M-7M)
      { full_name: 'Maduka Okoye', team: 'Udinese', position: 'GK', salary: 7000000, club_id: 'udinese' },
      { full_name: 'Francis Uzoho', team: 'Omonia', position: 'GK', salary: 6000000, club_id: 'omonia' },
      { full_name: 'Zaidu Sanusi', team: 'Porto', position: 'DEF', salary: 8000000, club_id: 'porto' },
      { full_name: 'Bright Osayi-Samuel', team: 'Fenerbahce', position: 'DEF', salary: 9000000, club_id: 'fenerbahce' },
      { full_name: 'William Troost-Ekong', team: 'Al-Kholood', position: 'DEF', salary: 10000000, club_id: 'alkholood' },
      { full_name: 'Kenneth Omeruo', team: 'Kasimpasa', position: 'DEF', salary: 7000000, club_id: 'kasimpasa' },
      { full_name: 'Raphael Onyedika', team: 'Club Brugge', position: 'MID', salary: 9000000, club_id: 'brugge' },
      { full_name: 'Fisayo Dele-Bashiru', team: 'Lazio', position: 'MID', salary: 8000000, club_id: 'lazio' },
      { full_name: 'Alhassan Yusuf', team: 'Antwerp', position: 'MID', salary: 7000000, club_id: 'antwerp' },
      { full_name: 'Terem Moffi', team: 'Nice', position: 'FWD', salary: 11000000, club_id: 'nice' },
      { full_name: 'Moses Simon', team: 'Nantes', position: 'FWD', salary: 10000000, club_id: 'nantes' },
      { full_name: 'Paul Onuachu', team: 'Trabzonspor', position: 'FWD', salary: 9000000, club_id: 'trabzonspor' },
      
      // NPFL Stars (Domestic Heroes - ₦3M-6M)
      { full_name: 'Chijioke Mbaoma', team: 'Enyimba', position: 'FWD', salary: 6000000, club_id: 'enyimba' },
      { full_name: 'Junior Lokosa', team: 'Kano Pillars', position: 'FWD', salary: 5500000, club_id: 'pillars' },
      { full_name: 'Stanley Dimgba', team: 'Rangers International', position: 'FWD', salary: 5000000, club_id: 'rangers' },
      { full_name: 'Sadiq Umar', team: 'Real Sociedad', position: 'FWD', salary: 11000000, club_id: 'sociedad' },
      { full_name: 'Ibrahim Mustapha', team: 'Rivers United', position: 'MID', salary: 4500000, club_id: 'rivers' },
      { full_name: 'Ifeanyi Anaemena', team: 'Enyimba', position: 'DEF', salary: 4000000, club_id: 'enyimba' },
      { full_name: 'John Noble', team: 'Enyimba', position: 'GK', salary: 4500000, club_id: 'enyimba' },
      { full_name: 'Dele Alampasu', team: 'Abia Warriors', position: 'GK', salary: 3500000, club_id: 'warriors' },
      
      // Rotation & Bench (Budget - ₦2M-3M)
      { full_name: 'Ishaq Rafiu', team: 'Akwa United', position: 'FWD', salary: 3000000, club_id: 'akwa' },
      { full_name: 'Philip Azango', team: 'Lobi Stars', position: 'FWD', salary: 2500000, club_id: 'lobi' },
      { full_name: 'Sikiru Alimi', team: 'Remo Stars', position: 'MID', salary: 3000000, club_id: 'remo' },
      { full_name: 'Barnabas Imenger', team: 'Plateau United', position: 'DEF', salary: 2800000, club_id: 'plateau' },
      { full_name: 'Amas Obasogie', team: 'Bendel Insurance', position: 'DEF', salary: 2500000, club_id: 'bendel' },
      { full_name: 'Detan Ogundare', team: 'Shooting Stars', position: 'GK', salary: 2500000, club_id: 'shooting' },
    ];

    const playersToInsert = players.map(p => ({
      external_player_id: `${p.full_name.replace(/\s+/g, '_').toLowerCase()}_ng_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      full_name: p.full_name,
      team: p.team,
      position: p.position,
      salary: p.salary,
      projected_points: calculateInitialProjection(p.position, p.salary),
      average_points: calculateInitialProjection(p.position, p.salary) - Math.floor(Math.random() * 3),
      sport: 'Nigerian Fantasy',
      injury_status: 'healthy',
      club_id: p.club_id,
      form_rating: 5 + Math.random() * 3, // 5-8 rating
      price_change: 0,
      metadata: { nationality: 'Nigerian', tier: getTier(p.salary) }
    }));

    const { data: inserted, error } = await supabaseClient
      .from('fantasy_players')
      .insert(playersToInsert)
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        players: inserted, 
        count: inserted.length,
        message: 'Nigerian Fantasy players seeded successfully!' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding Nigerian players:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function calculateInitialProjection(position: string, salary: number): number {
  // Higher salary = higher projection
  const basePts = salary / 1000000; // ₦10M = 10 points base
  
  if (position === 'FWD') return Math.floor(basePts * 1.5);
  if (position === 'MID') return Math.floor(basePts * 1.3);
  if (position === 'DEF') return Math.floor(basePts * 1.1);
  if (position === 'GK') return Math.floor(basePts * 1.0);
  
  return Math.floor(basePts);
}

function getTier(salary: number): string {
  if (salary >= 15000000) return 'premium';
  if (salary >= 8000000) return 'mid';
  if (salary >= 4000000) return 'value';
  return 'budget';
}
