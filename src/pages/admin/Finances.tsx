import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Finances = () => {
  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Financial Management</h1>
            <p className="text-muted-foreground">Monitor deposits, withdrawals, and platform finances</p>
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
                <div className="text-2xl font-bold text-green-500">₦12.4M</div>
                <p className="text-xs text-muted-foreground">Today: ₦840K</p>
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
                <div className="text-2xl font-bold text-red-500">₦8.2M</div>
                <p className="text-xs text-muted-foreground">Today: ₦520K</p>
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
                <div className="text-2xl font-bold text-primary">₦4.2M</div>
                <p className="text-xs text-muted-foreground">+15% vs last week</p>
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
                <div className="text-2xl font-bold">₦18.6M</div>
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
