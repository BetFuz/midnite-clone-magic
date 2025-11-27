import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityAlert {
  id: string;
  user_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details: any;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  created_at: string;
}

export const useFraudDetection = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [securityReport, setSecurityReport] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
    
    // Subscribe to new alerts
    const channel = supabase
      .channel('security-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_alerts'
        },
        (payload) => {
          const newAlert = payload.new as SecurityAlert;
          setAlerts(prev => [newAlert, ...prev]);
          
          if (newAlert.severity === 'critical' || newAlert.severity === 'high') {
            toast({
              title: '🚨 Security Alert',
              description: newAlert.description,
              variant: 'destructive',
              duration: 10000
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('security_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching alerts:', error);
      return;
    }

    setAlerts((data as SecurityAlert[]) || []);
  };

  const analyzeBettingPatterns = async (userId: string, bettingData: any) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-fraud-detection', {
        body: {
          action: 'analyze_betting_patterns',
          userId,
          data: bettingData
        }
      });

      if (error) throw error;
      
      return data.analysis;
    } catch (error) {
      console.error('Error analyzing betting patterns:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze betting patterns',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const detectCollusion = async (playerData: any) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-fraud-detection', {
        body: {
          action: 'detect_collusion',
          data: playerData
        }
      });

      if (error) throw error;
      
      return data.analysis;
    } catch (error) {
      console.error('Error detecting collusion:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not detect collusion',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const identifyBots = async (behaviorData: any) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-fraud-detection', {
        body: {
          action: 'identify_bots',
          data: behaviorData
        }
      });

      if (error) throw error;
      
      return data.analysis;
    } catch (error) {
      console.error('Error identifying bots:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not identify bot activity',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const checkMoneyLaundering = async (transactionData: any) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-fraud-detection', {
        body: {
          action: 'check_money_laundering',
          data: transactionData
        }
      });

      if (error) throw error;
      
      return data.analysis;
    } catch (error) {
      console.error('Error checking money laundering:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not check for money laundering',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSecurityReport = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-fraud-detection', {
        body: {
          action: 'generate_report',
          data: alerts
        }
      });

      if (error) throw error;
      
      setSecurityReport(data.report);
      toast({
        title: 'Report Generated',
        description: 'Security report has been generated'
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Report Generation Failed',
        description: 'Could not generate security report',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateAlertStatus = async (alertId: string, status: SecurityAlert['status']) => {
    const { error } = await supabase
      .from('security_alerts')
      .update({ 
        status,
        resolved_at: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : null
      })
      .eq('id', alertId);

    if (error) {
      console.error('Error updating alert:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not update alert status',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Alert Updated',
      description: `Alert marked as ${status}`
    });
    
    fetchAlerts();
  };

  return {
    alerts,
    isAnalyzing,
    securityReport,
    analyzeBettingPatterns,
    detectCollusion,
    identifyBots,
    checkMoneyLaundering,
    generateSecurityReport,
    updateAlertStatus,
    refreshAlerts: fetchAlerts
  };
};
