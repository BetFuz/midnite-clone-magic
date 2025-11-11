import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[bet-recommendations] Fetching user statistics for user:", user.id);

    // Fetch user statistics
    const { data: userStats } = await supabaseClient
      .from("user_statistics")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Fetch sport statistics
    const { data: sportStats } = await supabaseClient
      .from("sport_statistics")
      .select("*")
      .eq("user_id", user.id);

    // Fetch recent bet slips
    const { data: recentBets } = await supabaseClient
      .from("bet_slips")
      .select(`
        *,
        bet_selections(*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    console.log("[bet-recommendations] User stats:", userStats);
    console.log("[bet-recommendations] Sport stats:", sportStats);
    console.log("[bet-recommendations] Recent bets:", recentBets?.length);

    // Build context for AI
    const userContext = {
      totalBets: userStats?.total_bets || 0,
      winRate: userStats?.win_rate || 0,
      favoriteSport: userStats?.favorite_sport || "Football",
      profitLoss: userStats?.profit_loss || 0,
      currentStreak: userStats?.current_streak || 0,
      sportPerformance: sportStats || [],
      recentBettingPattern: recentBets?.slice(0, 10) || [],
    };

    const systemPrompt = `You are an expert sports betting analyst. Analyze the user's betting history and patterns to provide personalized bet recommendations.

User Profile:
- Total Bets: ${userContext.totalBets}
- Win Rate: ${userContext.winRate}%
- Favorite Sport: ${userContext.favoriteSport}
- Profit/Loss: ₦${userContext.profitLoss}
- Current Streak: ${userContext.currentStreak} ${userContext.currentStreak >= 0 ? 'wins' : 'losses'}

Sport Performance:
${userContext.sportPerformance.map((s: any) => `- ${s.sport}: ${s.win_rate}% win rate, ₦${s.profit_loss} P/L`).join('\n')}

Recent Betting Pattern:
${userContext.recentBettingPattern.map((b: any) => `- ${b.status} bet with ${b.total_odds} odds`).join('\n')}

Generate 3-5 personalized bet recommendations based on:
1. Sports where the user has historically performed well
2. Betting patterns that have led to wins
3. Risk management (avoid suggesting too risky bets if user has recent losses)
4. Current form and confidence level

Format each recommendation as:
{
  "title": "Clear bet description",
  "sport": "Sport name",
  "league": "League name",
  "matchup": "Team A vs Team B",
  "suggestion": "Specific bet type",
  "odds": 2.15,
  "confidence": 85,
  "reasoning": "Why this bet suits the user's profile"
}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("[bet-recommendations] Calling Lovable AI...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate personalized bet recommendations for me based on my profile and history." },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_recommendations",
              description: "Generate personalized bet recommendations",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        sport: { type: "string" },
                        league: { type: "string" },
                        matchup: { type: "string" },
                        suggestion: { type: "string" },
                        odds: { type: "number" },
                        confidence: { type: "number" },
                        reasoning: { type: "string" },
                      },
                      required: ["title", "sport", "league", "matchup", "suggestion", "odds", "confidence", "reasoning"],
                    },
                  },
                },
                required: ["recommendations"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_recommendations" } },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[bet-recommendations] AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("[bet-recommendations] AI response received");

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const recommendations = JSON.parse(toolCall.function.arguments);
    console.log("[bet-recommendations] Recommendations generated:", recommendations.recommendations?.length);

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[bet-recommendations] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
