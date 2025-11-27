import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ServerSeed {
  id: string;
  serverSeed: string;
  hashedServerSeed: string;
  clientSeed: string;
  nonce: number;
  revealed: boolean;
}

export interface VerificationResult {
  isValid: boolean;
  gameOutcome: string;
  transparency: string;
  trustScore: number;
}

export const useProvablyFair = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const generateServerSeed = useCallback(async (gameId: string) => {
    setIsGenerating(true);
    try {
      // Generate cryptographic server seed
      const serverSeed = generateRandomSeed();
      const hashedServerSeed = await hashSeed(serverSeed);
      
      const seedData: ServerSeed = {
        id: gameId,
        serverSeed,
        hashedServerSeed,
        clientSeed: '',
        nonce: 0,
        revealed: false
      };

      return seedData;
    } catch (error) {
      console.error('Error generating server seed:', error);
      toast({
        title: 'Seed Generation Failed',
        description: 'Could not generate provably fair seed',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const verifyGameIntegrity = useCallback(async (
    gameId: string,
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    outcome: string
  ): Promise<VerificationResult | null> => {
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-provably-fair', {
        body: {
          action: 'verify',
          gameId,
          serverSeed,
          clientSeed,
          nonce,
          outcome
        }
      });

      if (error) throw error;

      toast({
        title: 'Verification Complete',
        description: data.isValid ? '✓ Game verified as fair' : '⚠️ Verification failed',
      });

      return data;
    } catch (error) {
      console.error('Error verifying game:', error);
      toast({
        title: 'Verification Failed',
        description: 'Could not verify game integrity',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const generateTransparencyReport = useCallback(async (gameHistory: any[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-provably-fair', {
        body: {
          action: 'transparency',
          gameHistory
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating transparency report:', error);
      return null;
    }
  }, []);

  const calculateTrustMetrics = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-provably-fair', {
        body: {
          action: 'trust',
          userId
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calculating trust metrics:', error);
      return null;
    }
  }, []);

  return {
    generateServerSeed,
    verifyGameIntegrity,
    generateTransparencyReport,
    calculateTrustMetrics,
    isGenerating,
    isVerifying
  };
};

// Utility functions for cryptographic operations
function generateRandomSeed(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function hashSeed(seed: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}
