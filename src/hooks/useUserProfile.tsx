import { useState, useEffect, useCallback } from "react";
import { useAuthStore, BetFuzUser } from "@/store/authStore";
import { userApi } from "@/lib/api/user";
import { walletApi } from "@/lib/api/wallet";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  balance: number;
  currency_code: string;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user: authUser, setUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!authUser) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const [profileData, walletData] = await Promise.allSettled([
        userApi.getProfile(),
        walletApi.getBalance(),
      ]);

      const p = profileData.status === "fulfilled" ? profileData.value : null;
      const w = walletData.status === "fulfilled" ? walletData.value : null;

      if (p) {
        setUser({ ...authUser, ...p });
        setProfile({
          id: p.id || authUser.id,
          email: p.email || authUser.email,
          full_name: `${p.firstName || authUser.firstName} ${p.lastName || authUser.lastName}`.trim() || null,
          phone: p.phone || null,
          balance: w?.balance ?? 0,
          currency_code: w?.currency || "NGN",
          created_at: p.createdAt || "",
          updated_at: p.updatedAt || "",
        });
      }
    } catch {
      // silently ignore — user stays logged in even if profile fails
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // map BetFuzUser as a Supabase-compatible "user" shape so callers don't break
  const supabaseCompatUser = authUser
    ? { id: authUser.id, email: authUser.email }
    : null;

  return {
    user: supabaseCompatUser as any,
    profile,
    loading,
    refreshProfile: fetchProfile,
  };
};
