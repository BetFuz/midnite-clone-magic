// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function json(data: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
    ...init,
  });
}

function parseISODateOnly(dateStr: string): { start: Date; end: Date } {
  // Expect YYYY-MM-DD; build day range in UTC
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  const end = new Date(Date.UTC(y, m - 1, d, 23, 59, 59));
  return { start, end };
}

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);

    // Support both GET query params and POST JSON body
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const qp = (key: string) => url.searchParams.get(key) ?? body[key];

    const leagueName = qp('league_name') || qp('league') || qp('league_id');
    const sportKey = qp('sport_key') || undefined;
    const date = qp('date'); // YYYY-MM-DD
    const days = parseInt(qp('days') ?? '14', 10);

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });

    let start = new Date();
    let end = new Date();
    end.setDate(end.getDate() + (Number.isFinite(days) ? days : 14));

    if (date) {
      const range = parseISODateOnly(date);
      start = range.start;
      end = range.end;
    }

    // Build query
    let query = supabase
      .from('matches')
      .select('id, match_id, league_name, sport_key, sport_title, home_team, away_team, commence_time, status, home_odds, draw_odds, away_odds')
      .gte('commence_time', start.toISOString())
      .lte('commence_time', end.toISOString())
      .order('commence_time', { ascending: true });

    if (leagueName) {
      query = query.eq('league_name', leagueName);
    }
    if (sportKey) {
      query = query.eq('sport_key', sportKey);
    }

    const { data, error } = await query;
    if (error) {
      console.error('public-matches: query error', { error, leagueName, sportKey, start: start.toISOString(), end: end.toISOString() });
      return json({ error: error.message }, { status: 500 });
    }

    const matches = (data ?? []).map((m) => ({
      id: m.id,
      match_id: m.match_id,
      league: m.league_name,
      sport_key: m.sport_key,
      home: m.home_team,
      away: m.away_team,
      kickoff: m.commence_time,
      status: m.status,
      odds: { home: m.home_odds, draw: m.draw_odds, away: m.away_odds },
    }));

    return json({ count: matches.length, matches });
  } catch (e) {
    console.error('public-matches: unexpected error', e);
    return json({ error: 'Unexpected error' }, { status: 500 });
  }
};

// Deno deploy entrypoint
export default handler;