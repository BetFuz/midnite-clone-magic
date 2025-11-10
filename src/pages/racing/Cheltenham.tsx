import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const Cheltenham = () => {
  const handleViewCard = (raceName: string, time: string) => {
    toast({
      title: "Race Card",
      description: `Viewing ${raceName} at ${time}`,
    });
  };

  const races = [
    { time: "13:30", name: "Champion Hurdle", distance: "2m 87y", runners: 14, going: "Good", grade: "Grade 1", feature: true },
    { time: "14:10", name: "Champion Chase", distance: "2m", runners: 9, going: "Good", grade: "Grade 1", feature: true },
    { time: "14:50", name: "World Hurdle", distance: "3m 87y", runners: 11, going: "Good", grade: "Grade 1", feature: true },
    { time: "15:30", name: "Ryanair Chase", distance: "2m 4f 127y", runners: 8, going: "Good", grade: "Grade 1", feature: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">Cheltenham Festival</h1>
          <p className="text-muted-foreground mb-6">Prestbury Park, Gloucestershire, UK</p>
          <div className="grid gap-4">
            {races.map((race, i) => (
              <Card key={i} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-2xl font-bold text-primary">{race.time}</div>
                      {race.feature && <Badge className="bg-primary">FEATURE</Badge>}
                      <Badge variant="secondary">{race.grade}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{race.name}</h3>
                  </div>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleViewCard(race.name, race.time)}>View Card</Button>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{race.distance}</span>
                  <span>{race.runners} runners</span>
                  <span>Going: {race.going}</span>
                </div>
              </Card>
            ))}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Cheltenham;
