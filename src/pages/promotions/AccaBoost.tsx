import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Target, Award, CheckCircle2, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useNavigate } from "react-router-dom";

const AccaBoost = () => {
  const navigate = useNavigate();

  const boostTiers = [
    { selections: "5+", boost: "+10%", color: "from-blue-500/20 to-blue-600/20", borderColor: "border-blue-500/30" },
    { selections: "10+", boost: "+20%", color: "from-green-500/20 to-green-600/20", borderColor: "border-green-500/30" },
    { selections: "15+", boost: "+35%", color: "from-orange-500/20 to-orange-600/20", borderColor: "border-orange-500/30" },
    { selections: "20+", boost: "+50%", color: "from-purple-500/20 to-purple-600/20", borderColor: "border-purple-500/30" },
  ];

  const exampleBets = [
    { selections: 5, stake: 10000, odds: 25.5, normalWin: 255000, boostedWin: 280500, boost: 10 },
    { selections: 10, stake: 5000, odds: 150.0, normalWin: 750000, boostedWin: 900000, boost: 20 },
    { selections: 15, stake: 2000, odds: 500.0, normalWin: 1000000, boostedWin: 1350000, boost: 35 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-5xl mx-auto">
            {/* Hero Section */}
            <div className="relative mb-8 overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-success via-green-600 to-success opacity-90" />
              <div className="relative p-8 md:p-12">
                <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Zap className="h-3 w-3 mr-1" />
                  Daily Promotion
                </Badge>
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-10 w-10 text-white" />
                  <h1 className="text-4xl md:text-6xl font-bold text-white animate-fade-in">
                    Acca Boost
                  </h1>
                </div>
                <p className="text-2xl md:text-3xl text-white mb-6">
                  Get up to <span className="font-bold text-4xl">50% Extra</span> on Your Winning Accumulators
                </p>
                <p className="text-xl text-white/90 mb-8 max-w-2xl">
                  The more selections you add to your accumulator, the bigger your boost! 
                  Turn big wins into massive wins with Acca Boost.
                </p>
                <Button 
                  size="lg" 
                  className="bg-white text-success font-bold hover:bg-white/90 hover:scale-105 transition-transform gap-2"
                  onClick={() => navigate("/")}
                >
                  <Target className="h-5 w-5" />
                  Start Building Your Acca
                </Button>
              </div>
            </div>

            {/* Boost Tiers */}
            <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              Boost Tiers
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {boostTiers.map((tier, i) => (
                <Card 
                  key={i} 
                  className={`p-6 bg-gradient-to-br ${tier.color} ${tier.borderColor} border-2 hover:scale-105 transition-transform cursor-pointer`}
                >
                  <div className="text-center">
                    <div className="text-5xl font-bold text-foreground mb-2">{tier.selections}</div>
                    <div className="text-sm text-muted-foreground mb-3">Selections</div>
                    <Badge variant="default" className="text-lg px-4 py-1 bg-success hover:bg-success">
                      {tier.boost}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-2">Bonus</div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Example Calculations */}
            <Card className="p-8 bg-gradient-card border-border mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Calculator className="h-8 w-8 text-primary" />
                Example Wins
              </h2>
              <div className="space-y-4">
                {exampleBets.map((bet, i) => (
                  <Card key={i} className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
                    <div className="grid md:grid-cols-5 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Selections</div>
                        <div className="text-2xl font-bold text-foreground">{bet.selections}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Stake</div>
                        <div className="text-lg font-semibold text-foreground">{formatCurrency(bet.stake)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Total Odds</div>
                        <div className="text-lg font-semibold text-foreground">{bet.odds.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Normal Win</div>
                        <div className="text-lg font-semibold text-foreground">{formatCurrency(bet.normalWin)}</div>
                      </div>
                      <div className="bg-success/10 rounded-lg p-3">
                        <div className="text-sm text-success mb-1 font-semibold flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Boosted Win (+{bet.boost}%)
                        </div>
                        <div className="text-xl font-bold text-success">{formatCurrency(bet.boostedWin)}</div>
                        <div className="text-xs text-success/80 mt-1">
                          Extra: {formatCurrency(bet.boostedWin - bet.normalWin)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* How It Works */}
            <Card className="p-8 bg-card border-border mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-6">How It Works</h2>
              <div className="grid gap-4">
                {[
                  "Add 5 or more selections to your bet slip with minimum odds of 1.20 per selection",
                  "Your boost is automatically applied based on the number of selections",
                  "If your accumulator wins, the boost is added to your winnings",
                  "Available on all sports and leagues - pre-match and in-play",
                  "Maximum boost of ₦500,000 per bet slip",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-1" />
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Terms */}
            <Card className="p-8 bg-muted/50 border-border">
              <h3 className="text-xl font-bold text-foreground mb-4">Terms & Conditions</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Minimum 5 selections required, each at odds of 1.20 or greater</li>
                <li>• Maximum boost amount of {formatCurrency(500000)} per bet slip</li>
                <li>• Available on pre-match and in-play bets across all sports</li>
                <li>• Boost calculated on net winnings (stake not included)</li>
                <li>• Acca Insurance and Acca Boost cannot be combined on the same bet</li>
                <li>• Betfuz reserves the right to void boosts if terms are breached</li>
                <li>• 18+ BeGambleAware.org. Terms apply.</li>
              </ul>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AccaBoost;
