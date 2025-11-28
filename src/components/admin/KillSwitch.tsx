import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Power, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const KillSwitch = () => {
  const { toast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Check current suspend status
  const { data: suspendStatus, refetch } = useQuery({
    queryKey: ['suspend-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .eq('action', 'suspend_live_events')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return {
        isSuspended: data?.status === 'success' && data?.error_message?.includes('SUSPENDED'),
        lastAction: data,
      };
    },
    refetchInterval: 10000, // Check every 10 seconds
  });

  // Suspend live events mutation
  const suspendMutation = useMutation({
    mutationFn: async (suspend: boolean) => {
      const response = await supabase.functions.invoke('suspend-live-events', {
        body: { suspend },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data, suspend) => {
      toast({
        title: suspend ? 'Live Events Suspended' : 'Live Events Resumed',
        description: suspend 
          ? 'All live betting has been suspended. Pending bets will remain active.'
          : 'Live betting has been resumed. Users can now place live bets.',
      });
      refetch();
      setIsConfirmOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Action Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const isSuspended = suspendStatus?.isSuspended || false;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${isSuspended ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
            {isSuspended ? (
              <AlertTriangle className="w-6 h-6 text-destructive" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Emergency Kill Switch</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Immediately suspend all live betting operations. Use in emergencies only.
            </p>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <Power className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Status: {isSuspended ? (
                    <span className="text-destructive">SUSPENDED</span>
                  ) : (
                    <span className="text-green-500">ACTIVE</span>
                  )}
                </span>
              </div>
              {suspendStatus?.lastAction && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last action: {new Date(suspendStatus.lastAction.created_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant={isSuspended ? 'default' : 'destructive'}
              className="w-full"
              size="lg"
            >
              {isSuspended ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Resume Live Betting
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Suspend Live Betting
                </>
              )}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isSuspended ? 'Resume Live Betting?' : 'Suspend Live Betting?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isSuspended ? (
                  <>
                    This will resume all live betting operations. Users will be able to place
                    live bets again immediately.
                  </>
                ) : (
                  <>
                    This will immediately suspend all live betting operations across the platform.
                    Pending bets will remain active, but no new live bets can be placed until
                    betting is resumed. Use this only in emergencies (odds feed failure, security
                    breach, regulatory freeze, etc.).
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => suspendMutation.mutate(!isSuspended)}
                disabled={suspendMutation.isPending}
                className={isSuspended ? '' : 'bg-destructive hover:bg-destructive/90'}
              >
                {suspendMutation.isPending ? 'Processing...' : 'Confirm'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {isSuspended && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm font-medium text-destructive">
              ⚠️ Live betting is currently suspended
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All live events are blocked. Pending bets will settle normally.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
