import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminPlatformControl } from "@/hooks/useAdminPlatformControl";
import { 
  Shield, Users, TrendingUp, Activity, 
  DollarSign, RefreshCw, AlertTriangle, Eye
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

const AdminDashboard = () => {
  const { getPlatformOverview, loading } = useAdminPlatformControl();
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    const data = await getPlatformOverview();
    setOverview(data);
  };

  return (
    <AdminGuard requireSuperAdmin={false}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Platform Control Center</h1>
                <p className="text-muted-foreground">Complete visibility and control over all platform activities</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={overview?.platformStatus === 'operational' ? 'default' : 'destructive'}>
                {overview?.platformStatus || 'Loading...'}
              </Badge>
              <Button onClick={loadOverview} disabled={loading} variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {overview?.activeUsers24h || 0} active (24h)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.totalBets || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {overview?.pendingBets || 0} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(overview?.totalStaked || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  All-time betting volume
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Live Matches</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.liveMatches || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {overview?.totalViewers || 0} viewers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/admin/users'}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/admin/bets'}>
                  <Activity className="mr-2 h-4 w-4" />
                  Manage Bets
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/admin/events'}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Manage Events
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/admin/finances'}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Financial Overview
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Critical platform notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overview?.pendingBets > 100 && (
                    <div className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">High Pending Bets</p>
                        <p className="text-muted-foreground">{overview.pendingBets} bets awaiting settlement</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm">
                    <Activity className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">System Operational</p>
                      <p className="text-muted-foreground">All services running normally</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New Users (24h)</span>
                    <span className="font-medium">{overview?.activeUsers24h || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending Bets</span>
                    <span className="font-medium">{overview?.pendingBets || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Live Matches</span>
                    <span className="font-medium">{overview?.liveMatches || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Viewers</span>
                    <span className="font-medium">{overview?.totalViewers || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Platform Overview</TabsTrigger>
              <TabsTrigger value="actions">Bulk Actions</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Statistics</CardTitle>
                  <CardDescription>Real-time platform metrics and performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">User Engagement</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Registered</span>
                          <span className="font-medium">{overview?.totalUsers || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active (24h)</span>
                          <span className="font-medium">{overview?.activeUsers24h || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Betting Activity</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Bets</span>
                          <span className="font-medium">{overview?.totalBets || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Volume</span>
                          <span className="font-medium">{formatCurrency(overview?.totalStaked || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions">
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Management</CardTitle>
                  <CardDescription>Perform bulk operations on users, bets, and matches</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/admin/users'}>
                    Bulk User Management
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/admin/bets'}>
                    Bulk Bet Settlement
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/admin/events'}>
                    Bulk Match Operations
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Reports & Analytics</CardTitle>
                  <CardDescription>Access detailed reports and analytics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/admin/reports'}>
                    Financial Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/admin/reports'}>
                    User Activity Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/admin/audit'}>
                    Audit Logs
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminDashboard;
