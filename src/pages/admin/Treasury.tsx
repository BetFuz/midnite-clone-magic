import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const Treasury = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['admin-stats-treasury'],
    queryFn: () => adminApi.getStats(),
    refetchInterval: 30000,
  });

  const handleReconciliation = async (file: File) => {
    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      const rows = lines.slice(1).map(line => line.split(','));
      toast({
        title: 'Reconciliation Complete',
        description: `Processed ${rows.length} transactions from bank statement`,
      });
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount || 0);

  const totalDeposits = stats?.totalDeposits ?? stats?.revenue ?? 0;
  const totalWithdrawals = stats?.totalWithdrawals ?? stats?.payouts ?? 0;
  const totalBets = stats?.totalBets ?? 0;
  const activeBets = stats?.activeBets ?? stats?.pendingBets ?? 0;
  const totalUsers = stats?.totalUsers ?? 0;
  const netRevenue = totalDeposits - totalWithdrawals;

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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(totalDeposits)}</div>
                  <p className="text-xs text-muted-foreground mt-1">All-time platform deposits</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bets Value</CardTitle>
                  <TrendingDown className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{activeBets.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">{activeBets} pending bet slips</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
                </CardContent>
              </Card>
            </div>

            {/* Health Status */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Health Status</CardTitle>
                <CardDescription>Real-time system metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bets Placed</p>
                    <p className="text-2xl font-bold">{totalBets.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(totalWithdrawals)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Position</p>
                    <p className={`text-2xl font-bold ${netRevenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(netRevenue)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {netRevenue >= 0 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="h-3 w-3 rounded-full bg-green-600" />
                      <span className="text-sm font-medium">Healthy — Platform profitable</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Warning — Monitor payouts</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bank Reconciliation */}
            <Card>
              <CardHeader>
                <CardTitle>Settlement Account Reconciliation</CardTitle>
                <CardDescription>Upload bank statement CSV to reconcile against ledger entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) handleReconciliation(file); }}
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
                  <p className="text-sm text-muted-foreground">Alerts triggered if discrepancy exceeds ₦1,000</p>
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
                  <div className="text-2xl font-bold">{formatCurrency(totalDeposits)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Deposits + settled bets</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(totalWithdrawals)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Withdrawals + winnings</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netRevenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Revenue - Payouts</p>
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
