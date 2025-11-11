import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: `You are BetFuz Voice Assistant, helping users place bets through voice commands.

Listen for betting intents like:
- "Place ₦5000 on Arsenal to win"
- "Bet on Lakers spread"
- "What are the odds for Real Madrid?"
- "Show me today's football matches"

Extract bet details and confirm with the user before execution. Be concise and friendly.

When users want to place a bet, respond with a structured format:
"I'll place a bet for you:
- Match: [teams]
- Selection: [bet type]
- Stake: ₦[amount]
- Odds: [odds]

Confirm to place this bet, or say 'cancel' to stop."`
      }),
    });

    const data = await response.json();
    console.log("Session created:", data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});