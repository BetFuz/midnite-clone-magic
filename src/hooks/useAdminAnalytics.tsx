import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';
import { useAdminAuth } from './useAdminAuth';

export const useAdminAnalytics = () => {
  const { isAdmin } = useAdminAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    adminApi.getStats().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [isAdmin]);

  return { data, loading };
};
