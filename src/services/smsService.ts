import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

/**
 * Send SMS with automatic retry logic (max 1 retry)
 * Falls back to in-app push notification after retry limit is exceeded
 * 
 * Cost control: Only retries once to prevent ₦100k/day burn on failed deliveries
 */
export const sendSMS = async (params: SendSMSParams): Promise<SMSResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke<SMSResponse>('send-sms', {
      body: params,
    });

    if (error) {
      console.error('SMS service error:', error);
      throw error;
    }

    if (data?.fallback) {
      toast.info('SMS delivery failed. Notification sent via app instead.');
    } else if (data?.retry) {
      toast.warning('SMS delivery in progress. Retrying...');
    } else if (data?.success) {
      toast.success('SMS sent successfully');
    }

    return data as SMSResponse;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    toast.error('Failed to send SMS notification');
    throw error;
  }
};

/**
 * Get SMS delivery logs for a user
 */
export const getSMSLogs = async (userId: string) => {
  const { data, error } = await supabase
    .from('sms_delivery_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch SMS logs:', error);
    throw error;
  }

  return data;
};

/**
 * Get SMS delivery statistics
 */
export const getSMSStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('sms_delivery_log')
    .select('status')
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to fetch SMS stats:', error);
    throw error;
  }

  const total = data.length;
  const sent = data.filter(log => log.status === 'sent').length;
  const failed = data.filter(log => log.status === 'failed').length;
  const fallback = data.filter(log => log.status === 'fallback_push').length;

  return {
    total,
    sent,
    failed,
    fallback,
    successRate: total > 0 ? (sent / total) * 100 : 0,
  };
};
