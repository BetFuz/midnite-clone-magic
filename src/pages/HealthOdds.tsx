import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Activity, AlertTriangle, CheckCircle, Radio } from "lucide-react";

interface FeedHealth {
  provider: string;
  lastUpdate: string;
  isStale: boolean;
  staleDurationSeconds: number;
  status: 'healthy' | 'stale' | 'down';
}

interface HealthResponse {
  status: string;
  currentProvider: string;
  shouldSuspendLiveEvents: boolean;
  timestamp: string;
  feeds: {
    betradar: FeedHealth;
    betgenius: FeedHealth;
  };
  failoverTriggered: boolean;
  alert: string | null;
}

const HealthOdds = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("health-odds");

      if (error) throw error;

      setHealth(data);

      if (data.failoverTriggered) {
        toast({
          title: "Failover Active",
          description: `Switched to ${data.currentProvider} due to primary feed failure`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Health Check Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();

    if (autoRefresh) {
      const interval = setInterval(checkHealth, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'stale':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'stale':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <Radio className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Odds Feed Health</h1>
            <p className="text-muted-foreground">Real-time monitoring of betting odds providers</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "Pause" : "Resume"} Auto-Refresh
          </Button>
          <Button onClick={checkHealth} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Refresh Now
          </Button>
        </div>
      </div>

      {health && (
        <>
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Current Status
                <Badge variant={health.failoverTriggered ? "destructive" : "default"}>
                  {health.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                Active Provider: <strong>{health.currentProvider}</strong>
                {health.shouldSuspendLiveEvents && (
                  <span className="ml-2 text-red-500 font-semibold">
                    ⚠️ Live events should be suspended
                  </span>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Betradar (Primary) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(health.feeds.betradar.status)}
                Betradar (Primary)
                <Badge className={getStatusColor(health.feeds.betradar.status)}>
                  {health.feeds.betradar.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Update:</span>
                <span className="font-mono">{health.feeds.betradar.lastUpdate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stale Duration:</span>
                <span className={health.feeds.betradar.staleDurationSeconds > 60 ? 'text-red-500 font-semibold' : ''}>
                  {health.feeds.betradar.staleDurationSeconds}s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Is Stale:</span>
                <span>{health.feeds.betradar.isStale ? '❌ Yes' : '✅ No'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Betgenius (Backup) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(health.feeds.betgenius.status)}
                Betgenius (Backup)
                <Badge className={getStatusColor(health.feeds.betgenius.status)}>
                  {health.feeds.betgenius.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Update:</span>
                <span className="font-mono">{health.feeds.betgenius.lastUpdate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stale Duration:</span>
                <span className={health.feeds.betgenius.staleDurationSeconds > 60 ? 'text-red-500 font-semibold' : ''}>
                  {health.feeds.betgenius.staleDurationSeconds}s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Is Stale:</span>
                <span>{health.feeds.betgenius.isStale ? '❌ Yes' : '✅ No'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Alert Info */}
          {health.alert && (
            <Card className="border-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{health.alert}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Timestamp: {health.timestamp}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default HealthOdds;