import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react';

const EscrowManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testAmount, setTestAmount] = useState('200000');
  const [freezeReason, setFreezeReason] = useState('');
  const [mockFreezeActive, setMockFreezeActive] = useState(false);

  // Fetch active regulatory flags
  const { data: flags } = useQuery({
    queryKey: ['regulatory-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regulatory_flags')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch escrow transfers
  const { data: transfers, isLoading } = useQuery({
    queryKey: ['escrow-transfers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('escrow_transfers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  // Test escrow transfer
  const testTransferMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('escrow-transfer', {
        body: {
          amount: parseFloat(testAmount),
          reason: 'Manual test transfer from admin panel',
          testMode: true,
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Test Transfer Successful',
        description: `₦${parseFloat(testAmount).toLocaleString()} transferred to test escrow wallet`,
      });
      queryClient.invalidateQueries({ queryKey: ['escrow-transfers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Transfer Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle mock freeze flag
  const toggleFreezeMutation = useMutation({
    mutationFn: async (activate: boolean) => {
      if (activate) {
        const { data, error } = await supabase
          .from('regulatory_flags')
          .insert({
            flag_type: 'nlrc_freeze',
            is_active: true,
            reason: freezeReason || 'Mock NLRC freeze for testing',
            activated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const activeFlag = flags?.find(f => f.flag_type === 'nlrc_freeze' && f.is_active);
        if (!activeFlag) return null;

        const { error } = await supabase
          .from('regulatory_flags')
          .update({
            is_active: false,
            deactivated_at: new Date().toISOString(),
          })
          .eq('id', activeFlag.id);

        if (error) throw error;
        return null;
      }
    },
    onSuccess: (_, activate) => {
      toast({
        title: activate ? 'Freeze Activated' : 'Freeze Deactivated',
        description: activate 
          ? 'Mock NLRC freeze flag is now active. Nightly cron will trigger escrow transfer.'
          : 'Mock NLRC freeze flag has been deactivated.',
      });
      queryClient.invalidateQueries({ queryKey: ['regulatory-flags'] });
      setMockFreezeActive(activate);
    },
    onError: (error: Error) => {
      toast({
        title: 'Operation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Trigger escrow check manually
  const triggerCheckMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke('check-escrow-trigger');
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: data.transferTriggered ? 'Transfer Triggered' : 'No Transfer Needed',
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['escrow-transfers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Check Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const activeFreeze = flags?.find(f => f.flag_type === 'nlrc_freeze' && f.is_active);
  const totalEscrowed = transfers?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Escrow Management</h1>
          <p className="text-muted-foreground mt-2">
            Regulatory breach auto-escrow system for NLRC compliance
          </p>
        </div>

        {/* Status Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Escrow Status</p>
                <p className="text-2xl font-bold">
                  {activeFreeze ? 'ACTIVE' : 'INACTIVE'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Escrowed</p>
                <p className="text-2xl font-bold">₦{totalEscrowed.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transfers</p>
                <p className="text-2xl font-bold">{transfers?.length || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Freeze Alert */}
        {activeFreeze && (
          <Card className="p-6 border-destructive">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-destructive mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive">NLRC Regulatory Freeze Active</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeFreeze.reason}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Activated: {new Date(activeFreeze.activated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Test Controls */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Test Escrow System</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-amount">Test Transfer Amount (NGN)</Label>
              <Input
                id="test-amount"
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                placeholder="200000"
                className="mt-2"
              />
            </div>

            <Button 
              onClick={() => testTransferMutation.mutate()}
              disabled={testTransferMutation.isPending}
              className="w-full"
            >
              {testTransferMutation.isPending ? 'Processing...' : 'Test Manual Transfer'}
            </Button>

            <div className="pt-4 border-t space-y-4">
              <div>
                <Label htmlFor="freeze-reason">Mock Freeze Reason</Label>
                <Input
                  id="freeze-reason"
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  placeholder="NLRC compliance audit"
                  className="mt-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="mock-freeze">Mock NLRC Freeze</Label>
                <Switch
                  id="mock-freeze"
                  checked={mockFreezeActive || !!activeFreeze}
                  onCheckedChange={(checked) => toggleFreezeMutation.mutate(checked)}
                  disabled={toggleFreezeMutation.isPending}
                />
              </div>

              <Button
                onClick={() => triggerCheckMutation.mutate()}
                disabled={triggerCheckMutation.isPending}
                variant="outline"
                className="w-full"
              >
                {triggerCheckMutation.isPending ? 'Checking...' : 'Trigger Escrow Check (Manual)'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Transfer History */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Transfer History</h3>
          
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading transfers...</div>
          ) : transfers && transfers.length > 0 ? (
            <div className="space-y-3">
              {transfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {transfer.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium">₦{parseFloat(transfer.amount.toString()).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{transfer.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(transfer.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">TX Hash</p>
                    <p className="text-xs font-mono">{transfer.tx_hash?.substring(0, 16)}...</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No transfers yet</div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EscrowManagement;
