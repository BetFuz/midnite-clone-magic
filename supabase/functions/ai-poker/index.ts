import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, count, holeCards, communityCards, pot, phase, yourChips } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (action === 'create_opponents') {
      const personalities = [
        { name: 'Tight Tim', style: 'Conservative player, only bets on strong hands, rarely bluffs' },
        { name: 'Aggressive Annie', style: 'Aggressive bettor, frequently raises, uses psychology' },
        { name: 'Lucky Larry', style: 'Unpredictable player, takes calculated risks, occasionally bluffs' },
      ];

      const opponents = personalities.slice(0, count || 3).map(p => ({
        name: p.name,
        personality: p.style,
      }));

      return new Response(
        JSON.stringify({ opponents }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'advice') {
      const systemPrompt = `You are a professional poker strategist. Analyze the current poker hand and provide tactical advice. Consider position, pot odds, hand strength, and opponent behavior. Keep advice concise (under 100 words) and actionable.`;
      
      const holeCardsStr = holeCards.map((c: any) => `${c.rank}${c.suit}`).join(' ');
      const communityStr = communityCards.map((c: any) => `${c.rank}${c.suit}`).join(' ');
      
      const userPrompt = `Current situation:
- Your hole cards: ${holeCardsStr}
- Community cards: ${communityStr}
- Phase: ${phase}
- Pot: ₦${pot}
- Your chips: ₦${yourChips}

What's the optimal play? Should I fold, call, or raise? Explain briefly.`;

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
      const advice = data.choices?.[0]?.message?.content || '';

      return new Response(
        JSON.stringify({ advice }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-poker function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
