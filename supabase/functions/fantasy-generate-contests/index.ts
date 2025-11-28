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

    // Get all open leagues
    const { data: leagues } = await supabaseClient
      .from('fantasy_leagues')
      .select('*')
      .eq('status', 'open')
      .order('deadline', { ascending: true });

    if (!leagues || leagues.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No open leagues found', created: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get contest types
    const { data: contestTypes } = await supabaseClient
      .from('fantasy_contest_types')
      .select('*');

    if (!contestTypes || contestTypes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No contest types found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const contestsToCreate = [];

    // Create contests for each league
    for (const league of leagues) {
      // Check if contests already exist
      const { data: existing } = await supabaseClient
        .from('fantasy_contests')
        .select('id')
        .eq('league_id', league.id);

      if (existing && existing.length > 0) continue;

      // Create multiple contest types per league
      for (const type of contestTypes) {
        const entryFee = type.code === 'h2h' ? 5000 : type.code === 'gpp' ? 10000 : 2000;
        const maxEntries = type.code === 'h2h' ? 2 : type.code === 'gpp' ? 10000 : 100;
        const prizePool = type.code === 'gpp' ? 1000000 : entryFee * maxEntries * 0.9;

        contestsToCreate.push({
          league_id: league.id,
          contest_type_id: type.id,
          name: `${league.name} - ${type.name}`,
          entry_fee: entryFee,
          prize_pool: prizePool,
          max_entries: maxEntries,
          allows_multi_entry: type.code !== 'h2h',
          max_entries_per_user: type.code === 'h2h' ? 1 : 150,
          allows_late_swap: true,
          late_swap_deadline: new Date(new Date(league.deadline).getTime() - 15 * 60000).toISOString(),
          is_beginner_only: type.code === '50_50',
          starts_at: league.deadline
        });
      }
    }

    if (contestsToCreate.length === 0) {
      return new Response(
        JSON.stringify({ message: 'All contests already exist', created: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: created, error } = await supabaseClient
      .from('fantasy_contests')
      .insert(contestsToCreate)
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true,
        created: created?.length || 0,
        contests: created
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating contests:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
