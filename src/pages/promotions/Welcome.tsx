import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-4">Welcome Bonus</h1>
            <Card className="p-8 bg-gradient-hero border-border/50 mb-6">
              <div className="text-white">
                <h2 className="text-5xl font-bold mb-4">Bet £10 Get £30</h2>
                <p className="text-xl mb-6">New customer offer. Place a £10 bet and receive £30 in free bets</p>
                <Button size="lg" className="bg-white text-primary font-bold hover:bg-white/90">Claim Offer</Button>
              </div>
            </Card>
            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-bold text-foreground">Terms & Conditions</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>New customers only. Min deposit £10</li>
                <li>Place a bet of £10 or more at odds of evens (2.0) or greater</li>
                <li>Receive 3x £10 free bet tokens</li>
                <li>Free bets valid for 7 days</li>
                <li>Stake not returned with winnings</li>
                <li>T&Cs apply. 18+ BeGambleAware</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Welcome;
