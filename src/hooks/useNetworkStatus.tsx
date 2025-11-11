import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast' | 'offline'>('fast');
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Your connection has been restored.",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionSpeed('offline');
      toast({
        title: "No Connection",
        description: "You're offline. Some features may be limited.",
        variant: "destructive",
      });
    };

    const checkConnectionSpeed = () => {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        const effectiveType = conn?.effectiveType;
        
        if (effectiveType === '2g' || effectiveType === 'slow-2g') {
          setConnectionSpeed('slow');
        } else {
          setConnectionSpeed('fast');
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ('connection' in navigator) {
      (navigator as any).connection?.addEventListener('change', checkConnectionSpeed);
    }

    checkConnectionSpeed();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('connection' in navigator) {
        (navigator as any).connection?.removeEventListener('change', checkConnectionSpeed);
      }
    };
  }, [toast]);

  return { isOnline, connectionSpeed };
};
