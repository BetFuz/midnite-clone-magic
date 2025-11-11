import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, ArrowLeft, Sparkles, TrendingUp, Gift, Trophy, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DiamondTier = () => {
  const navigate = useNavigate();

  const benefits = [
    "Priority customer support 24/7",
    "Exclusive VIP betting tips",
    "Higher betting limits",
    "Early access to new features",
    "Personal account manager",
    "Exclusive tournament invitations"
  ];

  const quotes = [
    {
      text: "Champions aren't made in gyms. Champions are made from something they have deep inside them—a desire, a dream, a vision.",
      author: "Muhammad Ali"
    },
    {
      text: "The difference between impossible and possible lies in determination.",
      author: "Tommy Lasorda"
    },
    {
      text: "Excellence is not a singular act but a habit. You are what you repeatedly do.",
      author: "Aristotle"
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
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate("/account/leaderboard")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leaderboard
            </Button>

            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-transparent p-8 md:p-12 border-2 border-blue-500/30">
              <div className="absolute top-4 right-4">
                <Sparkles className="h-12 w-12 text-blue-400 animate-pulse" />
              </div>
              <div className="relative z-10">
                <Crown className="h-16 w-16 text-blue-400 mb-4" />
                <h1 className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                  Diamond Tier
                </h1>
                <p className="text-xl text-blue-300 mb-4">The Elite of Champions</p>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-lg px-4 py-2">
                  Premium Badge Holder
                </Badge>
              </div>
            </div>

            {/* Requirements & Rewards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-blue-400" />
                    <h2 className="text-xl font-bold text-foreground">Requirements</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Minimum Points</span>
                      <span className="font-bold text-foreground text-lg">10,000+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Weekly Reset</span>
                      <span className="font-semibold text-foreground">Every Monday</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rank Required</span>
                      <span className="font-semibold text-foreground">Top 1-10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="h-5 w-5 text-blue-400" />
                    <h2 className="text-xl font-bold text-foreground">Rewards</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cash Prize</span>
                      <span className="font-bold text-blue-400 text-2xl">₦50,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Badge Status</span>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                        Premium
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Bonus Points</span>
                      <span className="font-semibold text-success">+500 weekly</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exclusive Benefits */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-blue-400" />
                  <h2 className="text-xl font-bold text-foreground">Exclusive Benefits</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border"
                    >
                      <Sparkles className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Motivational Quotes */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-400" />
                Words of Champions
              </h2>
              {quotes.map((quote, index) => (
                <Card key={index} className="bg-gradient-to-r from-blue-500/5 to-transparent border-l-4 border-blue-400">
                  <CardContent className="p-6">
                    <p className="text-foreground italic text-lg mb-3">
                      "{quote.text}"
                    </p>
                    <p className="text-muted-foreground font-semibold">
                      — {quote.author}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call to Action */}
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  You're at the Top!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Stay consistent, keep winning, and maintain your elite status. The crown is yours to keep!
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/account/leaderboard")}
                  className="bg-blue-500 hover:bg-blue-600"
                >
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

export default DiamondTier;
