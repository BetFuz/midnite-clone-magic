import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, Users, Database, TrendingUp, Activity, 
  DollarSign, BarChart3, RefreshCw, Calendar, Trophy,
  Clock, CheckCircle, XCircle, Eye
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";

interface SystemStats {
  totalUsers: number;
  totalBets: number;
  totalMatches: number;
  activeLeagues: number;
  totalStaked: number;
  recentUsers: Array<{
    email: string;
    created_at: string;
  }>;
  recentBets: Array<{
    user_email: string;
    total_stake: number;
    status: string;
    created_at: string;
  }>;
  adminUsers: Array<{
    email: string;
    role: string;
  }>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalBets: 0,
    totalMatches: 0,
    activeLeagues: 0,
    totalStaked: 0,
    recentUsers: [],
    recentBets: [],
    adminUsers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total bets
      const { count: betCount } = await supabase
        .from('bet_slips')
        .select('*', { count: 'exact', head: true });

      // Get total matches
      const { count: matchCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true });

      // Get active leagues
      const { count: leagueCount } = await supabase
        .from('sports_leagues')
        .select('*', { count: 'exact', head: true });

      // Get total staked amount
      const { data: betData } = await supabase
        .from('bet_slips')
        .select('total_stake');
      
      const totalStaked = betData?.reduce((sum, bet) => sum + Number(bet.total_stake), 0) || 0;

      // Get recent users (last 10)
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('email, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent bets (last 10)
      const { data: recentBetsData } = await supabase
        .from('bet_slips')
        .select(`
          total_stake,
          status,
          created_at,
          user_id,
          profiles(email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const recentBets = recentBetsData?.map(bet => ({
        user_email: (bet.profiles as any)?.email || 'Unknown',
        total_stake: bet.total_stake,
        status: bet.status,
        created_at: bet.created_at
      })) || [];

      // Get admin users
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select(`
          role,
          user_id,
          profiles(email)
        `)
        .in('role', ['admin', 'superadmin']);

      const adminUsers = adminRoles?.map(admin => ({
        email: (admin.profiles as any)?.email || 'Unknown',
        role: admin.role
      })) || [];

      setStats({
        totalUsers: userCount || 0,
        totalBets: betCount || 0,
        totalMatches: matchCount || 0,
        activeLeagues: leagueCount || 0,
        totalStaked,
        recentUsers: recentUsers || [],
        recentBets,
        adminUsers,
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'text-green-500';
      case 'lost':
        return 'text-red-500';
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                  <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                  <p className="text-muted-foreground">System overview and statistics</p>
                </div>
              </div>
              <Button onClick={loadDashboardData} disabled={loading} variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered accounts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBets.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    All time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalStaked)}</div>
                  <p className="text-xs text-muted-foreground">
                    Platform volume
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMatches.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeLeagues} leagues
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for detailed views */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Recent Users</TabsTrigger>
                <TabsTrigger value="bets">Recent Bets</TabsTrigger>
                <TabsTrigger value="admins">Admin Users</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Health</CardTitle>
                      <CardDescription>Current platform status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Database</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">Online</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Authentication</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Edge Functions</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">Running</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common admin tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/admin/seed'}>
                        <Database className="w-4 h-4 mr-2" />
                        Update Match Data
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/admin/setup'}>
                        <Users className="w-4 h-4 mr-2" />
                        Manage User Roles
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/admin/webhooks'}>
                        <Activity className="w-4 h-4 mr-2" />
                        Configure Webhooks
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent User Registrations</CardTitle>
                    <CardDescription>Last 10 users who joined the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.recentUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No users yet</p>
                      ) : (
                        stats.recentUsers.map((user, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-primary/10">
                                <Users className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{user.email}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(user.created_at)}</p>
                              </div>
                            </div>
                            <Badge variant="outline">New</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bets">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bets</CardTitle>
                    <CardDescription>Last 10 bets placed on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.recentBets.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No bets yet</p>
                      ) : (
                        stats.recentBets.map((bet, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-primary/10">
                                <Trophy className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{bet.user_email}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(bet.created_at)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatCurrency(bet.total_stake)}</p>
                              <p className={`text-xs capitalize ${getStatusColor(bet.status)}`}>{bet.status}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="admins">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Users</CardTitle>
                    <CardDescription>Users with admin or superadmin privileges</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.adminUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No admin users</p>
                      ) : (
                        stats.adminUsers.map((admin, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-red-500/10">
                                <Shield className="w-4 h-4 text-red-500" />
                              </div>
                              <p className="text-sm font-medium">{admin.email}</p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={admin.role === 'superadmin' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}
                            >
                              {admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
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
