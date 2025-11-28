import { useOfflineBets } from '@/hooks/useOfflineBets';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBetsBanner() {
  const { pendingBets, retryNow, isProcessing, hasPendingBets } = useOfflineBets();
  const { isOnline } = useNetworkStatus();

  if (!hasPendingBets) return null;

  return (
    <Alert 
      variant="default" 
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md mx-auto bg-amber-500/90 text-amber-950 border-amber-600"
    >
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span className="font-medium">
          {pendingBets.length} bet{pendingBets.length > 1 ? 's' : ''} pending
        </span>
        {isOnline && (
          <Button
            size="sm"
            variant="ghost"
            onClick={retryNow}
            disabled={isProcessing}
            className="h-7 px-2 text-amber-950 hover:text-amber-950 hover:bg-amber-600/20"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isProcessing ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
