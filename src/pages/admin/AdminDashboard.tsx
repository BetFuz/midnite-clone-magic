import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, Activity, AlertTriangle, Users, Lock, 
  TrendingUp, Clock, CheckCircle, XCircle, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  mfa_verified: boolean;
  status: string;
  error_message?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface DashboardStats {
  totalAuditLogs: number;
  recentFailedAccess: number;
  adminUsers: number;
  criticalAlerts: number;
}

const AdminDashboard = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAuditLogs: 0,
    recentFailedAccess: 0,
    adminUsers: 0,
    criticalAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load audit logs
      const { data: logs } = await supabase.functions.invoke('admin-audit-logs', {
        method: 'GET',
        body: { limit: 50 },
      });

      if (logs?.data) {
        setAuditLogs(logs.data);
      }

      // Load admin users count
      const { count: adminCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['admin', 'superadmin']);

      // Count recent failed access attempts (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const failedLogs = logs?.data?.filter((log: AuditLog) => 
        log.status === 'failed' && log.created_at > oneDayAgo
      ) || [];

      // Count critical alerts (failed admin actions)
      const criticalLogs = logs?.data?.filter((log: AuditLog) => 
        log.status === 'failed' && 
        (log.action.includes('ACCESS_DENIED') || log.action.includes('FORBIDDEN'))
      ) || [];

      setStats({
        totalAuditLogs: logs?.count || 0,
        recentFailedAccess: failedLogs.length,
        adminUsers: adminCount || 0,
        criticalAlerts: criticalLogs.length,
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <AdminGuard requireSuperAdmin={false}>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <MobileNav />
        
        <main className="flex-1 p-6 lg:ml-64 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                  <p className="text-muted-foreground">Secure monitoring & audit trail</p>
                </div>
              </div>
              <Button onClick={loadDashboardData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Audit Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold">{stats.totalAuditLogs}</p>
                    <Activity className="w-8 h-8 text-primary/40" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Admin Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold">{stats.adminUsers}</p>
                    <Users className="w-8 h-8 text-blue-500/40" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Failed Access (24h)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold text-red-500">{stats.recentFailedAccess}</p>
                    <XCircle className="w-8 h-8 text-red-500/40" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Critical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold text-orange-500">{stats.criticalAlerts}</p>
                    <AlertTriangle className="w-8 h-8 text-orange-500/40" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Alerts */}
            {stats.recentFailedAccess > 5 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Alert:</strong> {stats.recentFailedAccess} failed admin access 
                  attempts detected in the last 24 hours. Review audit logs immediately.
                </AlertDescription>
              </Alert>
            )}

            {/* Audit Log Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Real-Time Audit Trail
                </CardTitle>
                <CardDescription>
                  Immutable log of all admin actions with full audit details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All Actions</TabsTrigger>
                    <TabsTrigger value="failed">Failed</TabsTrigger>
                    <TabsTrigger value="critical">Critical</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading audit logs...
                      </div>
                    ) : auditLogs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No audit logs found
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {auditLogs.map((log) => (
                          <div 
                            key={log.id} 
                            className="flex items-start gap-4 p-4 border border-border rounded-lg bg-card"
                          >
                            <div className="flex-shrink-0 mt-1">
                              {log.status === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className={getActionBadgeColor(log.status)}>
                                  {log.action}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {log.resource_type}
                                </span>
                                {log.mfa_verified && (
                                  <Badge variant="secondary" className="text-xs">
                                    MFA ✓
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-1">
                                Admin: {log.profiles?.email || 'Unknown'}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(log.created_at).toLocaleString()}
                                </span>
                                <span>IP: {log.ip_address || 'unknown'}</span>
                              </div>
                              
                              {log.error_message && (
                                <p className="mt-2 text-xs text-red-500">
                                  Error: {log.error_message}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="failed" className="space-y-4">
                    <div className="space-y-3">
                      {auditLogs
                        .filter(log => log.status === 'failed')
                        .map((log) => (
                          <div 
                            key={log.id} 
                            className="flex items-start gap-4 p-4 border border-red-500/20 rounded-lg bg-red-500/5"
                          >
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <Badge variant="outline" className="bg-red-500/10 text-red-500 mb-2">
                                {log.action}
                              </Badge>
                              <p className="text-sm mb-1">{log.profiles?.email || 'Unknown'}</p>
                              <p className="text-xs text-red-500">{log.error_message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(log.created_at).toLocaleString()} • IP: {log.ip_address}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="critical" className="space-y-4">
                    <Alert variant="destructive" className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Critical security events require immediate investigation
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-3">
                      {auditLogs
                        .filter(log => 
                          log.status === 'failed' && 
                          (log.action.includes('ACCESS_DENIED') || log.action.includes('FORBIDDEN'))
                        )
                        .map((log) => (
                          <div 
                            key={log.id} 
                            className="flex items-start gap-4 p-4 border border-orange-500/20 rounded-lg bg-orange-500/5"
                          >
                            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <Badge variant="outline" className="bg-orange-500/10 text-orange-500 mb-2">
                                CRITICAL: {log.action}
                              </Badge>
                              <p className="text-sm mb-1">{log.profiles?.email || 'Unknown user'}</p>
                              <p className="text-xs text-orange-500">{log.error_message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(log.created_at).toLocaleString()} • IP: {log.ip_address}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
};

export default AdminDashboard;
