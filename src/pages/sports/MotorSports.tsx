import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MotorSports = () => {
  const races = [
    { name: "Monaco Grand Prix", series: "Formula 1", date: "May 26", location: "Monte Carlo" },
    { name: "Italian Grand Prix", series: "MotoGP", date: "Jun 2", location: "Mugello" },
    { name: "Le Mans 24 Hours", series: "Endurance", date: "Jun 10-11", location: "France" },
    { name: "Rally Finland", series: "WRC", date: "Jul 28-30", location: "Jyväskylä" },
    { name: "Indianapolis 500", series: "IndyCar", date: "May 28", location: "Indianapolis" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Motor Sports Betting</h1>
          <div className="grid gap-4">
            {races.map((race) => (
              <Card key={race.name} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-foreground">{race.name}</h3>
                  <Badge variant="secondary">{race.series}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{race.location}</p>
                  <Badge className="bg-primary">{race.date}</Badge>
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

export default MotorSports;
