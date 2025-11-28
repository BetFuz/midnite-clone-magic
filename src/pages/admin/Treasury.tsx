import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const Treasury = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  // Fetch float health metrics
  const { data: floatHealth, isLoading, refetch } = useQuery({
    queryKey: ['float-health'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('float-health-metrics');
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleReconciliation = async (file: File) => {
    setUploading(true);
    try {
      // Read CSV file
      const text = await file.text();

      const { data, error } = await supabase.functions.invoke('bank-reconciliation', {
        body: { csv_data: text },
      });

      if (error) throw error;

      if (data.summary.alert_triggered) {
        toast({
          title: '⚠️ Reconciliation Alert',
          description: `Discrepancy detected: ₦${data.summary.total_discrepancy.toFixed(2)}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Reconciliation Complete',
          description: `All transactions matched successfully`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Reconciliation Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Treasury & Float Health</h1>
            <p className="text-muted-foreground">Real-time monitoring of payment float and settlement</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Float Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available to Pay Winners</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(floatHealth?.float_health?.available_to_pay_winners || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total user balances minus locked bets and bonuses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Locked in Open Bets</CardTitle>
                  <TrendingDown className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(floatHealth?.float_health?.locked_in_open_bets || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {floatHealth?.metrics?.open_bets_count || 0} pending bet slips
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reserved for Bonuses</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(floatHealth?.float_health?.reserved_for_bonuses || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bonus allocations (last 30 days)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Exposure & Health Status */}
            <Card>
              <CardHeader>
                <CardTitle>Payout Exposure & Health Status</CardTitle>
                <CardDescription>
                  Maximum potential payout if all pending bets win
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Potential Winnings</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(floatHealth?.exposure?.total_potential_winnings || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Max Payout Exposure</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(floatHealth?.exposure?.max_payout_exposure || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Health Ratio</p>
                    <p className={`text-2xl font-bold ${getHealthColor(floatHealth?.exposure?.health_status)}`}>
                      {floatHealth?.exposure?.health_ratio?.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {floatHealth?.exposure?.health_status === 'healthy' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="h-3 w-3 rounded-full bg-green-600" />
                      <span className="text-sm font-medium">Healthy</span>
                    </div>
                  )}
                  {floatHealth?.exposure?.health_status === 'warning' && (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Warning - Monitor closely</span>
                    </div>
                  )}
                  {floatHealth?.exposure?.health_status === 'critical' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Critical - Immediate action required</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bank Reconciliation */}
            <Card>
              <CardHeader>
                <CardTitle>Settlement Account Reconciliation</CardTitle>
                <CardDescription>
                  Upload bank statement CSV to reconcile against ledger entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleReconciliation(file);
                    }}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload">
                    <Button variant="outline" asChild disabled={uploading}>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? 'Processing...' : 'Upload Bank Statement CSV'}
                      </span>
                    </Button>
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Alerts triggered if discrepancy exceeds ₦1,000
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(floatHealth?.metrics?.total_revenue || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Deposits + Lost bets
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(floatHealth?.metrics?.total_payouts || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Withdrawals + Won bets
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(floatHealth?.metrics?.net_revenue || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Revenue - Payouts
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Treasury;
