import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, count = 2 } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (action === 'generateThemes') {
      const systemPrompt = `You are a scratch card theme designer. Create ${count} unique and engaging scratch card themes with Nigerian cultural elements. Return JSON array with format: [{ "id": "unique-id", "name": "Theme Name", "description": "Brief description", "price": number (100-1000), "color": "tailwind gradient classes like from-red-500 to-orange-500", "icon": "emoji" }]`;

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
            { role: 'user', content: 'Generate creative scratch card themes' }
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
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }
      
      const themes = JSON.parse(jsonMatch[0]);

      // Add default prize structure to each theme
      const themesWithPrizes = themes.map((theme: any) => ({
        ...theme,
        prizes: [
          { amount: 0, probability: 0.65 },
          { amount: theme.price * 0.5, probability: 0.18 },
          { amount: theme.price * 2, probability: 0.10 },
          { amount: theme.price * 10, probability: 0.05 },
          { amount: theme.price * 50, probability: 0.02 }
        ]
      }));

      return new Response(
        JSON.stringify({ themes: themesWithPrizes }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-scratch-card function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
