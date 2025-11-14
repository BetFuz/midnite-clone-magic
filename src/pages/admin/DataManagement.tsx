import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Database, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DataManagement = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const refreshFootballMatches = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      toast({
        title: "Fetching live data...",
        description: "Connecting to The Odds API for latest matches",
      });

      const { data, error } = await supabase.functions.invoke('refresh-football-matches', {
        body: {}
      });

      if (error) throw error;

      setResult(data);
      
      toast({
        title: "✓ Data Updated!",
        description: `${data.matchesUpdated} matches refreshed from live API`,
      });
    } catch (error: any) {
      console.error('Error refreshing data:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not fetch live match data",
      });
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Data Management</h1>
              <p className="text-muted-foreground">
                Update live match data and odds from external APIs
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Football Matches & Odds
                </CardTitle>
                <CardDescription>
                  Fetch latest fixtures and odds for Premier League, La Liga, Bundesliga, 
                  Serie A, Ligue 1, and Champions League from The Odds API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Each refresh uses API credits. The Odds API provides 500 free requests per month.
                    This operation fetches 6 major leagues.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={refreshFootballMatches} 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Fetching Live Data...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Football Matches
                    </>
                  )}
                </Button>

                {result && (
                  <Card className={result.error ? "border-destructive" : "border-green-500"}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {result.error ? (
                          <>
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            Update Failed
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            Update Successful
                          </>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {result.error ? (
                        <div className="text-sm text-destructive">
                          <p className="font-medium">Error:</p>
                          <p>{result.error}</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Matches Updated</p>
                              <p className="text-2xl font-bold text-green-500">
                                {result.matchesUpdated}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Leagues Processed</p>
                              <p className="text-2xl font-bold">
                                {result.leaguesProcessed}
                              </p>
                            </div>
                          </div>
                          {result.errors && result.errors.length > 0 && (
                            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                              <p className="text-sm font-medium text-yellow-500 mb-2">
                                Partial Errors:
                              </p>
                              <ul className="text-xs space-y-1">
                                {result.errors.map((err: string, i: number) => (
                                  <li key={i} className="text-muted-foreground">• {err}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-4">
                            Updated at: {new Date(result.timestamp).toLocaleString()}
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <CardHeader>
                <CardTitle className="text-lg">💡 Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Refresh data once every 6-12 hours for optimal freshness</p>
                <p>• Match odds update automatically when matches are refreshed</p>
                <p>• The Odds API provides high-quality, reliable sports data</p>
                <p>• Set up automated refreshes using cron jobs or scheduled functions</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DataManagement;
