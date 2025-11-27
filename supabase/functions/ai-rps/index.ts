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

    if (action === 'generateProfile') {
      const systemPrompt = `You are creating an AI personality for a rock-paper-scissors game. Generate a unique AI opponent with name, playing style, description, and estimated win rate (0.6-0.7). Return JSON: { "name": "string", "style": "string", "description": "string", "winRate": number }`;

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
            { role: 'user', content: 'Generate AI opponent profile' }
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
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }
      
      const profile = JSON.parse(jsonMatch[0]);

      return new Response(
        JSON.stringify({ profile }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'predictMove') {
      const moves = ['rock', 'paper', 'scissors'];
      
      if (!history || history.length === 0) {
        // Random move for first round
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        return new Response(
          JSON.stringify({ 
            move: randomMove, 
            thinking: 'Making an unpredictable opening move...' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const systemPrompt = `You are a psychological rock-paper-scissors AI that analyzes player patterns. Based on their move history, predict their next move and explain your reasoning. Return JSON: { "predictedPlayerMove": "rock/paper/scissors", "thinking": "brief explanation", "counterMove": "rock/paper/scissors" }`;

      const historyStr = history.slice(-10).join(', ');
      const userPrompt = `Player's last ${Math.min(history.length, 10)} moves: ${historyStr}. Predict their next move and provide a counter.`;

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
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Fallback to pattern-based logic
        return analyzePatternFallback(history);
      }
      
      const prediction = JSON.parse(jsonMatch[0]);

      return new Response(
        JSON.stringify({ 
          move: prediction.counterMove || prediction.predictedPlayerMove,
          thinking: prediction.thinking || 'Analyzing your patterns...'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-rps function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function analyzePatternFallback(history: string[]) {
  const moves = ['rock', 'paper', 'scissors'];
  const counters = { rock: 'paper', paper: 'scissors', scissors: 'rock' };
  
  // Check for patterns
  const lastThree = history.slice(-3);
  const rockCount = lastThree.filter(m => m === 'rock').length;
  const paperCount = lastThree.filter(m => m === 'paper').length;
  const scissorsCount = lastThree.filter(m => m === 'scissors').length;
  
  if (rockCount >= 2) {
    return new Response(
      JSON.stringify({ 
        move: 'paper',
        thinking: 'I noticed you favor rock recently. Playing paper!'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (paperCount >= 2) {
    return new Response(
      JSON.stringify({ 
        move: 'scissors',
        thinking: 'You seem to like paper. Time for scissors!'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (scissorsCount >= 2) {
    return new Response(
      JSON.stringify({ 
        move: 'rock',
        thinking: 'Scissors pattern detected. Going with rock!'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Random with psychological message
  const randomMove = moves[Math.floor(Math.random() * moves.length)];
  return new Response(
    JSON.stringify({ 
      move: randomMove,
      thinking: 'Keeping you guessing with an unpredictable move...'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
