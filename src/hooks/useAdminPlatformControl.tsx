import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';
import { useAdminAuth } from './useAdminAuth';
import { useToast } from '@/hooks/use-toast';

export const useAdminPlatformControl = () => {
  const { isAdmin } = useAdminAuth();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    adminApi.getSystemConfig().then(setConfig).catch(() => setConfig(null)).finally(() => setLoading(false));
  }, [isAdmin]);

  const updateConfig = async (key: string, value: any) => {
    try {
      await adminApi.updateSystemConfig(key, value);
      toast({ title: 'Config updated' });
      const data = await adminApi.getSystemConfig();
      setConfig(data);
    } catch (error: any) {
      toast({ title: 'Failed', description: error?.response?.data?.message, variant: 'destructive' });
    }
  };

  return { config, loading, updateConfig };
};
