import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-forwarded-for',
};

interface RateLimitRequest {
  endpoint: string;
  limit?: number;
  window_seconds?: number;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP from headers (Cloudflare/proxy) or fallback
    const clientIp = req.headers.get('cf-connecting-ip') 
      || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || '0.0.0.0';

    const { endpoint, limit = 100, window_seconds = 60 }: RateLimitRequest = await req.json();

    console.log(`Rate limit check: IP=${clientIp}, endpoint=${endpoint}`);

    // Call the rate limit function
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_ip_address: clientIp,
      p_endpoint: endpoint,
      p_limit: limit,
      p_window_seconds: window_seconds
    });

    if (error) {
      console.error('Rate limit check failed:', error);
      // Fail open - allow request if rate limiting fails
      return new Response(
        JSON.stringify({ allowed: true, error: 'Rate limit check failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log if blocked
    if (!data.allowed) {
      console.warn(`Rate limited: IP=${clientIp}, endpoint=${endpoint}, blocked_until=${data.blocked_until}`);
    }

    return new Response(
      JSON.stringify(data),
      { 
        status: data.allowed ? 200 : 429,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(data.remaining || 0),
          'Retry-After': data.blocked_until ? '300' : '0'
        } 
      }
    );

  } catch (error) {
    console.error('Rate limiter error:', error);
    return new Response(
      JSON.stringify({ allowed: true, error: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
