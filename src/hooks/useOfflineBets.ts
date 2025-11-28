import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface QueuedBet {
  id: string;
  stake: number;
  selections: any[];
  timestamp: number;
  retryCount: number;
  affiliateId?: string;
}

const RETRY_INTERVAL = 30000; // 30 seconds
const MAX_RETRIES = 10;

export function useOfflineBets() {
  const [pendingBets, setPendingBets] = useState<QueuedBet[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isOnline } = useNetworkStatus();
  const { toast } = useToast();
  const retryTimerRef = useRef<NodeJS.Timeout>();

  // Load queued bets from IndexedDB on mount
  useEffect(() => {
    loadQueuedBets();
  }, []);

  // Setup retry timer when online
  useEffect(() => {
    if (isOnline && pendingBets.length > 0) {
      startRetryTimer();
    } else {
      stopRetryTimer();
    }

    return () => stopRetryTimer();
  }, [isOnline, pendingBets.length]);

  // Queue a bet when offline
  const queueBet = useCallback(async (stake: number, selections: any[], affiliateId?: string) => {
    const bet: QueuedBet = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stake,
      selections,
      timestamp: Date.now(),
      retryCount: 0,
      affiliateId,
    };

    await saveBetToIndexedDB(bet);
    setPendingBets(prev => [...prev, bet]);

    toast({
      title: "Bet Queued Offline",
      description: "Your bet will be placed when connection is restored.",
    });

    // Vibrate if available (PWA Vibration API)
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }

    return bet.id;
  }, [toast]);

  // Process queued bets
  const processQueue = useCallback(async () => {
    if (!isOnline || pendingBets.length === 0 || isProcessing) return;

    setIsProcessing(true);

    for (const bet of pendingBets) {
      try {
        // Attempt to place bet via edge function
        const { data, error } = await supabase.functions.invoke('create-bet', {
          body: {
            stake: bet.stake,
            selections: bet.selections,
            affiliateId: bet.affiliateId,
            offlineBetId: bet.id,
          },
        });

        if (error) throw error;

        // Success - remove from queue
        await removeBetFromIndexedDB(bet.id);
        setPendingBets(prev => prev.filter(b => b.id !== bet.id));

        toast({
          title: "Bet Placed Successfully",
          description: `Offline bet of ₦${bet.stake.toLocaleString()} has been placed.`,
        });

        // Vibrate on success
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      } catch (error: any) {
        console.error('Failed to process queued bet:', error);

        // Increment retry count
        const updatedBet = { ...bet, retryCount: bet.retryCount + 1 };

        if (updatedBet.retryCount >= MAX_RETRIES) {
          // Max retries reached - remove from queue
          await removeBetFromIndexedDB(bet.id);
          setPendingBets(prev => prev.filter(b => b.id !== bet.id));

          toast({
            title: "Bet Failed",
            description: "Unable to place bet after multiple attempts.",
            variant: "destructive",
          });
        } else {
          // Update retry count
          await saveBetToIndexedDB(updatedBet);
          setPendingBets(prev =>
            prev.map(b => (b.id === bet.id ? updatedBet : b))
          );
        }
      }
    }

    setIsProcessing(false);
  }, [isOnline, pendingBets, isProcessing, toast]);

  // Start retry timer
  const startRetryTimer = useCallback(() => {
    stopRetryTimer();
    retryTimerRef.current = setInterval(() => {
      processQueue();
    }, RETRY_INTERVAL);
  }, [processQueue]);

  // Stop retry timer
  const stopRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearInterval(retryTimerRef.current);
      retryTimerRef.current = undefined;
    }
  }, []);

  // Manual retry trigger
  const retryNow = useCallback(() => {
    processQueue();
  }, [processQueue]);

  return {
    pendingBets,
    queueBet,
    retryNow,
    isProcessing,
    hasPendingBets: pendingBets.length > 0,
  };
}

// IndexedDB helpers
async function openBetsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('betfuz-offline-bets', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('bets')) {
        const store = db.createObjectStore('bets', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function saveBetToIndexedDB(bet: QueuedBet): Promise<void> {
  const db = await openBetsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('bets', 'readwrite');
    tx.objectStore('bets').put(bet);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function removeBetFromIndexedDB(id: string): Promise<void> {
  const db = await openBetsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('bets', 'readwrite');
    tx.objectStore('bets').delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadQueuedBets(): Promise<QueuedBet[]> {
  try {
    const db = await openBetsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('bets', 'readonly');
      const store = tx.objectStore('bets');
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to load queued bets:', error);
    return [];
  }
}
