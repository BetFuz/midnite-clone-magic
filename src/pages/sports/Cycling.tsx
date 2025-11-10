import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Cycling = () => {
  const races = [
    { name: "Tour de France", stage: "Stage 15 - Mountain", date: "Today", distance: "189km" },
    { name: "Giro d'Italia", stage: "Stage 12 - Flat", date: "Tomorrow", distance: "212km" },
    { name: "Vuelta a España", stage: "Stage 8 - Time Trial", date: "Next Week", distance: "42km" },
    { name: "Paris-Roubaix", stage: "Classic Race", date: "Apr 7", distance: "257km" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Cycling Betting</h1>
          <div className="grid gap-4">
            {races.map((race) => (
              <Card key={race.name} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{race.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{race.stage}</p>
                    <Badge variant="secondary">{race.distance}</Badge>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-primary">{race.date}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Cycling;
