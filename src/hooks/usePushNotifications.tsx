import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PushNotificationState {
  token: string | null;
  notifications: PushNotificationSchema[];
  isRegistered: boolean;
  error: string | null;
}

export const usePushNotifications = (userId?: string) => {
  const [state, setState] = useState<PushNotificationState>({
    token: null,
    notifications: [],
    isRegistered: false,
    error: null
  });
  const { toast } = useToast();

  useEffect(() => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const registerPush = async () => {
      try {
        // Request permission
        const permStatus = await PushNotifications.requestPermissions();
        
        if (permStatus.receive === 'granted') {
          await PushNotifications.register();
        } else {
          setState(prev => ({ ...prev, error: 'Push notification permission denied' }));
        }
      } catch (error) {
        console.error('Push registration error:', error);
        setState(prev => ({ ...prev, error: String(error) }));
      }
    };

    // Registration success listener
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration success, token:', token.value);
      setState(prev => ({ ...prev, token: token.value, isRegistered: true }));
      
      // Save token to database if user is logged in
      if (userId) {
        try {
          await supabase
            .from('profiles')
            .update({ push_token: token.value })
            .eq('id', userId);
        } catch (error) {
          console.error('Failed to save push token:', error);
        }
      }
    });

    // Registration error listener
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
      setState(prev => ({ ...prev, error: error.error }));
    });

    // Foreground notification listener
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received:', notification);
      setState(prev => ({
        ...prev,
        notifications: [...prev.notifications, notification]
      }));
      
      toast({
        title: notification.title || 'Betfuz',
        description: notification.body || 'You have a new notification'
      });
    });

    // Notification action listener (when user taps notification)
    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Push notification action performed:', action);
      // Handle deep linking based on notification data
      const data = action.notification.data;
      if (data?.route) {
        window.location.href = data.route;
      }
    });

    registerPush();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [userId, toast]);

  const clearNotifications = () => {
    setState(prev => ({ ...prev, notifications: [] }));
  };

  return { ...state, clearNotifications };
};
