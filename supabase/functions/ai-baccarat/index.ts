import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, history, theme } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'trend') {
      systemPrompt = `You are a baccarat pattern analyst. Analyze the game history and identify interesting patterns, streaks, or trends. Remember that each hand is independent. Keep response under 120 words and mention any notable patterns for entertainment purposes.`;
      
      const recentResults = history.map((h: any) => h.result).slice(0, 20).join(', ');
      const playerWins = history.filter((h: any) => h.result === 'player').length;
      const bankerWins = history.filter((h: any) => h.result === 'banker').length;
      const ties = history.filter((h: any) => h.result === 'tie').length;
      
      userPrompt = `Analyze these recent baccarat results: ${recentResults}. Player wins: ${playerWins}, Banker wins: ${bankerWins}, Ties: ${ties}. Identify patterns, streaks, or trends. Remind that each hand is independent.`;
    } else if (action === 'cultural') {
      systemPrompt = `You are an expert on Asian gaming culture and baccarat traditions. Share interesting cultural insights, superstitions, or traditions related to the ${theme} theme. Keep response under 100 words and make it engaging.`;
      
      userPrompt = `Share an interesting cultural insight or tradition related to ${theme} symbolism in Asian baccarat gaming. Make it educational and entertaining.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    if (action === 'trend') {
      return new Response(
        JSON.stringify({ analysis: content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'cultural') {
      return new Response(
        JSON.stringify({ insight: content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-baccarat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
