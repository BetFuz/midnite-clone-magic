import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, TrendingUp, Gift, Trophy, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PlatinumTier = () => {
  const navigate = useNavigate();

  const benefits = [
    "24/7 premium support",
    "Advanced betting insights",
    "Increased withdrawal limits",
    "Exclusive promotions access",
    "Monthly bonus rewards"
  ];

  const quotes = [
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill"
    },
    {
      text: "The only limit to our realization of tomorrow will be our doubts of today.",
      author: "Franklin D. Roosevelt"
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

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-400/20 via-gray-500/10 to-transparent p-8 md:p-12 border-2 border-gray-400/30">
              <div className="absolute top-4 right-4">
                <Sparkles className="h-12 w-12 text-gray-300 animate-pulse" />
              </div>
              <div className="relative z-10">
                <Sparkles className="h-16 w-16 text-gray-300 mb-4" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-300 mb-2">
                  Platinum Tier
                </h1>
                <p className="text-xl text-gray-400 mb-4">Elite Excellence</p>
                <Badge className="bg-gray-400/20 text-gray-300 border-gray-400/50 text-lg px-4 py-2">
                  Elite Badge Holder
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-gray-400" />
                    <h2 className="text-xl font-bold text-foreground">Requirements</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Minimum Points</span>
                      <span className="font-bold text-foreground text-lg">7,500+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Next Tier</span>
                      <span className="font-semibold text-blue-400">Diamond (10,000)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-400/10 to-gray-500/5 border-gray-400/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="h-5 w-5 text-gray-300" />
                    <h2 className="text-xl font-bold text-foreground">Rewards</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cash Prize</span>
                      <span className="font-bold text-gray-300 text-2xl">₦30,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Badge Status</span>
                      <Badge className="bg-gray-400/20 text-gray-300 border-gray-400/50">
                        Elite
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-gray-400" />
                  <h2 className="text-xl font-bold text-foreground">Exclusive Benefits</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                      <Sparkles className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-gray-400" />
                Stay Motivated
              </h2>
              {quotes.map((quote, index) => (
                <Card key={index} className="bg-gradient-to-r from-gray-400/5 to-transparent border-l-4 border-gray-400">
                  <CardContent className="p-6">
                    <p className="text-foreground italic text-lg mb-3">"{quote.text}"</p>
                    <p className="text-muted-foreground font-semibold">— {quote.author}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-br from-gray-400/20 to-gray-500/10 border-gray-400/30">
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Push for Diamond!</h3>
                <p className="text-muted-foreground mb-6">
                  You're just 2,500 points away from the ultimate tier. Keep betting smart and climb higher!
                </p>
                <Button size="lg" onClick={() => navigate("/account/leaderboard")} className="bg-gray-500 hover:bg-gray-600">
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

export default PlatinumTier;
