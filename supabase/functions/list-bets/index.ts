import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClientWithAuth } from "../_shared/supabase-client.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization header' }, 401);
    }

    const supabase = createClientWithAuth(authHeader);

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    // Get pagination parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get user's bet slips
    const { data: betSlips, error: betSlipsError, count } = await supabase
      .from('bet_slips')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (betSlipsError) {
      console.error('Error fetching bet slips:', betSlipsError);
      return jsonResponse({ error: 'Failed to fetch bets' }, 500);
    }

    // Get selections for each bet slip
    const betSlipIds = betSlips?.map(slip => slip.id) || [];
    
    let selections = [];
    if (betSlipIds.length > 0) {
      const { data: selectionsData, error: selectionsError } = await supabase
        .from('bet_selections')
        .select('*')
        .in('bet_slip_id', betSlipIds);

      if (selectionsError) {
        console.error('Error fetching selections:', selectionsError);
        return jsonResponse({ error: 'Failed to fetch bet selections' }, 500);
      }
      
      selections = selectionsData || [];
    }

    // Group selections by bet slip
    const betsWithSelections = betSlips?.map(slip => ({
      ...slip,
      selections: selections.filter(sel => sel.bet_slip_id === slip.id)
    })) || [];

    return jsonResponse({
      bets: betsWithSelections,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in list-bets function:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
