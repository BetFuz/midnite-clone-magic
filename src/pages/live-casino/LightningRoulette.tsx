import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

const LightningRoulette = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-3xl font-bold text-foreground">Lightning Roulette</h1>
            <Badge className="bg-destructive">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
              LIVE
            </Badge>
          </div>

          <Card className="p-6 bg-card border-border mb-6">
            <div className="aspect-video bg-gradient-card rounded-lg mb-4 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-xl mb-2">🎰</div>
                <div>Live Table View</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Dealer</div>
                <div className="text-lg font-bold text-foreground">Sarah</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Stakes</div>
                <div className="text-lg font-bold text-foreground">{formatCurrency(100)} - {formatCurrency(5000000)}</div>
              </div>
              <Badge variant="secondary">
                <Users className="h-4 w-4 mr-1" />
                847 players
              </Badge>
            </div>
          </Card>

          <Card className="p-5 bg-card border-border mb-4">
            <h3 className="font-bold text-foreground mb-3">Recent Numbers</h3>
            <div className="flex gap-2 flex-wrap">
              {[32, 15, 19, 4, 21, 2, 25, 17, 34, 6].map((num) => (
                <div key={num} className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  {num}
                </div>
              ))}
            </div>
          </Card>

          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg font-bold">
            Join Table
          </Button>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default LightningRoulette;
