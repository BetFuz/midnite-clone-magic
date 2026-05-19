import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api/client";
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

const defaultFeed: FeedHealth = { provider: 'Unknown', lastUpdate: 'N/A', isStale: false, staleDurationSeconds: 0, status: 'healthy' };

const HealthOdds = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [apiHealth, setApiHealth] = useState<any>(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await api.get('/health');
      const h = res.data;
      setApiHealth(h);

      // Map our backend health to the display shape
      const mapped: HealthResponse = {
        status: h.status === 'ok' ? 'healthy' : 'degraded',
        currentProvider: 'BetFuz API',
        shouldSuspendLiveEvents: h.status !== 'ok',
        timestamp: new Date().toISOString(),
        feeds: {
          betradar: {
            provider: 'Supabase Odds Feed',
            lastUpdate: new Date().toLocaleTimeString(),
            isStale: h.status !== 'ok',
            staleDurationSeconds: 0,
            status: h.status === 'ok' ? 'healthy' : 'stale',
          },
          betgenius: {
            provider: 'BetFuz Seeded Events',
            lastUpdate: new Date().toLocaleTimeString(),
            isStale: false,
            staleDurationSeconds: 0,
            status: 'healthy',
          },
        },
        failoverTriggered: false,
        alert: h.status !== 'ok' ? 'API health check returned non-OK status' : null,
      };
      setHealth(mapped);
    } catch (error: any) {
      toast({
        title: "Health Check Failed",
        description: error.message,
        variant: "destructive",
      });
      setHealth({
        status: 'down',
        currentProvider: 'Unknown',
        shouldSuspendLiveEvents: true,
        timestamp: new Date().toISOString(),
        feeds: { betradar: { ...defaultFeed, status: 'down' }, betgenius: { ...defaultFeed, status: 'down' } },
        failoverTriggered: true,
        alert: 'Cannot reach BetFuz API',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    if (autoRefresh) {
      const interval = setInterval(checkHealth, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'stale': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'stale': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'down': return <Radio className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
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
          <Button variant="outline" onClick={() => setAutoRefresh(!autoRefresh)}>
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
                  <span className="ml-2 text-red-500 font-semibold">⚠️ Live events should be suspended</span>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Primary Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(health.feeds.betradar.status)}
                {health.feeds.betradar.provider} (Primary)
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

          {/* Backup Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(health.feeds.betgenius.status)}
                {health.feeds.betgenius.provider} (Backup)
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
                <span>{health.feeds.betgenius.staleDurationSeconds}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Is Stale:</span>
                <span>{health.feeds.betgenius.isStale ? '❌ Yes' : '✅ No'}</span>
              </div>
            </CardContent>
          </Card>

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
                <p className="text-xs text-muted-foreground mt-2">Timestamp: {health.timestamp}</p>
              </CardContent>
            </Card>
          )}

          {apiHealth && (
            <Card>
              <CardHeader>
                <CardTitle>Raw API Health</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                  {JSON.stringify(apiHealth, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default HealthOdds;
