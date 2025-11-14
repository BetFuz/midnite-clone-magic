import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Database } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const SeedData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-matches');
      
      if (error) throw error;

      toast({
        title: "Success!",
        description: `Seeded ${data.leagues_inserted} leagues and ${data.matches_inserted} matches`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to seed data",
        variant: "destructive",
      });
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
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-2">Seed Database</h1>
            <p className="text-muted-foreground mb-6">
              Populate the database with sample leagues and matches for testing
            </p>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Database className="h-8 w-8 text-primary mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Sample Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This will populate your database with:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                      <li>• Major football leagues (Premier League, La Liga, Bundesliga, Serie A, Ligue 1)</li>
                      <li>• Basketball leagues (NBA, EuroLeague)</li>
                      <li>• Tennis tournaments (ATP, Wimbledon)</li>
                      <li>• Sample matches spanning the next 14 days</li>
                      <li>• Realistic odds and match times</li>
                    </ul>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">
                      Warning: This will delete existing matches and replace them with sample data.
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={handleSeedData} 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Seeding Database...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Seed Database Now
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SeedData;
