import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AdminRole = 'user' | 'admin' | 'superadmin';

export interface UserDetails {
  profile: any;
  roles: AdminRole[];
  recentBets: any[];
  statistics: any;
  totalBets: number;
  totalStaked: number;
}

export const useAdminUserManagement = () => {
  const [loading, setLoading] = useState(false);

  const getUserDetails = async (userId: string): Promise<UserDetails | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'get_user_details', userId },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user details:', error);
      toast.error('Failed to load user details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: AdminRole): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'update_role', userId, role },
      });

      if (error) throw error;
      toast.success(data.message || 'User role updated');
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const suspendUser = async (userId: string, reason: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'suspend', userId, reason },
      });

      if (error) throw error;
      toast.success(data.message || 'User suspended');
      return true;
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsuspendUser = async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'unsuspend', userId },
      });

      if (error) throw error;
      toast.success(data.message || 'User unsuspended');
      return true;
    } catch (error) {
      console.error('Error unsuspending user:', error);
      toast.error('Failed to unsuspend user');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUserBalance = async (userId: string, balance: number): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'update_balance', userId, balance },
      });

      if (error) throw error;
      toast.success(data.message || 'Balance updated');
      return true;
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Failed to update balance');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getUserDetails,
    updateUserRole,
    suspendUser,
    unsuspendUser,
    updateUserBalance,
  };
};