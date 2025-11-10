import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Ascot = () => {
  const handleViewCard = (raceName: string, time: string) => {
    toast({
      title: "Race Card",
      description: `Viewing ${raceName} at ${time}`,
    });
  };

  const races = [
    { time: "14:10", name: "Maiden Stakes", distance: "1m", runners: 12, going: "Good to Firm" },
    { time: "14:45", name: "Handicap Chase", distance: "2m 4f", runners: 8, going: "Good to Firm" },
    { time: "15:20", name: "Listed Race", distance: "6f", runners: 10, going: "Good to Firm" },
    { time: "15:55", name: "Group 3", distance: "1m 2f", runners: 9, going: "Good to Firm" },
    { time: "16:30", name: "Novices Hurdle", distance: "2m", runners: 11, going: "Good to Firm" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-2">Ascot Racecourse</h1>
          <p className="text-muted-foreground mb-6">Royal Ascot, Berkshire, UK</p>
          <div className="grid gap-4">
            {races.map((race, i) => (
              <Card key={i} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-2xl font-bold text-primary mb-1">{race.time}</div>
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

export default Ascot;
