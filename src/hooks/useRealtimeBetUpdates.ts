import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BetUpdate {
  type: 'bet.updated' | 'bet.settled' | 'selection.updated' | 'cashout.offered' | 'cashout.success' | 'cashout.error';
  data?: any;
  betSlipId?: string;
  status?: string;
  cashoutOffer?: number;
  originalStake?: number;
  potentialWin?: number;
  expiresIn?: number;
  timestamp?: string;
  error?: string;
}

interface CashoutOffer {
  betSlipId: string;
  cashoutOffer: number;
  originalStake: number;
  potentialWin: number;
  expiresAt: Date;
}

export const useRealtimeBetUpdates = () => {
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<BetUpdate | null>(null);
  const [cashoutOffers, setCashoutOffers] = useState<Map<string, CashoutOffer>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  const connect = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No session token available');
        return;
      }

      // Use the full WebSocket URL - replace with your actual project ref
      const projectRef = 'aacjfdrctnmnenebzdxg';
      const wsUrl = `wss://${projectRef}.supabase.co/functions/v1/bet-socket-gateway`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl, ['websocket']);
      wsRef.current = ws;

      // Send auth token after connection
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        
        // Send authorization
        ws.send(JSON.stringify({
          type: 'auth',
          token: session.access_token
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: BetUpdate = JSON.parse(event.data);
          console.log('Received message:', message);
          
          setLastUpdate(message);

          switch (message.type) {
            case 'bet.settled':
              toast({
                title: message.status === 'won' ? '🎉 Bet Won!' : 'Bet Settled',
                description: message.status === 'won' 
                  ? `Congratulations! You won ₦${message.data?.potential_win?.toLocaleString()}`
                  : 'Your bet has been settled',
              });
              break;

            case 'cashout.offered':
              // Store cashout offer
              if (message.betSlipId && message.cashoutOffer) {
                const expiresAt = new Date(Date.now() + (message.expiresIn || 30000));
                setCashoutOffers(prev => new Map(prev).set(message.betSlipId!, {
                  betSlipId: message.betSlipId!,
                  cashoutOffer: message.cashoutOffer!,
                  originalStake: message.originalStake!,
                  potentialWin: message.potentialWin!,
                  expiresAt
                }));

                toast({
                  title: '💰 Cashout Available',
                  description: `Cashout offer: ₦${message.cashoutOffer.toLocaleString()}`,
                });
              }
              break;

            case 'cashout.success':
              setCashoutOffers(prev => {
                const newMap = new Map(prev);
                newMap.delete(message.betSlipId!);
                return newMap;
              });
              
              toast({
                title: '✅ Cashout Successful',
                description: `₦${message.data?.cashoutAmount?.toLocaleString()} credited to your account`,
              });
              break;

            case 'cashout.error':
              toast({
                title: 'Cashout Failed',
                description: message.error || 'Failed to process cashout',
                variant: 'destructive',
              });
              break;

            case 'selection.updated':
              // Selection odds or status changed
              console.log('Selection updated:', message.data);
              break;
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        
        // Attempt reconnection after 5 seconds
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            connect();
          }
        }, 5000);
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setConnected(false);
    }
  }, [toast]);

  const requestCashout = useCallback((betSlipId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'cashout.request',
        betSlipId
      }));
    } else {
      toast({
        title: 'Connection Error',
        description: 'Not connected to live updates',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const acceptCashout = useCallback((betSlipId: string, cashoutOffer: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'cashout.accept',
        betSlipId,
        cashoutOffer
      }));
    } else {
      toast({
        title: 'Connection Error',
        description: 'Not connected to live updates',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Clean up expired cashout offers
  useEffect(() => {
    const interval = setInterval(() => {
      setCashoutOffers(prev => {
        const newMap = new Map(prev);
        const now = new Date();
        
        for (const [betSlipId, offer] of newMap.entries()) {
          if (offer.expiresAt < now) {
            newMap.delete(betSlipId);
          }
        }
        
        return newMap;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    connected,
    lastUpdate,
    cashoutOffers,
    requestCashout,
    acceptCashout,
    reconnect: connect
  };
};
