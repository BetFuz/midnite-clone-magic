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
    const { playerId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get player details
    const { data: player } = await supabaseClient
      .from('fantasy_players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (!player) {
      return new Response(
        JSON.stringify({ error: 'Player not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Use AI to generate player stats and news
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a fantasy football analyst. Generate realistic player stats, news, and matchup analysis.`
          },
          {
            role: 'user',
            content: `Generate research data for ${player.full_name} (${player.position}, ${player.team}):
            
1. Last 5 game stats (minutes, goals, assists, shots, fantasy points)
2. Recent news headlines (2-3 items with impact level: high/medium/low)
3. Next 2 upcoming matchups with difficulty ratings (1-5)

Return as JSON:
{
  stats: [{game_date, minutes_played, goals, assists, shots, fantasy_points}],
  news: [{headline, content, impact, news_type}],
  matchups: [{opponent_team, match_date, opponent_rank, difficulty_rating, vegas_line}]
}`
          }
        ]
      }),
    });

    const aiData = await aiResponse.json();
    let content = aiData.choices[0].message.content;
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let researchData;
    try {
      researchData = JSON.parse(content);
    } catch (e) {
      // Fallback with mock data
      researchData = {
        stats: generateMockStats(),
        news: generateMockNews(player.full_name),
        matchups: generateMockMatchups()
      };
    }

    // Insert into database
    const statsInserts = researchData.stats?.map((s: any) => ({
      player_id: playerId,
      game_date: s.game_date || new Date().toISOString().split('T')[0],
      minutes_played: s.minutes_played || 90,
      goals: s.goals || 0,
      assists: s.assists || 0,
      shots: s.shots || 0,
      fantasy_points: s.fantasy_points || 0
    })) || [];

    const newsInserts = researchData.news?.map((n: any) => ({
      player_id: playerId,
      headline: n.headline,
      content: n.content || '',
      impact: n.impact || 'medium',
      news_type: n.news_type || 'performance'
    })) || [];

    const matchupInserts = researchData.matchups?.map((m: any) => ({
      player_id: playerId,
      opponent_team: m.opponent_team,
      match_date: m.match_date || new Date().toISOString(),
      opponent_rank: m.opponent_rank || null,
      difficulty_rating: m.difficulty_rating || 3,
      vegas_line: m.vegas_line || null
    })) || [];

    await Promise.all([
      statsInserts.length > 0 ? supabaseClient.from('fantasy_player_stats').insert(statsInserts) : null,
      newsInserts.length > 0 ? supabaseClient.from('fantasy_player_news').insert(newsInserts) : null,
      matchupInserts.length > 0 ? supabaseClient.from('fantasy_matchups').insert(matchupInserts) : null,
    ]);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: researchData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating research:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function generateMockStats() {
  return Array.from({ length: 5 }, (_, i) => ({
    game_date: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minutes_played: 75 + Math.floor(Math.random() * 15),
    goals: Math.floor(Math.random() * 3),
    assists: Math.floor(Math.random() * 2),
    shots: 2 + Math.floor(Math.random() * 6),
    fantasy_points: 5 + Math.random() * 20
  }));
}

function generateMockNews(playerName: string) {
  return [
    {
      headline: `${playerName} training at full capacity`,
      content: `Expected to start in upcoming match`,
      impact: 'medium',
      news_type: 'lineup'
    },
    {
      headline: `Strong recent form for ${playerName}`,
      content: `3 goals in last 2 matches`,
      impact: 'high',
      news_type: 'performance'
    }
  ];
}

function generateMockMatchups() {
  return [
    {
      opponent_team: 'Next Opponent',
      match_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      opponent_rank: 8,
      difficulty_rating: 2.5,
      vegas_line: 1.5
    }
  ];
}
