import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MMA = () => {
  const events = [
    { name: "UFC 300", mainEvent: "Jones vs Miocic", date: "Mar 16", location: "Las Vegas" },
    { name: "UFC Fight Night", mainEvent: "Aspinall vs Pavlovich", date: "Mar 23", location: "London" },
    { name: "Bellator 312", mainEvent: "Pitbull vs McKee", date: "Apr 6", location: "Dublin" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">MMA Betting</h1>
          <div className="grid gap-4">
            {events.map((event) => (
              <Card key={event.name} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-foreground">{event.name}</h3>
                  <Badge variant="secondary">{event.date}</Badge>
                </div>
                <p className="text-base text-foreground mb-2">Main Event: {event.mainEvent}</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </Card>
            ))}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default MMA;
