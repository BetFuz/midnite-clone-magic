import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, RefreshCw, Database, Check } from "lucide-react";

export default function PlayerSeeding() {
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  const sports = [
    { name: 'Football', label: 'Football (Soccer)' },
    { name: 'NFL', label: 'American Football (NFL)' },
    { name: 'NBA', label: 'Basketball (NBA)' },
    { name: 'NHL', label: 'Ice Hockey (NHL)' },
    { name: 'Cricket', label: 'Cricket' },
    { name: 'Tennis', label: 'Tennis' },
    { name: 'Baseball', label: 'Baseball (MLB)' },
  ];

  const seedAllSports = async () => {
    setSeeding(true);
    setProgress({});

    for (const sport of sports) {
      try {
        setProgress(prev => ({ ...prev, [sport.name]: false }));

        const { data, error } = await supabase.functions.invoke('fantasy-player-projections', {
          body: { sport: sport.name, leagueId: 'seed-all' }
        });

        if (error) throw error;

        setProgress(prev => ({ ...prev, [sport.name]: true }));
        toast.success(`Seeded ${data.count} players for ${sport.label}`);
      } catch (error) {
        console.error(`Error seeding ${sport.name}:`, error);
        toast.error(`Failed to seed ${sport.label}`);
      }
    }

    setSeeding(false);
    toast.success('All sports seeded successfully!');
  };

  const clearAllPlayers = async () => {
    if (!confirm('Are you sure you want to delete all fantasy players? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('fantasy_players')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      toast.success('All players cleared successfully');
      setProgress({});
    } catch (error) {
      console.error('Error clearing players:', error);
      toast.error('Failed to clear players');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 md:ml-64 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Fantasy Player Seeding</h1>
                <p className="text-muted-foreground">
                  Manage and seed player data for all fantasy sports
                </p>
              </div>
              <Badge variant="outline" className="gap-2">
                <Database className="h-4 w-4" />
                Admin Tool
              </Badge>
            </div>

            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Button
                    size="lg"
                    onClick={seedAllSports}
                    disabled={seeding}
                    className="gap-2"
                  >
                    {seeding ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Seeding...
                      </>
                    ) : (
                      <>
                        <Users className="h-5 w-5" />
                        Seed All Sports
                      </>
                    )}
                  </Button>

                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={clearAllPlayers}
                    disabled={seeding}
                    className="gap-2"
                  >
                    <Database className="h-5 w-5" />
                    Clear All Players
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sports.map((sport) => (
                    <Card
                      key={sport.name}
                      className={`p-4 ${
                        progress[sport.name] ? 'border-success bg-success/5' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{sport.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {sport.name}
                          </p>
                        </div>
                        {progress[sport.name] && (
                          <Check className="h-6 w-6 text-success" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="p-4 bg-muted/30">
                  <h3 className="font-semibold mb-2">Instructions</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Click "Seed All Sports" to populate realistic player data for all sports</li>
                    <li>• Each sport will generate 20-35 real player names with positions, salaries, and projections</li>
                    <li>• Players are automatically assigned based on sport type</li>
                    <li>• Use "Clear All Players" to reset and start fresh</li>
                  </ul>
                </Card>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
