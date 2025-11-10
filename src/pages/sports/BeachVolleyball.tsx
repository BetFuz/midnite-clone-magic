import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";

const BeachVolleyball = () => {
  const matches = [
    { team1: "USA (April Ross/Alix Klineman)", team2: "Brazil (Ana Patricia/Rebecca)", tournament: "FIVB World Tour", time: "Today 14:00" },
    { team1: "Norway (Anders Mol/Christian Sørum)", team2: "Qatar (Cherif Younousse/Ahmed Tijan)", tournament: "FIVB World Tour", time: "Today 16:30" },
    { team1: "Germany (Laura Ludwig/Maggie Kozuch)", team2: "Canada (Melissa Humana-Paredes/Sarah Pavan)", tournament: "Beach Pro Tour", time: "Tomorrow 13:00" },
    { team1: "Poland (Michał Bryl/Bartosz Łosiak)", team2: "Latvia (Mārtiņš Pļaviņš/Edgars Tocs)", tournament: "Beach Pro Tour", time: "Tomorrow 15:30" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Beach Volleyball Betting</h1>
          <div className="grid gap-4">
            {matches.map((match, i) => (
              <Card key={i} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <h3 className="text-lg font-bold text-foreground mb-2">{match.team1} vs {match.team2}</h3>
                <p className="text-sm text-muted-foreground mb-1">{match.tournament}</p>
                <p className="text-sm text-primary">{match.time}</p>
              </Card>
            ))}
          </div>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default BeachVolleyball;
