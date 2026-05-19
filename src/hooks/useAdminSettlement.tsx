import { useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import { useToast } from '@/hooks/use-toast';

export const useAdminSettlement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const settleBet = async (id: string, outcome: string) => {
    setLoading(true);
    try {
      const data = await adminApi.settleBet(id, outcome);
      toast({ title: 'Bet settled', description: `Bet ${id} settled as ${outcome}` });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Settlement failed', description: error?.response?.data?.message || 'Failed', variant: 'destructive' });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return { settleBet, loading };
};
