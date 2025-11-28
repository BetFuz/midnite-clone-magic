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
    const { leagueId, salaryCap = 60000, positionRequirements } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Fetch league details
    const { data: league } = await supabaseClient
      .from('fantasy_leagues')
      .select('*')
      .eq('id', leagueId)
      .single();

    if (!league) {
      return new Response(
        JSON.stringify({ error: 'League not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Fetch available players
    const { data: players } = await supabaseClient
      .from('fantasy_players')
      .select('*')
      .eq('sport', league.sport)
      .eq('injury_status', 'healthy')
      .order('projected_points', { ascending: false });

    if (!players || players.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No players available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Use AI to optimize lineup
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
            content: `You are an expert fantasy sports lineup optimizer. Your goal is to maximize projected points while staying under the salary cap and meeting position requirements.`
          },
          {
            role: 'user',
            content: `Optimize a ${league.sport} lineup for salary cap $${salaryCap}.
            
Available players (top 20):
${players.slice(0, 20).map(p => `- ${p.full_name} (${p.position}): $${p.salary}, ${p.projected_points} pts`).join('\n')}

Position requirements: ${JSON.stringify(positionRequirements || { QB: 1, RB: 2, WR: 3, TE: 1, K: 1, DEF: 1 })}

Return the optimal lineup as JSON: {lineup: [{player_id, full_name, position, salary, projected_points}], total_salary, total_projected_points, reasoning}`
          }
        ]
      }),
    });

    const aiData = await aiResponse.json();
    let content = aiData.choices[0].message.content;

    // Parse AI response
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let optimizedLineup;
    try {
      optimizedLineup = JSON.parse(content);
    } catch (e) {
      // Fallback: simple greedy algorithm
      optimizedLineup = greedyOptimize(players, salaryCap, positionRequirements);
    }

    // Calculate ownership percentages
    const { data: ownership } = await supabaseClient
      .from('fantasy_player_ownership')
      .select('*')
      .eq('league_id', leagueId);

    const ownershipMap = new Map(ownership?.map(o => [o.player_id, o.ownership_percentage]) || []);

    // Enrich lineup with ownership data
    const enrichedLineup = optimizedLineup.lineup?.map((player: any) => ({
      ...player,
      ownership_percentage: ownershipMap.get(player.player_id) || 0
    }));

    return new Response(
      JSON.stringify({ 
        lineup: enrichedLineup,
        total_salary: optimizedLineup.total_salary,
        total_projected_points: optimizedLineup.total_projected_points,
        reasoning: optimizedLineup.reasoning || 'Optimized for maximum projected points within salary cap',
        salary_remaining: salaryCap - optimizedLineup.total_salary
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error optimizing lineup:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function greedyOptimize(players: any[], salaryCap: number, requirements: any) {
  const lineup = [];
  let remainingSalary = salaryCap;
  const posReqs = requirements || { QB: 1, RB: 2, WR: 3, TE: 1, K: 1, DEF: 1 };
  
  // Sort by value (points per dollar)
  const sortedPlayers = players
    .map(p => ({ ...p, value: p.projected_points / p.salary }))
    .sort((a, b) => b.value - a.value);

  for (const [position, count] of Object.entries(posReqs)) {
    let added = 0;
    for (const player of sortedPlayers) {
      if (player.position === position && player.salary <= remainingSalary && added < (count as number)) {
        lineup.push(player);
        remainingSalary -= player.salary;
        added++;
      }
    }
  }

  return {
    lineup,
    total_salary: salaryCap - remainingSalary,
    total_projected_points: lineup.reduce((sum, p) => sum + p.projected_points, 0)
  };
}
