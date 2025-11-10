import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Boxing = () => {
  const fights = [
    { fighter1: "Tyson Fury", fighter2: "Oleksandr Usyk", date: "Feb 17", division: "Heavyweight", title: true },
    { fighter1: "Canelo Alvarez", fighter2: "Jermall Charlo", date: "Mar 23", division: "Super Middleweight", title: true },
    { fighter1: "Terence Crawford", fighter2: "Errol Spence Jr", date: "Apr 15", division: "Welterweight", title: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Boxing Betting</h1>
          <div className="grid gap-4">
            {fights.map((fight, i) => (
              <Card key={i} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-foreground">{fight.fighter1} vs {fight.fighter2}</h3>
                  {fight.title && <Badge className="bg-primary">TITLE FIGHT</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{fight.division} • {fight.date}</p>
              </Card>
            ))}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Boxing;
