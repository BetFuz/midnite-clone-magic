import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface KycVerification {
  id: string;
  user_id: string;
  nin: string;
  selfie_url: string;
  verification_status: 'pending' | 'verified' | 'failed' | 'expired';
  provider: 'youverify' | 'nibss';
  verification_score: number | null;
  verified_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export const useKycVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [kycStatus, setKycStatus] = useState<KycVerification | null>(null);

  const checkKycStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setKycStatus(data as KycVerification);
      return data as KycVerification;
    } catch (error) {
      console.error('Error checking KYC status:', error);
      return null;
    }
  };

  const verifyKyc = async (nin: string, selfieUrl: string, provider: 'youverify' | 'nibss' = 'youverify') => {
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('kyc-verification', {
        body: {
          nin,
          selfieUrl,
          provider,
        },
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast.success('KYC verification successful!');
        setKycStatus(data.verification);
        return { success: true, verification: data.verification };
      } else {
        toast.error(data.message || 'KYC verification failed');
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      console.error('Error verifying KYC:', error);
      toast.error('Failed to verify KYC. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setIsVerifying(false);
    }
  };

  const canWithdraw = async (amount: number): Promise<{ allowed: boolean; reason?: string }> => {
    // If withdrawal is under ₦50,000, no KYC required
    if (amount < 50000) {
      return { allowed: true };
    }

    const status = await checkKycStatus();

    if (!status) {
      return {
        allowed: false,
        reason: 'KYC verification required for withdrawals above ₦50,000',
      };
    }

    if (status.verification_status !== 'verified') {
      return {
        allowed: false,
        reason: 'Your KYC verification is not approved. Please complete verification.',
      };
    }

    // Check if KYC has expired
    if (status.expires_at && new Date(status.expires_at) < new Date()) {
      return {
        allowed: false,
        reason: 'Your KYC verification has expired. Please re-verify.',
      };
    }

    return { allowed: true };
  };

  return {
    isVerifying,
    kycStatus,
    verifyKyc,
    checkKycStatus,
    canWithdraw,
  };
};
