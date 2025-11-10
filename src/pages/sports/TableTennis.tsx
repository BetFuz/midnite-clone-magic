import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TableTennis = () => {
  const matches = [
    { player1: "Ma Long", player2: "Fan Zhendong", tournament: "WTT Champions", time: "Live", live: true },
    { player1: "Wang Chuqin", player2: "Liang Jingkun", tournament: "WTT Champions", time: "Today 16:00" },
    { player1: "Lin Gaoyuan", player2: "Hugo Calderano", tournament: "WTT Star Contender", time: "Today 17:30" },
    { player1: "Tomokazu Harimoto", player2: "Dimitrij Ovtcharov", tournament: "WTT Star Contender", time: "Tomorrow 14:00" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Table Tennis Betting</h1>
          <div className="grid gap-4">
            {matches.map((match, i) => (
              <Card key={i} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{match.player1} vs {match.player2}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{match.tournament}</p>
                    {match.live && <Badge className="bg-destructive">LIVE</Badge>}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-primary font-medium">{match.time}</div>
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

export default TableTennis;
