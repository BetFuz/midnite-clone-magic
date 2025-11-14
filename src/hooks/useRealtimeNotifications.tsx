import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RealtimeNotification {
  type: string;
  title: string;
  message: string;
  extra?: any;
  timestamp: string;
}

export const useRealtimeNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Listen to user-specific channel for notifications
  useEffect(() => {
    if (!userId) return;

    console.log('Setting up realtime notifications channel for user:', userId);

    const channel = supabase
      .channel(`user:${userId}`)
      .on(
        'broadcast',
        { event: 'notification' },
        (payload) => {
          console.log('Received notification:', payload);
          const notification = payload.payload as RealtimeNotification;
          
          setNotifications(prev => [...prev, notification]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message,
          });
        }
      )
      .on(
        'broadcast',
        { event: 'balance_changed' },
        (payload) => {
          console.log('Received balance update:', payload);
          toast({
            title: "Balance Updated",
            description: `Your balance has been updated`,
          });
        }
      )
      .subscribe((status) => {
        console.log('Notifications channel status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('Cleaning up notifications channel');
      supabase.removeChannel(channel);
    };
  }, [userId, toast]);

  // Listen to database changes for pending notifications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notifications-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pending_notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification in database:', payload);
          if (payload.new) {
            const dbNotification = payload.new as any;
            setNotifications(prev => [...prev, {
              type: dbNotification.notification_type,
              title: dbNotification.title,
              message: dbNotification.message,
              extra: dbNotification.data,
              timestamp: dbNotification.created_at
            }]);
            if (!dbNotification.read) {
              setUnreadCount(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Listen to system alerts
  useEffect(() => {
    console.log('Setting up system alerts channel');

    const channel = supabase
      .channel('system:alerts')
      .on(
        'broadcast',
        { event: 'system_announcement' },
        (payload) => {
          console.log('Received system alert:', payload);
          toast({
            title: payload.payload.title || "System Alert",
            description: payload.payload.message,
          });
        }
      )
      .on(
        'broadcast',
        { event: 'promotion_available' },
        (payload) => {
          console.log('Received promotion alert:', payload);
          toast({
            title: "🎉 New Promotion!",
            description: payload.payload.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;
    
    const { error } = await supabase
      .from('pending_notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (!error) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    
    const { error } = await supabase
      .from('pending_notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (!error) {
      setUnreadCount(0);
    }
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications: () => setNotifications([])
  };
};