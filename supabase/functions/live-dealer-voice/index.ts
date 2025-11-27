import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

Deno.serve(async (req) => {
  // Handle WebSocket upgrade
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    let openaiWs: WebSocket | null = null;

    socket.onopen = async () => {
      console.log('Client connected');
      
      try {
        // Connect to OpenAI Realtime API
        const url = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17';
        openaiWs = new WebSocket(url, {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'realtime=v1'
          }
        });

        openaiWs.onopen = () => {
          console.log('Connected to OpenAI');
        };

        openaiWs.onmessage = (event) => {
          // Forward OpenAI messages to client
          try {
            socket.send(event.data);
          } catch (error) {
            console.error('Error forwarding to client:', error);
          }
        };

        openaiWs.onerror = (error) => {
          console.error('OpenAI WebSocket error:', error);
        };

        openaiWs.onclose = () => {
          console.log('OpenAI connection closed');
          socket.close();
        };

      } catch (error) {
        console.error('Error connecting to OpenAI:', error);
        socket.close();
      }
    };

    socket.onmessage = (event) => {
      // Forward client messages to OpenAI
      if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
        try {
          openaiWs.send(event.data);
        } catch (error) {
          console.error('Error forwarding to OpenAI:', error);
        }
      }
    };

    socket.onerror = (error) => {
      console.error('Client WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('Client disconnected');
      if (openaiWs) {
        openaiWs.close();
      }
    };

    return response;
  }

  // Return error for non-WebSocket requests
  return new Response('WebSocket endpoint', { status: 400 });
});
