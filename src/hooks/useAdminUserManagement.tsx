import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';
import { useAdminAuth } from './useAdminAuth';
import { useToast } from '@/hooks/use-toast';

export const useAdminUserManagement = () => {
  const { isAdmin } = useAdminAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async (params?: any) => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const data = await adminApi.getUsers(params);
      setUsers(data?.users || data || []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [isAdmin]);

  const suspendUser = async (id: string, reason: string) => {
    try {
      await adminApi.suspendUser(id, reason);
      toast({ title: 'User suspended' });
      await fetchUsers();
    } catch (error: any) {
      toast({ title: 'Failed', description: error?.response?.data?.message, variant: 'destructive' });
    }
  };

  const unsuspendUser = async (id: string) => {
    try {
      await adminApi.unsuspendUser(id);
      toast({ title: 'User unsuspended' });
      await fetchUsers();
    } catch (error: any) {
      toast({ title: 'Failed', description: error?.response?.data?.message, variant: 'destructive' });
    }
  };

  return { users, loading, fetchUsers, suspendUser, unsuspendUser };
};
