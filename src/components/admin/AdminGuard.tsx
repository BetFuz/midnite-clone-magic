import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const role = user?.role?.toLowerCase();
    if (!user || (role !== 'admin' && role !== 'superadmin' && role !== 'super_admin')) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, navigate]);

  const role = user?.role?.toLowerCase();
  if (!user || (role !== 'admin' && role !== 'superadmin' && role !== 'super_admin')) return null;

  return <>{children}</>;
};
