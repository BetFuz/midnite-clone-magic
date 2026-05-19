import { useState } from 'react';
import { userApi } from '@/lib/api/user';
import { toast } from 'sonner';

export const useKycVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [kycStatus, setKycStatus] = useState<any>(null);

  const checkKycStatus = async () => {
    try {
      const data = await userApi.getKycStatus();
      setKycStatus(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch KYC status');
      return null;
    }
  };

  const submitKyc = async (formData: FormData) => {
    setIsVerifying(true);
    try {
      const data = await userApi.submitKyc(formData);
      toast.success('KYC submitted successfully. Verification in progress.');
      setKycStatus(data);
      return { data, error: null };
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'KYC submission failed';
      toast.error(msg);
      return { data: null, error };
    } finally {
      setIsVerifying(false);
    }
  };

  return { isVerifying, kycStatus, checkKycStatus, submitKyc };
};
