import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, history } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'quickPick') {
      systemPrompt = `You are a keno strategy advisor. Generate a smart quick pick of 10 numbers (1-80) with a strategic explanation. Return JSON with: { "numbers": [array of 10 unique numbers], "strategy": "brief strategy explanation" }`;
      
      userPrompt = history.length > 0 
        ? `Recent draws: ${JSON.stringify(history.slice(0, 5))}. Generate strategic quick pick.`
        : `Generate strategic quick pick of 10 numbers.`;
    } else if (action === 'analyzePattern') {
      systemPrompt = `You are a keno pattern analyst. Analyze draw history for entertainment purposes. Return JSON with: { "numbers": [5-8 suggested numbers], "description": "pattern explanation", "confidence": 0.0-1.0 }`;
      
      const recentDraws = history.slice(0, 10);
      const allNumbers = recentDraws.flat();
      const frequency = allNumbers.reduce((acc: Record<number, number>, num: number) => {
        acc[num] = (acc[num] || 0) + 1;
        return acc;
      }, {});
      
      userPrompt = `Analyze these ${recentDraws.length} recent draws. Number frequency: ${JSON.stringify(frequency)}. Identify patterns and suggest numbers.`;
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
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-keno function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
