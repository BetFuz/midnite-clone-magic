import { createClientWithAuth } from '../_shared/supabase-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RTPRequest {
  gameType?: string;
  gameName?: string;
  startDate?: string;
  endDate?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClientWithAuth(authHeader);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { gameType, gameName, startDate, endDate }: RTPRequest = await req.json();

    // Build query for bet slips
    let betQuery = supabase
      .from('bet_slips')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['won', 'lost']);

    if (startDate) {
      betQuery = betQuery.gte('created_at', startDate);
    }
    if (endDate) {
      betQuery = betQuery.lte('created_at', endDate);
    }

    const { data: bets, error: betError } = await betQuery;
    if (betError) throw betError;

    // Calculate RTP per game
    const gameStats = new Map<string, { 
      wagered: number; 
      won: number; 
      betCount: number;
      gameType: string;
    }>();

    for (const bet of bets || []) {
      // Extract game info from bet (stub - would need to join with bet_selections or match metadata)
      const gameKey = gameName || bet.bet_type || 'sports_betting';
      const type = gameType || 'sports';

      if (!gameStats.has(gameKey)) {
        gameStats.set(gameKey, { wagered: 0, won: 0, betCount: 0, gameType: type });
      }

      const stats = gameStats.get(gameKey)!;
      stats.wagered += parseFloat(bet.total_stake.toString());
      stats.betCount += 1;

      if (bet.status === 'won') {
        stats.won += parseFloat(bet.potential_win.toString());
      }
    }

    // Calculate RTP and upsert to database
    const rtpResults = [];
    const today = new Date().toISOString().split('T')[0];

    for (const [gameName, stats] of gameStats.entries()) {
      const rtpPercentage = stats.wagered > 0 
        ? ((stats.won / stats.wagered) * 100).toFixed(2) 
        : '0.00';

      const { data: rtp, error: rtpError } = await supabase
        .from('rtp_calculations')
        .upsert({
          user_id: user.id,
          game_type: stats.gameType,
          game_name: gameName,
          total_wagered: stats.wagered,
          total_won: stats.won,
          rtp_percentage: parseFloat(rtpPercentage),
          bet_count: stats.betCount,
          calculation_date: today,
        }, {
          onConflict: 'user_id,game_type,game_name,calculation_date',
        })
        .select()
        .single();

      if (rtpError) {
        console.error('RTP upsert error:', rtpError);
        continue;
      }

      rtpResults.push(rtp);
    }

    // Get all user RTP data
    const { data: allRTP, error: allRTPError } = await supabase
      .from('rtp_calculations')
      .select('*')
      .eq('user_id', user.id)
      .order('calculation_date', { ascending: false });

    if (allRTPError) throw allRTPError;

    return new Response(
      JSON.stringify({
        success: true,
        calculated: rtpResults,
        all_rtp: allRTP,
        message: 'RTP calculated successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('RTP calculator error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
