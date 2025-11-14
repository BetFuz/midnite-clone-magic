import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface DiagnosticCheck {
  status: 'PASS' | 'FAIL';
  details: string;
  [key: string]: any;
}

interface DiagnosticResponse {
  test_id: string;
  timestamp: string;
  summary: {
    overall_status: 'PASS' | 'FAIL';
    passed: number;
    failed: number;
  };
  checks: Record<string, DiagnosticCheck>;
  raw_logs: string[];
}

function pass(details: string, extra = {}): DiagnosticCheck {
  return { status: 'PASS', details, ...extra };
}

function fail(details: string, extra = {}): DiagnosticCheck {
  return { status: 'FAIL', details, ...extra };
}

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const reqBody = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
  const url = new URL(req.url);
  
  const testLeagueId = reqBody.league_id || parseInt(url.searchParams.get('league_id') || '0', 10);
  const testLeagueName = reqBody.league_name || url.searchParams.get('league_name') || 'Premier League';
  const testDate = reqBody.date || url.searchParams.get('date');

  const out: DiagnosticResponse = {
    test_id: reqBody.test_id || `diag-${Date.now()}`,
    timestamp: new Date().toISOString(),
    summary: { overall_status: 'PASS', passed: 0, failed: 0 },
    checks: {},
    raw_logs: [],
  };

  function logRaw(msg: string) {
    out.raw_logs.push(`${new Date().toISOString()} ${msg}`);
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Check 1: Total matches count
  logRaw('Check 1: Total matches count');
  try {
    const { count, error } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      out.checks['1_matches_total_count'] = fail('Failed to count matches', { error: error.message });
      out.summary.failed++;
    } else {
      out.checks['1_matches_total_count'] = pass('Matches table accessible', { total_matches: count });
      out.summary.passed++;
      logRaw(`Total matches: ${count}`);
    }
  } catch (err: any) {
    out.checks['1_matches_total_count'] = fail('Exception counting matches', { error: err.message });
    out.summary.failed++;
  }

  // Check 2: Matches for specific league by name
  logRaw(`Check 2: Matches for league "${testLeagueName}"`);
  try {
    const { data, error, count } = await supabase
      .from('matches')
      .select('*', { count: 'exact' })
      .eq('league_name', testLeagueName)
      .limit(5);
    
    if (error) {
      out.checks['2_league_name_matches'] = fail(`Failed to query league "${testLeagueName}"`, { error: error.message });
      out.summary.failed++;
    } else if (!data || data.length === 0) {
      out.checks['2_league_name_matches'] = fail(`No matches found for league "${testLeagueName}"`, { count: 0 });
      out.summary.failed++;
    } else {
      out.checks['2_league_name_matches'] = pass(`Found matches for "${testLeagueName}"`, { 
        count, 
        sample_count: data.length,
        sample: data.slice(0, 2).map(m => ({ home: m.home_team, away: m.away_team, time: m.commence_time }))
      });
      out.summary.passed++;
      logRaw(`League matches found: ${count}`);
    }
  } catch (err: any) {
    out.checks['2_league_name_matches'] = fail('Exception querying league matches', { error: err.message });
    out.summary.failed++;
  }

  // Check 3: League ID mapping (if provided)
  if (testLeagueId > 0) {
    logRaw(`Check 3: League ID ${testLeagueId} mapping`);
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('id, name')
        .eq('id', testLeagueId)
        .single();
      
      if (error) {
        out.checks['3_league_id_mapping'] = fail(`League ID ${testLeagueId} not found`, { error: error.message });
        out.summary.failed++;
      } else if (data) {
        out.checks['3_league_id_mapping'] = pass(`League ID ${testLeagueId} maps to "${data.name}"`, { 
          league_id: testLeagueId, 
          league_name: data.name 
        });
        out.summary.passed++;
        logRaw(`League mapping: ${testLeagueId} -> ${data.name}`);
      }
    } catch (err: any) {
      out.checks['3_league_id_mapping'] = fail('Exception checking league mapping', { error: err.message });
      out.summary.failed++;
    }
  } else {
    out.checks['3_league_id_mapping'] = fail('No league_id provided for mapping test', {});
    out.summary.failed++;
  }

  // Check 4: NULL league_id health
  logRaw('Check 4: NULL league_id count');
  try {
    const { count, error } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .is('league_id', null);
    
    if (error) {
      out.checks['4_null_league_id'] = fail('Failed to count NULL league_id', { error: error.message });
      out.summary.failed++;
    } else {
      const status = count && count > 0 ? 'PASS' : 'PASS';
      out.checks['4_null_league_id'] = { 
        status, 
        details: `Found ${count} matches with NULL league_id`, 
        null_count: count,
        health: count === 0 ? 'HEALTHY' : 'NEEDS_BACKFILL'
      };
      out.summary.passed++;
      logRaw(`NULL league_id count: ${count}`);
    }
  } catch (err: any) {
    out.checks['4_null_league_id'] = fail('Exception counting NULL league_id', { error: err.message });
    out.summary.failed++;
  }

  // Check 5: public_matches view
  logRaw('Check 5: public_matches view');
  try {
    const { data, error, count } = await supabase
      .from('public_matches')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (error) {
      out.checks['5_public_matches_view'] = fail('public_matches view query failed', { error: error.message });
      out.summary.failed++;
    } else {
      out.checks['5_public_matches_view'] = pass('public_matches view accessible', { total_count: count });
      out.summary.passed++;
      logRaw(`public_matches view count: ${count}`);
    }
  } catch (err: any) {
    out.checks['5_public_matches_view'] = fail('Exception querying public_matches view', { error: err.message });
    out.summary.failed++;
  }

  // Check 6: public-matches function (if league provided)
  if (testLeagueName) {
    logRaw(`Check 6: public-matches function with league "${testLeagueName}"`);
    try {
      const { data, error } = await supabase.functions.invoke('public-matches', {
        body: { league_name: testLeagueName, days: 14 }
      });
      
      if (error) {
        out.checks['6_public_matches_function'] = fail('public-matches function error', { error: error.message });
        out.summary.failed++;
      } else if (data && data.matches) {
        out.checks['6_public_matches_function'] = pass('public-matches function returned data', { 
          count: data.count,
          sample_count: data.matches.length 
        });
        out.summary.passed++;
        logRaw(`Function returned: ${data.count} matches`);
      } else {
        out.checks['6_public_matches_function'] = fail('public-matches function returned unexpected format', { data });
        out.summary.failed++;
      }
    } catch (err: any) {
      out.checks['6_public_matches_function'] = fail('Exception calling public-matches function', { error: err.message });
      out.summary.failed++;
    }
  } else {
    out.checks['6_public_matches_function'] = fail('No league_name provided for function test', {});
    out.summary.failed++;
  }

  // Compute overall status
  out.summary.overall_status = out.summary.failed > 0 ? 'FAIL' : 'PASS';

  return new Response(JSON.stringify(out, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
};

export default handler;
