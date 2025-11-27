import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createServiceClient();
    let systemPrompt = '';
    let userPrompt = '';
    let analysisResult: any = {};

    if (action === 'analyze_betting_patterns') {
      systemPrompt = `You are an expert fraud detection system for casino platforms. 
                      Analyze betting patterns to identify suspicious behavior including:
                      - Unusually high win rates suggesting cheating
                      - Rapid stake escalation (Martingale strategies)
                      - Pattern recognition exploitation
                      - Collusion indicators
                      - Bot-like behavior patterns
                      
                      Return ONLY a JSON object with this structure:
                      {
                        "isSuspicious": boolean,
                        "severity": "low" | "medium" | "high" | "critical",
                        "alertType": "pattern_abuse" | "collusion" | "bot_activity" | "money_laundering",
                        "description": "Brief description of the issue",
                        "indicators": ["list", "of", "suspicious", "indicators"],
                        "recommendation": "What action should be taken"
                      }`;
      
      userPrompt = `Analyze this betting activity: ${JSON.stringify(data)}`;
    } else if (action === 'detect_collusion') {
      systemPrompt = `You are an expert at detecting collusion between casino players. 
                      Look for patterns such as:
                      - Coordinated betting on opposite outcomes
                      - Unusual win/loss patterns between specific players
                      - IP address correlations
                      - Timing patterns in bets
                      
                      Return ONLY a JSON object with the same structure as betting patterns analysis.`;
      
      userPrompt = `Analyze these players for collusion: ${JSON.stringify(data)}`;
    } else if (action === 'identify_bots') {
      systemPrompt = `You are an expert at identifying automated bot behavior in casinos.
                      Look for indicators such as:
                      - Inhuman reaction times
                      - Perfectly consistent betting patterns
                      - Lack of typical human errors
                      - Repetitive timing intervals
                      - Perfect mathematical play
                      
                      Return ONLY a JSON object with the same structure as betting patterns analysis.`;
      
      userPrompt = `Analyze this behavior for bot activity: ${JSON.stringify(data)}`;
    } else if (action === 'check_money_laundering') {
      systemPrompt = `You are an expert at detecting money laundering in casino operations.
                      Look for red flags such as:
                      - Large deposits followed by minimal play then withdrawal
                      - Chip dumping (intentionally losing to another player)
                      - Structured transactions to avoid reporting thresholds
                      - Rapid turnover with minimal play time
                      
                      Return ONLY a JSON object with the same structure as betting patterns analysis.`;
      
      userPrompt = `Analyze these transactions for money laundering: ${JSON.stringify(data)}`;
    } else if (action === 'generate_report') {
      systemPrompt = `You are generating a comprehensive security report for casino operations.
                      Summarize all alerts and provide actionable recommendations.`;
      
      userPrompt = `Generate a security report for these alerts: ${JSON.stringify(data)}`;
      
      // For reports, return the AI response directly
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
        throw new Error(`AI API error: ${response.status}`);
      }

      const aiData = await response.json();
      const report = aiData.choices[0].message.content;

      return new Response(JSON.stringify({ report }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Calling Lovable AI for fraud detection:', { action, userId });

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

    const aiData = await response.json();
    const aiResponse = aiData.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    try {
      analysisResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON, using fallback');
      analysisResult = {
        isSuspicious: false,
        severity: 'low',
        alertType: 'pattern_abuse',
        description: 'Unable to analyze - system error',
        indicators: [],
        recommendation: 'Manual review recommended'
      };
    }

    // If suspicious activity detected, create security alert
    if (analysisResult.isSuspicious && userId) {
      const { error: insertError } = await supabase
        .from('security_alerts')
        .insert({
          user_id: userId,
          alert_type: analysisResult.alertType,
          severity: analysisResult.severity,
          description: analysisResult.description,
          details: {
            indicators: analysisResult.indicators,
            recommendation: analysisResult.recommendation,
            rawData: data
          }
        });

      if (insertError) {
        console.error('Error inserting security alert:', insertError);
      }
    }

    return new Response(JSON.stringify({ analysis: analysisResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-fraud-detection function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      analysis: {
        isSuspicious: false,
        severity: 'low',
        alertType: 'system_error',
        description: 'Analysis failed - system error',
        indicators: [],
        recommendation: 'Retry or manual review'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
