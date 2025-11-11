import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, ArrowLeft, TrendingUp, Gift, Target, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SilverTier = () => {
  const navigate = useNavigate();

  const benefits = [
    "Enhanced support",
    "Weekly bonuses",
    "Special promotions",
    "Community access"
  ];

  const quotes = [
    {
      text: "It's not whether you get knocked down, it's whether you get up.",
      author: "Vince Lombardi"
    },
    {
      text: "The harder the battle, the sweeter the victory.",
      author: "Les Brown"
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

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-500/20 via-gray-600/10 to-transparent p-8 md:p-12 border-2 border-gray-500/30">
              <div className="absolute top-4 right-4">
                <Star className="h-12 w-12 text-gray-400 animate-pulse" />
              </div>
              <div className="relative z-10">
                <Award className="h-16 w-16 text-gray-400 mb-4" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-400 mb-2">
                  Silver Tier
                </h1>
                <p className="text-xl text-gray-500 mb-4">Rising Star</p>
                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50 text-lg px-4 py-2">
                  Silver Badge Holder
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-gray-500" />
                    <h2 className="text-xl font-bold text-foreground">Requirements</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Minimum Points</span>
                      <span className="font-bold text-foreground text-lg">2,500+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Next Tier</span>
                      <span className="font-semibold text-yellow-400">Gold (5,000)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 border-gray-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="h-5 w-5 text-gray-400" />
                    <h2 className="text-xl font-bold text-foreground">Rewards</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cash Prize</span>
                      <span className="font-bold text-gray-400 text-2xl">₦10,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Badge Status</span>
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
                        Silver
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-gray-500" />
                  <h2 className="text-xl font-bold text-foreground">Benefits</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                      <Star className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-gray-500" />
                Keep Climbing
              </h2>
              {quotes.map((quote, index) => (
                <Card key={index} className="bg-gradient-to-r from-gray-500/5 to-transparent border-l-4 border-gray-500">
                  <CardContent className="p-6">
                    <p className="text-foreground italic text-lg mb-3">"{quote.text}"</p>
                    <p className="text-muted-foreground font-semibold">— {quote.author}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-br from-gray-500/20 to-gray-600/10 border-gray-500/30">
              <CardContent className="p-8 text-center">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Push for Gold!</h3>
                <p className="text-muted-foreground mb-6">
                  You're making progress! Just 2,500 more points to reach the Gold tier. Keep betting smart!
                </p>
                <Button size="lg" onClick={() => navigate("/account/leaderboard")}>
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

export default SilverTier;
