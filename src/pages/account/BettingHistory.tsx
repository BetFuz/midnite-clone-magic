import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";

const BettingHistory = () => {
  const bets = [
    { id: "#BET001", date: "Today 14:30", event: "Man United vs Liverpool", stake: 2500, odds: "3.60", status: "won", returns: 9000 },
    { id: "#BET002", date: "Today 12:00", event: "Arsenal vs Chelsea", stake: 1250, odds: "1.97", status: "lost", returns: 0 },
    { id: "#BET003", date: "Yesterday", event: "Real Madrid vs Barcelona", stake: 5000, odds: "2.15", status: "won", returns: 10750 },
    { id: "#BET004", date: "Yesterday", event: "Bayern vs Dortmund", stake: 3750, odds: "1.85", status: "pending", returns: null },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Betting History</h1>
          <div className="space-y-4">
            {bets.map((bet) => (
              <Card key={bet.id} className="p-5 bg-card border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-muted-foreground">{bet.id}</span>
                      <Badge className={bet.status === 'won' ? 'bg-success' : bet.status === 'lost' ? 'bg-destructive' : 'bg-primary'}>
                        {bet.status.toUpperCase()}
                      </Badge>
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{bet.event}</h3>
                    <p className="text-sm text-muted-foreground">{bet.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Returns</div>
                    <div className="text-lg font-bold text-foreground">
                      {bet.returns !== null ? formatCurrency(bet.returns) : "-"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div><span className="text-muted-foreground">Stake:</span> {formatCurrency(bet.stake)}</div>
                  <div><span className="text-muted-foreground">Odds:</span> {bet.odds}</div>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BettingHistory;
