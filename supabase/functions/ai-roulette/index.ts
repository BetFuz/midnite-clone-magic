import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, spinHistory, balance } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'analyze') {
      systemPrompt = `You are a professional roulette analyst. Analyze the spin history and provide interesting pattern observations for entertainment purposes. Be clear that each spin is independent and random. Keep response under 100 words.`;
      
      const redCount = spinHistory.filter((s: any) => s.color === 'red').length;
      const blackCount = spinHistory.filter((s: any) => s.color === 'black').length;
      const numbers = spinHistory.map((s: any) => s.number).join(', ');
      
      userPrompt = `Analyze these recent spins: ${numbers}. Red appeared ${redCount} times, Black ${blackCount} times. Provide entertaining observations about patterns, streaks, or distribution. Remind that roulette is random.`;
    } else if (action === 'strategy') {
      systemPrompt = `You are a roulette betting advisor. Suggest a conservative betting strategy based on the player's balance and recent history. Focus on bankroll management and entertainment value. Keep response under 80 words.`;
      
      userPrompt = `Player balance: ₦${balance}. Recent spins: ${spinHistory.map((s: any) => s.number).slice(0, 5).join(', ')}. Suggest a smart betting strategy that preserves bankroll while maximizing fun.`;
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

    if (action === 'analyze') {
      return new Response(
        JSON.stringify({ analysis: content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'strategy') {
      return new Response(
        JSON.stringify({ strategy: content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-roulette function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
