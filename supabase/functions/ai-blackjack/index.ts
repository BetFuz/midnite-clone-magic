import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, playerHand, dealerUpcard, playerTotal } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (action === 'generate_personality') {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'system',
            content: `Create a unique professional blackjack dealer personality. Return JSON with: name (string, creative dealer name), greeting (string, welcoming message), style (string, personality trait like "friendly", "professional", "witty"), catchphrase (string, a signature phrase they say). Be creative and engaging.`
          }],
        }),
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      let personality;
      try {
        personality = JSON.parse(content);
      } catch {
        personality = {
          name: "Victor",
          greeting: "Welcome to my table! Let's play some cards.",
          style: "Professional and friendly",
          catchphrase: "May the cards be in your favor!"
        };
      }

      return new Response(JSON.stringify({ personality }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'strategy_advice') {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'system',
            content: `You are a professional blackjack strategy advisor. Analyze the hand and provide optimal play advice based on basic strategy. Keep advice concise (1-2 sentences).`
          }, {
            role: 'user',
            content: `Player hand: ${playerHand.join(', ')} (Total: ${playerTotal}). Dealer showing: ${dealerUpcard}. What should I do?`
          }],
        }),
      });

      const data = await response.json();
      const advice = data.choices[0].message.content;

      return new Response(JSON.stringify({ advice }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-blackjack function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
