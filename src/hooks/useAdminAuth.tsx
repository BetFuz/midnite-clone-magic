import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";

export type AdminRole = 'user' | 'admin' | 'superadmin';

interface AdminAuthState {
  user: any;
  role: AdminRole | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export const useAdminAuth = (): AdminAuthState => {
  const { user, isLoading } = useAuthStore();

  return useMemo(() => {
    if (!user) {
      return { user: null, role: null, isAdmin: false, isSuperAdmin: false, loading: isLoading, error: null };
    }
    const role = ((user.role as string)?.toLowerCase() as AdminRole) || 'user';
    return {
      user: { id: user.id, email: user.email },
      role,
      isAdmin: role === 'admin' || role === 'superadmin',
      isSuperAdmin: role === 'superadmin',
      loading: false,
      error: null,
    };
  }, [user, isLoading]);
};
