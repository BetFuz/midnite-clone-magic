import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface RealtimeNotification {
  id?: string; type: string; title: string; message: string;
  extra?: any; timestamp: string; read?: boolean;
}

export const useRealtimeNotifications = (_userId?: string) => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const markAllRead = () => {
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, isConnected: false, markAllRead };
};
