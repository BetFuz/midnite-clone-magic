import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const authHeader = headers.get("authorization");
  if (!authHeader) {
    return new Response("Missing authorization", { status: 401 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const supabase = createServiceClient();

  // Verify user
  let userId: string | null = null;
  
  socket.onopen = async () => {
    console.log("WebSocket connection opened");
    
    // Extract token and verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error("Auth error:", error);
      socket.send(JSON.stringify({ 
        type: "error", 
        message: "Authentication failed" 
      }));
      socket.close();
      return;
    }
    
    userId = user.id;
    console.log("User authenticated:", userId);
    
    // Send connection confirmation
    socket.send(JSON.stringify({ 
      type: "connected", 
      userId 
    }));

    // Subscribe to bet_slips changes for this user
    const channel = supabase
      .channel(`bet_updates:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bet_slips',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log("Bet slip change detected:", payload);
          
          const newData = payload.new as any;
          
          socket.send(JSON.stringify({
            type: "bet.updated",
            event: payload.eventType,
            data: newData || payload.old
          }));

          // If bet was settled, send settlement event
          if (newData?.status === 'won' || newData?.status === 'lost') {
            socket.send(JSON.stringify({
              type: "bet.settled",
              betSlipId: newData.id,
              status: newData.status,
              potentialWin: newData.potential_win,
              settledAt: newData.settled_at
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bet_selections',
          filter: `bet_slip_id=in.(SELECT id FROM bet_slips WHERE user_id = '${userId}')`
        },
        (payload) => {
          console.log("Bet selection change detected:", payload);
          
          socket.send(JSON.stringify({
            type: "selection.updated",
            event: payload.eventType,
            data: payload.new || payload.old
          }));
        }
      )
      .subscribe();

    // Listen for cashout requests
    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received message:", message);

        if (message.type === "cashout.request") {
          const { betSlipId } = message;

          // Get current bet slip
          const { data: betSlip, error: betError } = await supabase
            .from('bet_slips')
            .select('*, bet_selections(*)')
            .eq('id', betSlipId)
            .eq('user_id', userId)
            .single();

          if (betError || !betSlip) {
            socket.send(JSON.stringify({
              type: "cashout.error",
              betSlipId,
              error: "Bet not found"
            }));
            return;
          }

          // Calculate cashout offer based on current odds and bet status
          // This is simplified - real implementation would use live odds
          const currentValue = betSlip.total_stake * 0.7; // 70% of stake as cashout
          const cashoutOffer = Math.min(currentValue, betSlip.potential_win * 0.8);

          socket.send(JSON.stringify({
            type: "cashout.offered",
            betSlipId,
            originalStake: betSlip.total_stake,
            potentialWin: betSlip.potential_win,
            cashoutOffer: cashoutOffer,
            expiresIn: 30000, // 30 seconds
            timestamp: new Date().toISOString()
          }));
        }

        if (message.type === "cashout.accept") {
          const { betSlipId, cashoutOffer } = message;

          // Process cashout
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', userId)
            .single();

          if (profileError || !profile) {
            socket.send(JSON.stringify({
              type: "cashout.error",
              betSlipId,
              error: "Profile not found"
            }));
            return;
          }

          // Update bet status to cashed out
          const { error: updateError } = await supabase
            .from('bet_slips')
            .update({ 
              status: 'cashed_out',
              settled_at: new Date().toISOString()
            })
            .eq('id', betSlipId)
            .eq('user_id', userId);

          if (updateError) {
            socket.send(JSON.stringify({
              type: "cashout.error",
              betSlipId,
              error: "Failed to update bet"
            }));
            return;
          }

          // Credit user balance
          const { error: balanceError } = await supabase
            .from('profiles')
            .update({ balance: profile.balance + cashoutOffer })
            .eq('id', userId);

          if (balanceError) {
            socket.send(JSON.stringify({
              type: "cashout.error",
              betSlipId,
              error: "Failed to update balance"
            }));
            return;
          }

          socket.send(JSON.stringify({
            type: "cashout.success",
            betSlipId,
            cashoutAmount: cashoutOffer,
            newBalance: profile.balance + cashoutOffer,
            timestamp: new Date().toISOString()
          }));
        }

        if (message.type === "ping") {
          socket.send(JSON.stringify({ type: "pong" }));
        }
      } catch (error) {
        console.error("Error processing message:", error);
        socket.send(JSON.stringify({
          type: "error",
          message: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed for user:", userId);
  };

  return response;
});
