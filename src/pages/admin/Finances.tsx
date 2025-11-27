import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FinancialData {
  totalDeposits: number;
  totalWithdrawals: number;
  netRevenue: number;
  userBalances: number;
  todayDeposits: number;
  todayWithdrawals: number;
}

const Finances = () => {
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    netRevenue: 0,
    userBalances: 0,
    todayDeposits: 0,
    todayWithdrawals: 0,
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      // Fetch bet slips for revenue calculation
      const { data: betSlips, error: betsError } = await supabase
        .from('bet_slips')
        .select('total_stake, status, created_at');

      if (betsError) throw betsError;

      // Fetch user balances
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('balance');

      if (profilesError) throw profilesError;

      // Calculate totals
      const totalStaked = betSlips?.reduce((sum, bet) => sum + Number(bet.total_stake), 0) || 0;
      const wonBets = betSlips?.filter(bet => bet.status === 'won') || [];
      const totalPayouts = wonBets.reduce((sum, bet) => sum + Number(bet.total_stake) * 1.5, 0); // Simplified payout calculation
      
      const userBalances = profiles?.reduce((sum, profile) => sum + Number(profile.balance), 0) || 0;
      
      // Today's transactions (using rough estimate)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayBets = betSlips?.filter(bet => new Date(bet.created_at) >= today) || [];
      const todayDeposits = todayBets.reduce((sum, bet) => sum + Number(bet.total_stake), 0);

      setFinancialData({
        totalDeposits: totalStaked,
        totalWithdrawals: totalPayouts,
        netRevenue: totalStaked - totalPayouts,
        userBalances,
        todayDeposits,
        todayWithdrawals: totalPayouts * 0.15, // Estimate
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Financial Management</h1>
              <p className="text-muted-foreground">
                {loading ? 'Loading...' : 'Real-time platform financial overview'}
              </p>
            </div>
            <Button variant="outline" onClick={fetchFinancialData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-green-500" />
                  Total Deposits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {loading ? '...' : `₦${financialData.totalDeposits.toLocaleString()}`}
                </div>
                <p className="text-xs text-muted-foreground">
                  Today: ₦{financialData.todayDeposits.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-red-500" />
                  Total Withdrawals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {loading ? '...' : `₦${financialData.totalWithdrawals.toLocaleString()}`}
                </div>
                <p className="text-xs text-muted-foreground">
                  Today: ₦{financialData.todayWithdrawals.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Net Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {loading ? '...' : `₦${financialData.netRevenue.toLocaleString()}`}
                </div>
                <p className="text-xs text-muted-foreground">
                  {financialData.netRevenue >= 0 ? 'Profit' : 'Loss'} from bets
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  User Balances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : `₦${financialData.userBalances.toLocaleString()}`}
                </div>
                <p className="text-xs text-muted-foreground">Across all accounts</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pending Withdrawals</CardTitle>
                <CardDescription>Review and approve withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">user@example.com</p>
                      <p className="text-sm text-muted-foreground">5 mins ago</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₦50,000</p>
                      <p className="text-xs text-muted-foreground">Bank Transfer</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">vip@example.com</p>
                      <p className="text-sm text-muted-foreground">12 mins ago</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₦120,000</p>
                      <p className="text-xs text-muted-foreground">Mobile Money</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Overview</CardTitle>
                <CardDescription>Breakdown by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="deposits">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="deposits">Deposits</TabsTrigger>
                    <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                  </TabsList>
                  <TabsContent value="deposits" className="space-y-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bank Transfer</span>
                      <span className="font-medium">₦6.2M (50%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Card Payment</span>
                      <span className="font-medium">₦4.8M (39%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mobile Money</span>
                      <span className="font-medium">₦1.4M (11%)</span>
                    </div>
                  </TabsContent>
                  <TabsContent value="withdrawals" className="space-y-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bank Transfer</span>
                      <span className="font-medium">₦5.8M (71%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mobile Money</span>
                      <span className="font-medium">₦2.4M (29%)</span>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default Finances;
