import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RealtimeNotification {
  id?: string;
  type: string;
  title: string;
  message: string;
  extra?: any;
  timestamp: string;
  read?: boolean;
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
              id: dbNotification.id,
              type: dbNotification.notification_type,
              title: dbNotification.title,
              message: dbNotification.message,
              extra: dbNotification.data,
              timestamp: dbNotification.created_at,
              read: dbNotification.read
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
      .subscribe((status) => {
        console.log('System alerts channel status:', status);
      });

    return () => {
      console.log('Cleaning up system alerts channel');
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const { error } = await supabase.functions.invoke('mark-notifications-read', {
        body: { notificationIds }
      });

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id && notificationIds.includes(notif.id) 
            ? { ...notif, read: true } 
            : notif
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));

      return { error: null };
    } catch (error: any) {
      console.error('Error marking notifications as read:', error);
      return { error };
    }
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead
  };
};
