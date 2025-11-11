import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowLeft, TrendingUp, Gift, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GoldTier = () => {
  const navigate = useNavigate();

  const benefits = [
    "Priority support",
    "Weekly betting tips",
    "Enhanced odds boost",
    "Exclusive tournaments"
  ];

  const quotes = [
    {
      text: "Gold medals aren't really made of gold. They're made of sweat, determination, and a hard-to-find alloy called guts.",
      author: "Dan Gable"
    },
    {
      text: "Winning isn't everything, but wanting to win is.",
      author: "Vince Lombardi"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 md:ml-64 mb-20 md:mb-0">
          <div className="max-w-4xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => navigate("/account/leaderboard")} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leaderboard
            </Button>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/20 via-yellow-600/10 to-transparent p-8 md:p-12 border-2 border-yellow-500/30">
              <div className="absolute top-4 right-4">
                <Zap className="h-12 w-12 text-yellow-400 animate-pulse" />
              </div>
              <div className="relative z-10">
                <Trophy className="h-16 w-16 text-yellow-400 mb-4" />
                <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
                  Gold Tier
                </h1>
                <p className="text-xl text-yellow-500 mb-4">Golden Achievement</p>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-lg px-4 py-2">
                  Gold Badge Holder
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-xl font-bold text-foreground">Requirements</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Minimum Points</span>
                      <span className="font-bold text-foreground text-lg">5,000+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Next Tier</span>
                      <span className="font-semibold text-gray-300">Platinum (7,500)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="h-5 w-5 text-yellow-400" />
                    <h2 className="text-xl font-bold text-foreground">Rewards</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cash Prize</span>
                      <span className="font-bold text-yellow-400 text-2xl">₦20,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Badge Status</span>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                        Gold
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-bold text-foreground">Benefits</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                      <Zap className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-yellow-500" />
                Golden Words
              </h2>
              {quotes.map((quote, index) => (
                <Card key={index} className="bg-gradient-to-r from-yellow-500/5 to-transparent border-l-4 border-yellow-500">
                  <CardContent className="p-6">
                    <p className="text-foreground italic text-lg mb-3">"{quote.text}"</p>
                    <p className="text-muted-foreground font-semibold">— {quote.author}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/30">
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Aim for Platinum!</h3>
                <p className="text-muted-foreground mb-6">
                  You're doing great! Just 2,500 more points to reach Platinum tier. Keep the momentum going!
                </p>
                <Button size="lg" onClick={() => navigate("/account/leaderboard")} className="bg-yellow-500 hover:bg-yellow-600">
                  View Leaderboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GoldTier;
