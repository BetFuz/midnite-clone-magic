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
    const { action, prompt, drivers, circuit } = await req.json();
    const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');

    if (!KIE_AI_API_KEY) {
      throw new Error('KIE_AI_API_KEY is not configured');
    }

    let result: any = {};

    switch (action) {
      case 'generateRaceScenario': {
        // Generate realistic F1 race scenario with weather, strategies, and drama
        const scenarioResponse = await fetch('https://api.kie.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${KIE_AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek-r1',
            messages: [{
              role: 'system',
              content: `You are an F1 race director creating realistic Grand Prix scenarios. 
                       Generate detailed race conditions including:
                       - Weather conditions (dry, wet, changing conditions)
                       - Tire strategy options (soft, medium, hard compounds)
                       - Driver performance factors (form, car setup, track experience)
                       - Dramatic race moments (safety cars, crashes, overtakes)
                       - Pit stop timing and strategy variations
                       - Race narrative with tension and excitement
                       
                       Format response as JSON with: weather, tireStrategies, driverForm, keyMoments, pitWindows, raceNarrative`
            }, {
              role: 'user',
              content: `Create a Grand Prix scenario for ${circuit || 'Monaco'} circuit with these drivers: ${drivers?.join(', ') || 'Verstappen, Hamilton, Leclerc, Norris, Sainz'}`
            }]
          })
        });

        const scenarioData = await scenarioResponse.json();
        result.scenario = scenarioData.choices?.[0]?.message?.content || '{}';
        break;
      }

      case 'generateLiveCommentary': {
        // Create live commentary stream for race progression
        const commentaryResponse = await fetch('https://api.kie.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${KIE_AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek-r1',
            messages: [{
              role: 'system',
              content: `You are an excited F1 race commentator like Martin Brundle or David Croft. 
                       Generate dramatic, engaging live commentary for the race moment.
                       Include driver names, positions, lap times, and exciting language.
                       Keep it energetic and professional.`
            }, {
              role: 'user',
              content: prompt || 'Race start at Monaco, lights out!'
            }]
          })
        });

        const commentaryData = await commentaryResponse.json();
        result.commentary = commentaryData.choices?.[0]?.message?.content || '';
        break;
      }

      case 'simulatePitStrategies': {
        // Analyze and simulate optimal pit stop strategies
        const strategyResponse = await fetch('https://api.kie.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${KIE_AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek-r1',
            messages: [{
              role: 'system',
              content: `You are an F1 race strategist analyzing pit stop options.
                       Calculate optimal pit windows, tire degradation, undercut/overcut opportunities.
                       Consider race position, tire age, track position, and competitor strategies.
                       Format as JSON with: optimalWindows, tireLife, strategicOptions, riskAssessment`
            }, {
              role: 'user',
              content: `Analyze pit strategies for ${drivers?.join(', ') || 'current race leaders'} with current conditions: ${prompt || 'dry track, high degradation'}`
            }]
          })
        });

        const strategyData = await strategyResponse.json();
        result.strategies = strategyData.choices?.[0]?.message?.content || '{}';
        break;
      }

      case 'generateRaceVideo': {
        // Generate cinematic F1 race footage using Sora-2
        const videoResponse = await fetch('https://api.kie.ai/v1/video/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${KIE_AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sora-2',
            prompt: prompt || `Formula 1 race start at ${circuit || 'Monaco'}, traffic lights sequence red to green, 
                              cars launching with wheel spin and smoke, tight first corner battle, 
                              dramatic overtaking maneuvers, professional broadcast camera angles, 
                              cinematic slow motion replays, 8K quality, ultra-realistic`,
            duration: 45,
            aspect_ratio: '16:9',
            quality: 'high'
          })
        });

        const videoData = await videoResponse.json();
        result.videoUrl = videoData.data?.[0]?.url || videoData.url || null;
        break;
      }

      case 'generateDriverImage': {
        // Generate high-quality F1 driver/car images
        const imageResponse = await fetch('https://api.kie.ai/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${KIE_AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'veo-3',
            prompt: prompt || `Professional F1 racing scene at ${circuit || 'Monaco'} Grand Prix, 
                              modern Formula 1 cars on track, dramatic racing action, 
                              photorealistic, 8K quality, professional motorsport photography`,
            size: '1920x1080',
            quality: 'hd'
          })
        });

        const imageData = await imageResponse.json();
        result.imageUrl = imageData.data?.[0]?.url || imageData.url || null;
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('F1 Racing AI error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
