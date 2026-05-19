import { useState, useEffect } from 'react';
import { walletApi } from '@/lib/api/wallet';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';

export const useWallet = () => {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const { toast } = useToast();

  const fetchBalance = async () => {
    if (!user) return;
    setIsLoadingBalance(true);
    try {
      const data = await walletApi.getBalance();
      setBalance(data.balance ?? 0);
    } catch {
      // ignore
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user?.id]);

  const deposit = async (amount: number, method?: string, phone?: string) => {
    setIsDepositing(true);
    try {
      const data = await walletApi.initiateDeposit({ amount, method: method || 'flutterwave', phone });
      toast({
        title: "Deposit Initiated",
        description: `Your deposit of ₦${amount.toLocaleString()} is being processed.`,
      });
      if (data?.paymentLink) {
        window.open(data.paymentLink, '_blank');
      }
      return { data, error: null };
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to initiate deposit";
      toast({ title: "Deposit Failed", description: msg, variant: "destructive" });
      return { data: null, error };
    } finally {
      setIsDepositing(false);
    }
  };

  const withdraw = async (amount: number, method: string, accountDetails?: object) => {
    setIsWithdrawing(true);
    try {
      const data = await walletApi.initiateWithdrawal({ amount, method, ...accountDetails });
      toast({
        title: "Withdrawal Requested",
        description: `Your withdrawal of ₦${amount.toLocaleString()} is being processed.`,
      });
      await fetchBalance();
      return { data, error: null };
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to request withdrawal";
      toast({ title: "Withdrawal Failed", description: msg, variant: "destructive" });
      return { data: null, error };
    } finally {
      setIsWithdrawing(false);
    }
  };

  return {
    balance,
    deposit,
    withdraw,
    fetchBalance,
    isDepositing,
    isWithdrawing,
    isLoadingBalance,
  };
};
