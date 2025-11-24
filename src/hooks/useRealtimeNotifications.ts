import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from './useUserProfile';

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  data?: any;
  read: boolean;
  created_at: string;
}

export const useRealtimeNotifications = () => {
  const { user } = useUserProfile();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load initial notifications
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      const { data, error } = await supabase
        .from('pending_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    };

    loadNotifications();
  }, [user?.id]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user) {
      console.log('No user, skipping notifications subscription');
      return;
    }

    console.log('Setting up realtime notifications subscription for user:', user.id);

    // Subscribe to broadcast channel
    const broadcastChannel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'broadcast',
        { event: 'notification' },
        (payload) => {
          console.log('Received broadcast notification:', payload);

          const notification = payload.payload as Notification;
          
          setNotifications(prev => [notification, ...prev.slice(0, 49)]);
          setUnreadCount(prev => prev + 1);

          // Show toast
          toast({
            title: notification.title,
            description: notification.message,
            duration: 5000,
          });
        }
      )
      .subscribe((status) => {
        console.log('Broadcast notifications channel status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Subscribe to database changes
    const dbChannel = supabase
      .channel('pending-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pending_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Received database notification:', payload);

          const notification = payload.new as Notification;
          
          setNotifications(prev => {
            // Check if notification already exists
            if (prev.some(n => n.id === notification.id)) {
              return prev;
            }
            return [notification, ...prev.slice(0, 49)];
          });
          
          setUnreadCount(prev => prev + 1);

          // Show toast
          toast({
            title: notification.title,
            description: notification.message,
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pending_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Notification updated:', payload);

          const updatedNotification = payload.new as Notification;
          
          setNotifications(prev =>
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );

          // Recalculate unread count
          setUnreadCount(prev => {
            const oldNotification = payload.old as Notification;
            if (!oldNotification.read && updatedNotification.read) {
              return Math.max(0, prev - 1);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up notifications subscriptions');
      supabase.removeChannel(broadcastChannel);
      supabase.removeChannel(dbChannel);
    };
  }, [user?.id, toast]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('pending_notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
      return;
    }

    console.log('Notification marked as read:', notificationId);
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('pending_notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive',
      });
      return;
    }

    setUnreadCount(0);
    console.log('All notifications marked as read');
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications: () => setNotifications([]),
  };
};
