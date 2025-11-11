import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { matchId, homeTeam, awayTeam, sport, league } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Check if prediction already exists
    const { data: existing } = await supabaseClient
      .from('ai_predictions')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      return new Response(JSON.stringify(existing), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get match statistics if available
    const { data: stats } = await supabaseClient
      .from('match_statistics')
      .select('*')
      .eq('match_id', matchId)
      .single();

    const prompt = `Analyze this ${sport} match and provide a detailed prediction:

Match: ${homeTeam} vs ${awayTeam}
League: ${league || 'Unknown'}

${stats ? `
Home Team Stats:
- Form: ${stats.home_form || 'N/A'}
- Position: ${stats.home_position || 'N/A'}
- Goals Scored: ${stats.home_goals_scored || 0}
- Goals Conceded: ${stats.home_goals_conceded || 0}

Away Team Stats:
- Form: ${stats.away_form || 'N/A'}
- Position: ${stats.away_position || 'N/A'}
- Goals Scored: ${stats.away_goals_scored || 0}
- Goals Conceded: ${stats.away_goals_conceded || 0}

Head-to-Head:
- Home Wins: ${stats.h2h_home_wins || 0}
- Draws: ${stats.h2h_draws || 0}
- Away Wins: ${stats.h2h_away_wins || 0}
` : ''}

Provide:
1. Most likely outcome (Home Win, Draw, or Away Win)
2. Confidence score (0-100)
3. Detailed reasoning based on form, stats, and context
4. Alternative betting suggestions

Format as JSON:
{
  "predicted_outcome": "...",
  "confidence_score": 75,
  "reasoning": "...",
  "alternative_bets": "..."
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert sports analyst providing data-driven betting predictions." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const prediction = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      predicted_outcome: "Analysis pending",
      confidence_score: 50,
      reasoning: content,
      alternative_bets: ""
    };

    // Save prediction to database
    const { data: saved, error: saveError } = await supabaseClient
      .from('ai_predictions')
      .insert({
        match_id: matchId,
        home_team: homeTeam,
        away_team: awayTeam,
        sport,
        prediction_type: 'match_outcome',
        predicted_outcome: prediction.predicted_outcome,
        confidence_score: prediction.confidence_score,
        reasoning: `${prediction.reasoning}\n\nAlternative bets: ${prediction.alternative_bets}`
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return new Response(JSON.stringify(saved), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-predictions:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});