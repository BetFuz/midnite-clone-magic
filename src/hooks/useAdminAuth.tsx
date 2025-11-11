import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export type AdminRole = 'user' | 'admin' | 'superadmin';

interface AdminAuthState {
  user: User | null;
  role: AdminRole | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export const useAdminAuth = () => {
  const [authState, setAuthState] = useState<AdminAuthState>({
    user: null,
    role: null,
    isAdmin: false,
    isSuperAdmin: false,
    loading: true,
    error: null,
  });

  const checkUserRole = async (userId: string): Promise<AdminRole | null> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .in("role", ["admin", "superadmin"])
        .single();

      if (error) {
        // User might not have admin role, which is not an error
        if (error.code === 'PGRST116') {
          return 'user';
        }
        console.error("Error checking user role:", error);
        return null;
      }

      return data?.role as AdminRole || 'user';
    } catch (error) {
      console.error("Error in checkUserRole:", error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (session?.user) {
          const role = await checkUserRole(session.user.id);
          setAuthState({
            user: session.user,
            role,
            isAdmin: role === 'admin' || role === 'superadmin',
            isSuperAdmin: role === 'superadmin',
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            role: null,
            isAdmin: false,
            isSuperAdmin: false,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuthState({
          user: null,
          role: null,
          isAdmin: false,
          isSuperAdmin: false,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication error',
        });
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const role = await checkUserRole(session.user.id);
          setAuthState({
            user: session.user,
            role,
            isAdmin: role === 'admin' || role === 'superadmin',
            isSuperAdmin: role === 'superadmin',
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            role: null,
            isAdmin: false,
            isSuperAdmin: false,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return authState;
};
