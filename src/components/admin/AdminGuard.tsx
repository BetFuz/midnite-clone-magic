import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Shield } from "lucide-react";

interface AdminGuardProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
}

export const AdminGuard = ({ children, requireSuperAdmin = false }: AdminGuardProps) => {
  const { user, isAdmin, isSuperAdmin, loading, error } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [loading, user, navigate]);

  // Show minimal loading without blocking
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Shield className="w-8 h-8 animate-pulse text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Super Admin access required. You do not have sufficient privileges to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Admin access required. You do not have privileges to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};
