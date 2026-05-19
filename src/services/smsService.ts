import { toast } from "sonner";
import { api } from "@/lib/api/client";

export interface SendSMSParams {
  userId: string;
  phoneNumber: string;
  message: string;
}

export interface SMSResponse {
  success: boolean;
  fallback?: boolean;
  retry?: boolean;
  message: string;
  logId?: string;
}

export const sendSMS = async (params: SendSMSParams): Promise<SMSResponse> => {
  try {
    const res = await api.post('/user/sms/send', params);
    const data: SMSResponse = res.data?.data ?? { success: true, message: 'SMS sent' };

    if (data.fallback) {
      toast.info('SMS delivery failed. Notification sent via app instead.');
    } else if (data.retry) {
      toast.warning('SMS delivery in progress. Retrying...');
    } else if (data.success) {
      toast.success('SMS sent successfully');
    }

    return data;
  } catch (error: any) {
    console.error('Failed to send SMS:', error);
    toast.error('Failed to send SMS notification');
    return { success: false, fallback: true, message: error.message || 'SMS failed' };
  }
};

export const getSMSLogs = async (userId: string) => {
  try {
    const res = await api.get(`/user/sms/logs`, { params: { userId } });
    return res.data?.data ?? [];
  } catch (error) {
    console.error('Failed to fetch SMS logs:', error);
    return [];
  }
};

export const getSMSStats = async (userId: string) => {
  try {
    const res = await api.get(`/user/sms/stats`, { params: { userId } });
    return res.data?.data ?? { total: 0, sent: 0, failed: 0, fallback: 0, successRate: 0 };
  } catch (error) {
    console.error('Failed to fetch SMS stats:', error);
    return { total: 0, sent: 0, failed: 0, fallback: 0, successRate: 0 };
  }
};
