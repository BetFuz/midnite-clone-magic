import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { casinoApi } from '@/lib/api/casino';
import { walletApi } from '@/lib/api/wallet';
import { toast } from '@/hooks/use-toast';

const DEMO_BALANCE = 50_000;

export const useCasinoBalance = () => {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState(DEMO_BALANCE);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!user) { setBalance(DEMO_BALANCE); return; }
    try {
      const data = await walletApi.getBalance();
      setBalance(parseFloat(data.cashBalance ?? data.balance ?? 0));
    } catch {
      // keep local balance
    }
  }, [user?.id]);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  // Returns new balance, throws on insufficient funds
  const playRound = useCallback(async (game: string, stake: number, payout: number): Promise<number> => {
    if (!user) {
      // Demo mode — local only
      if (stake > balance) throw new Error('Insufficient balance');
      const newBal = balance - stake + payout;
      setBalance(newBal);
      return newBal;
    }

    setIsLoading(true);
    try {
      const result = await casinoApi.playRound({ game, stake, payout });
      setBalance(result.balance);
      return result.balance;
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Game error';
      toast({ title: 'Game Error', description: msg, variant: 'destructive' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, balance]);

  return { balance, setBalance, playRound, fetchBalance, isLoading };
};
