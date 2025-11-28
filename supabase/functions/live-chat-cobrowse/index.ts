import { createClientWithAuth } from '../_shared/supabase-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  action: 'start' | 'enable_cobrowse' | 'end' | 'rate';
  sessionId?: string;
  cobrowseSessionId?: string;
  rating?: number;
  resolutionSummary?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClientWithAuth(authHeader);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, sessionId, cobrowseSessionId, rating, resolutionSummary }: ChatRequest = await req.json();

    switch (action) {
      case 'start': {
        // Create new chat session
        const { data: session, error: sessionError } = await supabase
          .from('live_chat_sessions')
          .insert({
            user_id: user.id,
            status: 'waiting',
          })
          .select()
          .single();

        if (sessionError) throw sessionError;

        // TODO: Integrate with Supabase Realtime for agent notification
        // Broadcast to agents channel that new session is waiting
        // await supabase.channel('support-agents').send({
        //   type: 'broadcast',
        //   event: 'new_chat_session',
        //   payload: { session_id: session.id, user_id: user.id },
        // });

        return new Response(
          JSON.stringify({
            success: true,
            session,
            message: 'Chat session started. Waiting for agent...',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'enable_cobrowse': {
        if (!sessionId) throw new Error('Session ID required');

        // Generate cobrowse session ID (stub - TODO: integrate with screen-share service)
        const cobrowseId = cobrowseSessionId || `cobrowse-${Date.now()}`;

        const { data: session, error: updateError } = await supabase
          .from('live_chat_sessions')
          .update({
            cobrowse_enabled: true,
            cobrowse_session_id: cobrowseId,
            screen_share_url: `https://cobrowse.example.com/session/${cobrowseId}`,
          })
          .eq('id', sessionId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({
            success: true,
            session,
            cobrowse_url: session.screen_share_url,
            message: 'Co-browsing enabled',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'end': {
        if (!sessionId) throw new Error('Session ID required');

        const { data: session, error: endError } = await supabase
          .from('live_chat_sessions')
          .update({
            status: 'resolved',
            ended_at: new Date().toISOString(),
            resolution_summary: resolutionSummary,
          })
          .eq('id', sessionId)
          .select()
          .single();

        if (endError) throw endError;

        return new Response(
          JSON.stringify({
            success: true,
            session,
            message: 'Chat session ended',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'rate': {
        if (!sessionId || !rating) throw new Error('Session ID and rating required');

        if (rating < 1 || rating > 5) {
          throw new Error('Rating must be between 1 and 5');
        }

        const { data: session, error: rateError } = await supabase
          .from('live_chat_sessions')
          .update({
            user_satisfaction_rating: rating,
          })
          .eq('id', sessionId)
          .select()
          .single();

        if (rateError) throw rateError;

        return new Response(
          JSON.stringify({
            success: true,
            session,
            message: 'Rating submitted. Thank you for your feedback!',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error: any) {
    console.error('Live chat cobrowse error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
