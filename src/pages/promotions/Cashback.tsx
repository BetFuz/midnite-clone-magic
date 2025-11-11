import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, ArrowRight, Calendar, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

const Cashback = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">Cashback Offers</h1>
                  <p className="text-muted-foreground">Get money back on losing bets every month</p>
                </div>
              </div>
            </div>

            <Card className="p-8 bg-gradient-to-br from-blue-500/10 via-blue-600/10 to-background border-2 border-blue-500/30 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    Get <span className="text-blue-500">10% Cashback</span>
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    On all losing bets placed during the month
                  </p>
                </div>
                <Badge className="bg-blue-500 text-white text-lg px-4 py-2">Monthly Offer</Badge>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-background p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Max Cashback</p>
                  <p className="text-2xl font-bold text-blue-500">{formatCurrency(50000)}</p>
                </div>
                <div className="bg-background p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Min Stake</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(5000)}</p>
                </div>
                <div className="bg-background p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Credited</p>
                  <p className="text-2xl font-bold text-foreground">Monthly</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border mb-6">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                How It Works
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Place Your Bets</h4>
                    <p className="text-sm text-muted-foreground">
                      Bet on any sport throughout the month with minimum stake of {formatCurrency(5000)} per bet
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Track Your Cashback</h4>
                    <p className="text-sm text-muted-foreground">
                      We calculate 10% of your net losses during the month (total stakes minus returns)
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Receive Your Cashback</h4>
                    <p className="text-sm text-muted-foreground">
                      Cashback credited to your account on the 1st of the following month - up to {formatCurrency(50000)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-muted/50 border-border">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Terms & Conditions</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Minimum bet stake: {formatCurrency(5000)}</li>
                    <li>• Maximum monthly cashback: {formatCurrency(50000)}</li>
                    <li>• Cashback calculated on net monthly losses</li>
                    <li>• Credited as bonus funds with 1x wagering requirement</li>
                    <li>• 18+ BeGambleAware.org. Terms apply.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Cashback;
