import { useState, useEffect } from 'react';
import { userApi } from '@/lib/api/user';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export const useGamingLimits = () => {
  const { user } = useAuthStore();
  const [limits, setLimits]         = useState<any[]>([]);
  const [exclusions, setExclusions] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [updating, setUpdating]     = useState(false);

  const fetchLimits = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const data = await userApi.getRgLimits();
      setLimits(data?.limits ?? []);
      setExclusions(data?.exclusions ?? []);
    } catch {
      setLimits([]);
      setExclusions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLimits(); }, [user?.id]);

  const setLimit = async (type: string, amount: number, periodDays: number) => {
    setUpdating(true);
    try {
      await userApi.setRgLimit({ type, amount, periodDays });
      toast.success('Limit updated');
      await fetchLimits();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const selfExclude = async (type: string, days?: number, reason?: string) => {
    setUpdating(true);
    try {
      await userApi.selfExclude({ type, days, reason });
      toast.success(type === 'PERMANENT' ? 'Account self-excluded permanently' : `Self-exclusion set for ${days} days`);
      await fetchLimits();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? 'Self-exclusion failed');
    } finally {
      setUpdating(false);
    }
  };

  const getLimitByType = (type: string) => limits.find(l => l.type === type);
  const isExcluded = exclusions.some(e => e.isActive && (!e.endDate || new Date(e.endDate) > new Date()));

  return { limits, exclusions, loading, updating, setLimit, selfExclude, getLimitByType, isExcluded, fetchLimits };
};
