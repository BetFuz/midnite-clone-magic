import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { userApi } from "@/lib/api/user";

export interface UserStatistics {
  totalBets: number; totalWins: number; totalLosses: number; totalPending: number;
  totalStaked: number; totalReturns: number; profitLoss: number; winRate: number;
  roi: number; favoriteSport: string | null; biggestWin: number; biggestLoss: number;
  currentStreak: number; bestStreak: number;
}

export const useUserStatistics = () => {
  const { user } = useAuthStore();
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    userApi.getStats().then(d => {
      setStatistics({
        totalBets: d.totalBets ?? 0, totalWins: d.totalWins ?? 0, totalLosses: d.totalLosses ?? 0,
        totalPending: d.totalPending ?? 0, totalStaked: Number(d.totalStaked ?? 0),
        totalReturns: Number(d.totalReturns ?? 0), profitLoss: Number(d.profitLoss ?? 0),
        winRate: Number(d.winRate ?? 0), roi: Number(d.roi ?? 0),
        favoriteSport: d.favoriteSport ?? null, biggestWin: Number(d.biggestWin ?? 0),
        biggestLoss: Number(d.biggestLoss ?? 0), currentStreak: d.currentStreak ?? 0,
        bestStreak: d.bestStreak ?? 0,
      });
    }).catch(() => setStatistics(null)).finally(() => setIsLoading(false));
  }, [user?.id]);

  return { statistics, isLoading };
};
