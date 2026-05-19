import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';
import { useAdminAuth } from './useAdminAuth';

export const useAdminReports = () => {
  const { isAdmin } = useAdminAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    adminApi.getStats().then(setStats).catch(() => setStats(null)).finally(() => setLoading(false));
  }, [isAdmin]);

  return { stats, loading };
};
