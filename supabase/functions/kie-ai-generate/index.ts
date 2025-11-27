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

    if (!KIE_AI_API_KEY) {
      throw new Error('KIE_AI_API_KEY not configured');
    }

    console.log('kie.ai request:', { action, type, prompt });

    // Generate assets using kie.ai API (Sora 2, Veo 3)
    if (action === 'generateVideo') {
      // Use Veo 3 or Sora 2 for video generation
      const model = type === 'cinematic' ? 'sora-2' : 'veo-3';
      
      const response = await fetch('https://api.kie.ai/v1/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          duration: type === 'win-animation' ? 5 : 10,
          resolution: '1920x1080',
          fps: 30,
          style: style || 'photorealistic'
        }),
      });

      if (!response.ok) {
        throw new Error(`kie.ai API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return new Response(JSON.stringify({
        videoUrl: result.video_url,
        thumbnailUrl: result.thumbnail_url,
        duration: result.duration,
        model: model
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate static images with premium AI models
    if (action === 'generateImage') {
      // Model selection based on use case:
      // - 'flux-1-kontext': Best for photorealistic scenes with context awareness
      // - 'imagen-4': Google's latest, excellent for sports/action scenes
      // - 'ideogram-v3': Superior for graphics, logos, and text-in-image
      // - 'ideogram-character': Best for character/mascot generation
      // - 'qwen-image-edit': For image editing/enhancement
      const modelMap: Record<string, string> = {
        'hero': 'flux-1-kontext',
        'league': 'ideogram-v3',
        'team': 'ideogram-v3',
        'promo': 'imagen-4',
        'character': 'ideogram-character',
        'sport': 'flux-1-kontext',
        'casino': 'flux-1-kontext',
        'edit': 'qwen-image-edit',
        'default': 'flux-1-kontext'
      };

      const model = modelMap[type || 'default'] || 'flux-1-kontext';
      
      const response = await fetch('https://api.kie.ai/v1/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt: `${prompt}, ultra high quality, 8K resolution, professional photography, cinematic lighting, photorealistic`,
          width: 1920,
          height: 1080,
          quality: 'ultra',
          style: style || 'photorealistic'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('kie.ai API error:', response.status, errorText);
        throw new Error(`kie.ai API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return new Response(JSON.stringify({
        imageUrl: result.image_url,
        prompt: result.prompt,
        model: model
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate animated slot symbols
    if (action === 'generateSymbolAnimation') {
      const response = await fetch('https://api.kie.ai/v1/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'veo-3',
          prompt: `${prompt}, looping animation, seamless loop, 3D render, casino game symbol`,
          duration: 3,
          loop: true,
          resolution: '512x512',
          fps: 60
        }),
      });

      if (!response.ok) {
        throw new Error(`kie.ai API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return new Response(JSON.stringify({
        animationUrl: result.video_url,
        loop: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('kie.ai error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
