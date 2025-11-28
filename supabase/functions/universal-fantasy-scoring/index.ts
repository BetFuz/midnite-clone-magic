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
    const { lineupId, gameweekNumber, stats } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get lineup with player details
    const { data: lineup, error: lineupError } = await supabaseClient
      .from('fantasy_lineups')
      .select(`
        *,
        fantasy_teams!inner(league_id)
      `)
      .eq('id', lineupId)
      .single();

    if (lineupError) throw lineupError;

    // Get weekly lineup for captain/chip info
    const { data: weeklyLineup } = await supabaseClient
      .from('fantasy_weekly_lineups')
      .select('*')
      .eq('lineup_id', lineupId)
      .eq('gameweek_number', gameweekNumber)
      .single();

    const roster = lineup.roster as any[];
    let totalPoints = 0;

    // Calculate points for each player
    for (const player of roster) {
      const playerStats = stats[player.id] || {};
      
      // Get player details
      const { data: playerData } = await supabaseClient
        .from('fantasy_players')
        .select('position, sport')
        .eq('id', player.id)
        .single();

      if (!playerData) continue;

      // Get scoring rules for this sport
      const { data: scoringRules } = await supabaseClient
        .from('fantasy_scoring_rules')
        .select('*')
        .eq('sport', playerData.sport)
        .or(`position.eq.${playerData.position},position.eq.ALL`);

      let playerPoints = 0;

      // Calculate points based on scoring rules
      if (scoringRules) {
        for (const rule of scoringRules) {
          const statValue = playerStats[rule.stat_type] || 0;
          playerPoints += statValue * rule.points_per;
        }
      }

      // Apply captain multiplier
      if (weeklyLineup?.captain_id === player.id) {
        if (weeklyLineup.chip_used === 'triple_captain') {
          playerPoints *= 3;
        } else {
          playerPoints *= 2;
        }
      }

      // Apply sport power play if active
      if (weeklyLineup?.chip_used === 'sport_power_play') {
        // Check if this player's sport is the power play sport
        // This would need additional logic to track which sport is boosted
        playerPoints *= 2;
      }

      // Store live score
      await supabaseClient.from('fantasy_live_scores').upsert({
        lineup_id: lineupId,
        player_id: player.id,
        live_points: playerPoints,
        stats: playerStats,
        last_updated: new Date().toISOString()
      });

      totalPoints += playerPoints;
    }

    // Apply bench boost chip
    if (weeklyLineup?.chip_used === 'bench_boost') {
      const bench = weeklyLineup.bench as any[];
      for (const benchPlayer of bench) {
        const benchStats = stats[benchPlayer.id] || {};
        const { data: benchPlayerData } = await supabaseClient
          .from('fantasy_players')
          .select('position, sport')
          .eq('id', benchPlayer.id)
          .single();

        if (!benchPlayerData) continue;

        const { data: benchScoringRules } = await supabaseClient
          .from('fantasy_scoring_rules')
          .select('*')
          .eq('sport', benchPlayerData.sport)
          .or(`position.eq.${benchPlayerData.position},position.eq.ALL`);

        let benchPoints = 0;
        if (benchScoringRules) {
          for (const rule of benchScoringRules) {
            const statValue = benchStats[rule.stat_type] || 0;
            benchPoints += statValue * rule.points_per;
          }
        }

        totalPoints += benchPoints;
      }
    }

    // Update lineup points
    await supabaseClient
      .from('fantasy_lineups')
      .update({ current_points: totalPoints })
      .eq('id', lineupId);

    // Update weekly lineup points
    if (weeklyLineup) {
      await supabaseClient
        .from('fantasy_weekly_lineups')
        .update({ points_scored: totalPoints })
        .eq('id', weeklyLineup.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        lineupId, 
        totalPoints,
        gameweekNumber 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in universal-fantasy-scoring:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
