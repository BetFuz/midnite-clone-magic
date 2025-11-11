import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, TrendingUp, Gift, Target, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RookieTier = () => {
  const navigate = useNavigate();

  const tips = [
    "Start with small, informed bets",
    "Learn from every outcome",
    "Track your betting patterns",
    "Join the community for tips"
  ];

  const quotes = [
    {
      text: "A journey of a thousand miles begins with a single step.",
      author: "Lao Tzu"
    },
    {
      text: "You don't have to be great to start, but you have to start to be great.",
      author: "Zig Ziglar"
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt"
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

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 via-green-600/10 to-transparent p-8 md:p-12 border-2 border-green-500/30">
              <div className="absolute top-4 right-4">
                <Rocket className="h-12 w-12 text-green-500 animate-pulse" />
              </div>
              <div className="relative z-10">
                <Star className="h-16 w-16 text-green-500 mb-4" />
                <h1 className="text-4xl md:text-5xl font-bold text-green-500 mb-2">
                  Rookie Tier
                </h1>
                <p className="text-xl text-green-600 mb-4">Your Journey Begins</p>
                <Badge className="bg-green-500/20 text-green-500 border-green-500/50 text-lg px-4 py-2">
                  Starter Badge Holder
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-green-500" />
                    <h2 className="text-xl font-bold text-foreground">Requirements</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Points Range</span>
                      <span className="font-bold text-foreground text-lg">0 - 999</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Next Tier</span>
                      <span className="font-semibold text-amber-600">Bronze (1,000)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="h-5 w-5 text-green-500" />
                    <h2 className="text-xl font-bold text-foreground">Rewards</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cash Prize</span>
                      <span className="font-bold text-green-500 text-2xl">₦2,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Badge Status</span>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                        Starter
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Rocket className="h-5 w-5 text-green-500" />
                  <h2 className="text-xl font-bold text-foreground">Getting Started Tips</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                      <Star className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
                Words for Beginners
              </h2>
              {quotes.map((quote, index) => (
                <Card key={index} className="bg-gradient-to-r from-green-500/5 to-transparent border-l-4 border-green-500">
                  <CardContent className="p-6">
                    <p className="text-foreground italic text-lg mb-3">"{quote.text}"</p>
                    <p className="text-muted-foreground font-semibold">— {quote.author}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
              <CardContent className="p-8 text-center">
                <Rocket className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Welcome to Betfuz!</h3>
                <p className="text-muted-foreground mb-6">
                  Every champion started where you are now. Your first 1,000 points await! Start betting, learn, and climb the ranks to Bronze tier!
                </p>
                <Button size="lg" onClick={() => navigate("/account/leaderboard")} className="bg-green-500 hover:bg-green-600">
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

export default RookieTier;
