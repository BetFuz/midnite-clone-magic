import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Cricket = () => {
  const matches = [
    { teams: "England vs Australia", format: "Test", status: "Live", day: "Day 3" },
    { teams: "India vs Pakistan", format: "ODI", status: "Tomorrow", time: "14:00" },
    { teams: "South Africa vs New Zealand", format: "T20", status: "Today", time: "18:30" },
    { teams: "West Indies vs Sri Lanka", format: "Test", status: "Day 2", live: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Cricket Betting</h1>
          <div className="grid gap-4">
            {matches.map((match, i) => (
              <Card key={i} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{match.teams}</h3>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{match.format}</Badge>
                      {match.live && <Badge className="bg-destructive">LIVE</Badge>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">{match.status}</div>
                    {match.time && <div className="text-sm font-medium">{match.time}</div>}
                  </div>
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

export default Cricket;
