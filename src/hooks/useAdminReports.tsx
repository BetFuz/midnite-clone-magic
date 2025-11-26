import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ReportType = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface FinancialReport {
  period: {
    type: ReportType;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalBets: number;
    totalStaked: number;
    totalWonAmount: number;
    totalLostAmount: number;
    pendingAmount: number;
    platformProfit: number;
    platformMargin: string;
    newUsers: number;
  };
  bets: {
    won: number;
    lost: number;
    pending: number;
    winRate: string;
  };
  topUsers: Array<{
    email: string;
    totalStaked: number;
  }>;
  sportDistribution: Record<string, number>;
  dailyStats: Record<string, any>;
  generatedAt: string;
  generatedBy: string;
}

export const useAdminReports = () => {
  const [loading, setLoading] = useState(false);

  const generateFinancialReport = async (
    reportType: ReportType,
    startDate?: string,
    endDate?: string
  ): Promise<FinancialReport | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-financial-reports', {
        body: { reportType, startDate, endDate },
      });

      if (error) throw error;
      toast.success('Financial report generated');
      return data;
    } catch (error) {
      console.error('Error generating financial report:', error);
      toast.error('Failed to generate report');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateFinancialReport,
  };
};