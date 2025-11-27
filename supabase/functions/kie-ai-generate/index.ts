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
    const { action, prompt, type, style } = await req.json();
    const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    console.log('Asset generation request:', { action, type, prompt: prompt?.substring(0, 50) + '...' });

    // Helper function to generate image with Lovable AI (fallback)
    const generateWithLovableAI = async () => {
      if (!LOVABLE_API_KEY) {
        throw new Error('No AI API keys configured');
      }

      console.log('Using Lovable AI for image generation...');
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [{
            role: 'user',
            content: prompt
          }],
          modalities: ['image', 'text']
        }),
      });

      if (!response.ok) {
        throw new Error(`Lovable AI error: ${response.statusText}`);
      }

      const result = await response.json();
      const imageData = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!imageData) {
        throw new Error('No image data returned from Lovable AI');
      }

      return {
        imageUrl: imageData,
        prompt: prompt,
        model: 'lovable-ai-gemini'
      };
    };

    // Generate static images with premium AI models
    if (action === 'generateImage') {
      // Try kie.ai first if API key is available, fallback to Lovable AI
      if (KIE_AI_API_KEY) {
        try {
          console.log('Attempting kie.ai image generation...');
          
          // Correct kie.ai endpoint for Flux Kontext
          const response = await fetch('https://api.kie.ai/api/v1/flux/kontext/generate', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${KIE_AI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: `${prompt}, ultra high quality, 8K resolution, professional photography, cinematic lighting, photorealistic`,
              aspectRatio: '16:9',
              model: 'flux-kontext-max', // Use max for best quality
              callBackUrl: '' // Empty for synchronous mode
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.warn('kie.ai failed, falling back to Lovable AI:', response.status, errorText);
            return new Response(JSON.stringify(await generateWithLovableAI()), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const result = await response.json();
          
          // kie.ai is async, return taskId for polling
          return new Response(JSON.stringify({
            taskId: result.data?.taskId,
            status: 'generating',
            model: 'flux-kontext-max'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.warn('kie.ai error, falling back to Lovable AI:', error);
          return new Response(JSON.stringify(await generateWithLovableAI()), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        // No kie.ai key, use Lovable AI directly
        return new Response(JSON.stringify(await generateWithLovableAI()), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Generate video with kie.ai (Runway)
    if (action === 'generateVideo') {
      if (!KIE_AI_API_KEY) {
        throw new Error('KIE_AI_API_KEY required for video generation');
      }

      console.log('Generating video with kie.ai Runway API...');
      
      const response = await fetch('https://api.kie.ai/api/v1/runway/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          aspectRatio: '16:9',
          imageUrl: '', // Empty for text-to-video
          callBackUrl: '' // Empty for synchronous mode
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('kie.ai video error:', response.status, errorText);
        throw new Error(`kie.ai API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      // kie.ai is async, return taskId for polling
      return new Response(JSON.stringify({
        taskId: result.data?.taskId,
        status: 'generating',
        model: 'runway'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Asset generation error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
