import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';

const NetworkStatus = () => {
  const { isOnline, connectionSpeed } = useNetworkStatus();

  if (isOnline && connectionSpeed === 'fast') {
    return null;
  }

  return (
    <Alert 
      variant={isOnline ? "default" : "destructive"} 
      className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-md mx-auto"
    >
      {isOnline ? (
        <Wifi className="h-4 w-4" />
      ) : (
        <WifiOff className="h-4 w-4" />
      )}
      <AlertDescription>
        {!isOnline 
          ? "You're offline. Some features may be limited." 
          : "Slow connection detected. Data usage optimized."}
      </AlertDescription>
    </Alert>
  );
};

export default NetworkStatus;
