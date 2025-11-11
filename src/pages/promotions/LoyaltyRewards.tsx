import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Trophy, Star, Gift, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

const LoyaltyRewards = () => {
  const tiers = [
    { name: "Rookie", icon: Star, color: "bg-gray-500", pointsNeeded: 0, benefits: ["1 point per ₦100", "Basic support"] },
    { name: "Bronze", icon: Star, color: "bg-orange-700", pointsNeeded: 1000, benefits: ["1.2 points per ₦100", "Priority support"] },
    { name: "Silver", icon: Star, color: "bg-gray-400", pointsNeeded: 5000, benefits: ["1.5 points per ₦100", "Weekly bonuses"] },
    { name: "Gold", icon: Trophy, color: "bg-yellow-500", pointsNeeded: 15000, benefits: ["2 points per ₦100", "Exclusive promos"] },
    { name: "Platinum", icon: Trophy, color: "bg-purple-500", pointsNeeded: 50000, benefits: ["3 points per ₦100", "Personal manager"] },
    { name: "Diamond", icon: Zap, color: "bg-blue-400", pointsNeeded: 100000, benefits: ["5 points per ₦100", "VIP rewards"] },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">Loyalty Rewards</h1>
                  <p className="text-muted-foreground">Earn points with every bet and unlock exclusive rewards</p>
                </div>
              </div>
            </div>

            <Card className="p-8 bg-gradient-to-br from-purple-500/10 via-purple-600/10 to-background border-2 border-purple-500/30 mb-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Your Current Tier: <span className="text-purple-500">Rookie</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Earn <span className="text-purple-500 font-bold">1 point</span> for every {formatCurrency(100)} you bet
                </p>
              </div>
              
              <div className="bg-background p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Progress to Bronze</span>
                  <span className="text-sm font-semibold text-foreground">350 / 1,000 points</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 w-[35%]"></div>
                </div>
              </div>
            </Card>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-purple-500" />
                Reward Tiers
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tiers.map((tier, idx) => (
                  <Card key={idx} className="p-6 bg-card border-border hover:border-purple-500/50 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 ${tier.color} rounded-lg`}>
                        <tier.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-foreground">{tier.name}</h4>
                        <p className="text-sm text-muted-foreground">{tier.pointsNeeded.toLocaleString()} pts</p>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="p-6 bg-card border-border mb-6">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-500" />
                Redeem Your Points
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">Free Bet</h4>
                    <Badge className="bg-purple-500 text-white">500 pts</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{formatCurrency(5000)} free bet</p>
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                    Redeem
                  </Button>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">Bonus Cash</h4>
                    <Badge className="bg-purple-500 text-white">1000 pts</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{formatCurrency(15000)} bonus</p>
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                    Redeem
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-muted/50 border-border">
              <h3 className="font-bold text-foreground mb-2">How to Earn Points</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Bet on any sport to earn points based on your tier</li>
                <li>✓ Higher tiers earn more points per bet</li>
                <li>✓ Points are credited automatically after bet settlement</li>
                <li>✓ Redeem points for free bets, bonuses, and exclusive perks</li>
                <li>✓ 18+ BeGambleAware.org. Terms apply.</li>
              </ul>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoyaltyRewards;
