import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let action = '';
  
  try {
    const requestData = await req.json();
    action = requestData.action;
    const { gameState, prizeWon, hostName } = requestData;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'generate_host') {
      systemPrompt = `You are creating an exciting, energetic game show host for a casino game show. 
                      Generate a host with a Nigerian name, engaging personality, and a memorable catchphrase. 
                      The host should be enthusiastic, encouraging, and entertaining.
                      
                      Return ONLY a JSON object with this structure:
                      {
                        "name": "Host Name",
                        "personality": "Brief personality description",
                        "catchphrase": "Memorable catchphrase"
                      }`;
      userPrompt = 'Create an exciting game show host';
    } else if (action === 'generate_commentary') {
      systemPrompt = `You are ${hostName}, an enthusiastic game show host. Generate exciting, 
                      engaging commentary for the current game state. Keep it brief (1-2 sentences), 
                      energetic, and appropriate for the moment. Use Nigerian expressions when fitting.`;
      
      if (gameState === 'spinning') {
        userPrompt = 'The wheel is spinning! Build excitement and anticipation.';
      } else if (gameState === 'result' && prizeWon) {
        if (prizeWon.includes('JACKPOT')) {
          userPrompt = `The player just won the MEGA JACKPOT: ${prizeWon}! Create an absolutely explosive celebration!`;
        } else if (prizeWon.includes('Try Again')) {
          userPrompt = 'The player didn\'t win this time. Encourage them to try again with optimism.';
        } else {
          userPrompt = `The player won: ${prizeWon}! Celebrate their win with excitement!`;
        }
      }
    }

    console.log('Calling Lovable AI with:', { action, gameState, prizeWon });

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
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    if (action === 'generate_host') {
      try {
        const hostData = JSON.parse(aiResponse);
        return new Response(JSON.stringify({ host: hostData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('Failed to parse host JSON, using fallback');
        return new Response(JSON.stringify({ 
          host: {
            name: 'DJ Femi',
            personality: 'Energetic Lagos game show host',
            catchphrase: 'E go better! Let\'s spin and win!'
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      return new Response(JSON.stringify({ commentary: aiResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in ai-game-show function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: action === 'generate_host' ? {
        host: {
          name: 'DJ Femi',
          personality: 'Energetic Lagos game show host',
          catchphrase: 'E go better! Let\'s spin and win!'
        }
      } : {
        commentary: '🎉 What a game! Keep spinning!'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
