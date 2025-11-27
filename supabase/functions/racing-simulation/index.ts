import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { raceType, raceId, participants } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate AI commentary
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const commentaryResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: `Generate exciting live commentary for a ${raceType} race with these participants: ${participants.map((p: any) => p.name).join(', ')}. Make it dramatic and engaging, 3-4 sentences.`
        }]
      })
    });

    const commentaryData = await commentaryResponse.json();
    const commentary = commentaryData.choices?.[0]?.message?.content || 'The race is underway!';

    // Simulate race progression over 30 seconds
    const updates = 10;
    const interval = 3000; // 3 seconds between updates

    for (let i = 0; i < updates; i++) {
      await new Promise(resolve => setTimeout(resolve, interval));

      // Calculate positions with some randomness
      const positions: Record<string, number> = {};
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      
      shuffled.forEach((p: any, idx: number) => {
        positions[p.id] = idx + 1;
      });

      const state = i === updates - 1 ? 'finished' : 'racing';
      const winner = state === 'finished' ? shuffled[0].id : null;

      // Broadcast update
      await supabase.channel(`race_${raceId}`).send({
        type: 'broadcast',
        event: 'race_update',
        payload: {
          positions,
          state,
          winner,
          commentary: i === 0 ? commentary : null
        }
      });
    }

    return new Response(
      JSON.stringify({ success: true, commentary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Racing simulation error:', error);
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
