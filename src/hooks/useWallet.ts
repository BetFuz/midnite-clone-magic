import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWallet = () => {
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { toast } = useToast();

  const deposit = async (amount: number) => {
    setIsDepositing(true);
    try {
      const { data, error } = await supabase.functions.invoke('deposit', {
        body: { amount }
      });

      if (error) throw error;

      toast({
        title: "Deposit Initiated",
        description: `Deposit of ₦${amount.toLocaleString()} is being processed.`,
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error initiating deposit:', error);
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to initiate deposit",
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setIsDepositing(false);
    }
  };

  const withdraw = async (amount: number, method: string) => {
    setIsWithdrawing(true);
    try {
      const { data, error } = await supabase.functions.invoke('withdraw', {
        body: { amount, method }
      });

      if (error) throw error;

      toast({
        title: "Withdrawal Requested",
        description: `Your withdrawal of ₦${amount.toLocaleString()} is being processed.`,
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error requesting withdrawal:', error);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to request withdrawal",
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setIsWithdrawing(false);
    }
  };

  return {
    deposit,
    withdraw,
    isDepositing,
    isWithdrawing
  };
};
