import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { walletApi } from '@/lib/api/wallet';

interface BalanceUpdate {
  old_balance: number;
  new_balance: number;
  change: number;
  reason: string;
  timestamp: string;
}

export const useRealtimeBalance = () => {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [balanceUpdates, setBalanceUpdates] = useState<BalanceUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!user) return;
    try {
      const data = await walletApi.getBalance();
      setBalance(prev => {
        if (prev !== 0 && data.balance !== prev) {
          setBalanceUpdates(arr => [...arr.slice(-9), {
            old_balance: prev,
            new_balance: data.balance,
            change: data.balance - prev,
            reason: 'Balance update',
            timestamp: new Date().toISOString(),
          }]);
        }
        return data.balance;
      });
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, [user?.id, fetchBalance]);

  const profile = { balance };
  const refreshProfile = fetchBalance;

  return {
    currentBalance: balance,
    balanceUpdates,
    isConnected,
    clearUpdates: () => setBalanceUpdates([]),
    user: user ? { id: user.id, email: user.email } : null,
    profile,
    refreshProfile,
  };
};
