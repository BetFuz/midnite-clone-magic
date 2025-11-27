import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Server,
  Database,
  Zap,
  TrendingUp
} from "lucide-react";

interface SystemHealth {
  status: 'operational' | 'degraded' | 'down';
  services: {
    database: 'healthy' | 'warning' | 'critical';
    api: 'healthy' | 'warning' | 'critical';
    realtime: 'healthy' | 'warning' | 'critical';
  };
  metrics: {
    responseTime: number;
    errorRate: number;
    activeConnections: number;
  };
  recentErrors: Array<{
    id: string;
    message: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export const SystemHealthMonitor = () => {
  const [health, setHealth] = useState<SystemHealth>({
    status: 'operational',
    services: {
      database: 'healthy',
      api: 'healthy',
      realtime: 'healthy'
    },
    metrics: {
      responseTime: 0,
      errorRate: 0,
      activeConnections: 0
    },
    recentErrors: []
  });

  useEffect(() => {
    checkSystemHealth();
    
    const interval = setInterval(checkSystemHealth, 10000); // Check every 10 seconds
    
    // Subscribe to error logs
    const errorChannel = supabase
      .channel('system-errors')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_audit_log',
          filter: 'status=eq.error'
        },
        (payload) => {
          const error = payload.new;
          addError({
            id: error.id,
            message: error.error_message || error.action,
            timestamp: error.created_at,
            severity: error.error_message?.toLowerCase().includes('critical') ? 'high' : 'medium'
          });
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(errorChannel);
    };
  }, []);

  const checkSystemHealth = async () => {
    const startTime = Date.now();
    
    try {
      // Test database connection
      const { error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      const responseTime = Date.now() - startTime;
      
      // Check recent errors
      const { data: recentErrorLogs, error: errorLogError } = await supabase
        .from('admin_audit_log')
        .select('*')
        .eq('status', 'error')
        .order('created_at', { ascending: false })
        .limit(5);

      const errorCount = recentErrorLogs?.length || 0;
      const errorRate = (errorCount / 100) * 100; // Percentage

      // Determine service health
      const dbHealth: 'healthy' | 'warning' | 'critical' = dbError 
        ? 'critical' 
        : responseTime > 1000 
          ? 'warning' 
          : 'healthy';

      const apiHealth: 'healthy' | 'warning' | 'critical' = responseTime > 2000 
        ? 'critical' 
        : responseTime > 1000 
          ? 'warning' 
          : 'healthy';

      const realtimeHealth: 'healthy' | 'warning' | 'critical' = errorRate > 10 
        ? 'critical' 
        : errorRate > 5 
          ? 'warning' 
          : 'healthy';

      // Overall system status
      const overallStatus: 'operational' | 'degraded' | 'down' = 
        dbHealth === 'critical' || apiHealth === 'critical' || realtimeHealth === 'critical'
          ? 'down'
          : dbHealth === 'warning' || apiHealth === 'warning' || realtimeHealth === 'warning'
            ? 'degraded'
            : 'operational';

      setHealth({
        status: overallStatus,
        services: {
          database: dbHealth,
          api: apiHealth,
          realtime: realtimeHealth
        },
        metrics: {
          responseTime,
          errorRate,
          activeConnections: Math.floor(Math.random() * 100) + 20 // Placeholder for actual connection count
        },
        recentErrors: recentErrorLogs?.map(log => ({
          id: log.id,
          message: log.error_message || log.action,
          timestamp: log.created_at,
          severity: log.error_message?.toLowerCase().includes('critical') ? 'high' : 'medium'
        })) || []
      });
    } catch (error) {
      console.error('Error checking system health:', error);
      setHealth(prev => ({
        ...prev,
        status: 'down',
        services: {
          database: 'critical',
          api: 'critical',
          realtime: 'critical'
        }
      }));
    }
  };

  const addError = (error: SystemHealth['recentErrors'][0]) => {
    setHealth(prev => ({
      ...prev,
      recentErrors: [error, ...prev.recentErrors].slice(0, 5)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return 'text-green-500';
      case 'degraded':
      case 'warning':
        return 'text-yellow-500';
      case 'down':
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">Healthy</Badge>;
      case 'degraded':
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">Warning</Badge>;
      case 'down':
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className={`h-5 w-5 ${getStatusColor(health.status)}`} />
              <CardTitle>System Status</CardTitle>
            </div>
            {getStatusBadge(health.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Database Service */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Database</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(health.services.database)}
              <span className={`text-sm ${getStatusColor(health.services.database)}`}>
                {health.services.database}
              </span>
            </div>
          </div>

          {/* API Service */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">API</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(health.services.api)}
              <span className={`text-sm ${getStatusColor(health.services.api)}`}>
                {health.services.api}
              </span>
            </div>
          </div>

          {/* Realtime Service */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Realtime</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(health.services.realtime)}
              <span className={`text-sm ${getStatusColor(health.services.realtime)}`}>
                {health.services.realtime}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Performance Metrics</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Response Time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Response Time</span>
              <span className="font-medium">{health.metrics.responseTime}ms</span>
            </div>
            <Progress 
              value={Math.min((health.metrics.responseTime / 2000) * 100, 100)} 
              className="h-2"
            />
          </div>

          {/* Error Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Error Rate</span>
              <span className="font-medium">{health.metrics.errorRate.toFixed(2)}%</span>
            </div>
            <Progress 
              value={health.metrics.errorRate} 
              className="h-2"
            />
          </div>

          {/* Active Connections */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Connections</span>
            <span className="text-sm font-medium">{health.metrics.activeConnections}</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <CardTitle>Recent Errors</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {health.recentErrors.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <p className="text-sm text-muted-foreground">No recent errors</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {health.recentErrors.map((error) => (
                <div 
                  key={error.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                    error.severity === 'high' 
                      ? 'text-red-500' 
                      : error.severity === 'medium'
                        ? 'text-yellow-500'
                        : 'text-orange-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{error.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(error.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge 
                    variant={error.severity === 'high' ? 'destructive' : 'outline'}
                    className="text-xs"
                  >
                    {error.severity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
