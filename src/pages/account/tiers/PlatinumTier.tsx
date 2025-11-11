import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, TrendingUp, Gift, Trophy, Target, Zap, Star, Crown } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-gray-500/5 to-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 md:ml-64 mb-20 md:mb-0">
          <div className="max-w-5xl mx-auto space-y-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/account/leaderboard")} 
              className="mb-4 hover:bg-gray-500/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leaderboard
            </Button>

            {/* Hero Trophy Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-300/20 via-gray-400/10 to-gray-500/5 p-8 md:p-12 border-2 border-gray-400/40 shadow-2xl">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <Sparkles className="absolute top-10 right-10 h-8 w-8 text-gray-300/30 animate-pulse" />
                <Star className="absolute bottom-20 left-10 h-6 w-6 text-gray-400/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <Zap className="absolute top-1/2 right-20 h-10 w-10 text-gray-300/20 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
              
              <div className="relative z-10 text-center">
                {/* Trophy Icon */}
                <div className="inline-block relative mb-6 animate-bounce" style={{ animationDuration: '2s' }}>
                  <div className="absolute inset-0 bg-gray-300/20 blur-3xl rounded-full"></div>
                  <Trophy className="relative h-24 w-24 md:h-32 md:w-32 text-gray-300 drop-shadow-2xl" />
                  <Sparkles className="absolute -top-2 -right-2 h-12 w-12 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                </div>

                {/* Title */}
                <div className="mb-6">
                  <div className="inline-block bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-clip-text text-transparent mb-2">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight">
                      PLATINUM
                    </h1>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-400"></div>
                    <Badge className="bg-gray-400/30 text-gray-200 border-gray-300/50 text-base md:text-lg px-6 py-2 shadow-lg">
                      ✨ Elite Excellence ✨
                    </Badge>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-400"></div>
                  </div>
                </div>

                {/* Reward Amount - Big & Bold */}
                <div className="mb-8">
                  <p className="text-gray-400 text-sm md:text-base uppercase tracking-wider mb-2">Weekly Reward</p>
                  <div className="inline-block bg-gradient-to-r from-gray-300/10 to-gray-400/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-gray-300/30 shadow-xl">
                    <div className="text-6xl md:text-7xl font-black text-gray-200 drop-shadow-lg">
                      ₦30,000
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-3">+ Elite Badge & Premium Benefits</p>
                </div>
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

            {/* Benefits Card - Redesigned */}
            <Card className="bg-gradient-to-br from-card to-card/50 border-gray-400/20 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gray-400/20">
                    <Trophy className="h-6 w-6 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Exclusive Benefits</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="group p-4 rounded-xl bg-gradient-to-br from-gray-400/10 to-transparent border border-gray-400/20 hover:border-gray-300/40 transition-all hover:scale-105">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-gray-400 shrink-0 mt-0.5 group-hover:text-gray-300 transition-colors" />
                        <span className="text-sm font-medium text-foreground">{benefit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quotes Section - Modernized */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gray-400/20">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Words of Wisdom</h2>
              </div>
              {quotes.map((quote, index) => (
                <Card key={index} className="bg-gradient-to-r from-gray-400/10 via-transparent to-transparent border-l-4 border-gray-400 hover:border-gray-300 transition-all shadow-lg hover:shadow-xl">
                  <CardContent className="p-8">
                    <div className="flex gap-4">
                      <div className="text-6xl text-gray-400/20 leading-none">"</div>
                      <div className="flex-1">
                        <p className="text-foreground italic text-xl leading-relaxed mb-4">
                          {quote.text}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="h-px flex-1 bg-gradient-to-r from-gray-400/50 to-transparent"></div>
                          <p className="text-muted-foreground font-bold">— {quote.author}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Card - Big & Bold */}
            <Card className="bg-gradient-to-br from-gray-400/20 via-gray-500/10 to-gray-600/5 border-2 border-gray-400/40 shadow-2xl">
              <CardContent className="p-12 text-center">
                <div className="inline-block relative mb-6 animate-bounce" style={{ animationDuration: '2s' }}>
                  <div className="absolute inset-0 bg-gray-300/30 blur-2xl rounded-full"></div>
                  <Trophy className="relative h-16 w-16 text-gray-300 mx-auto drop-shadow-xl" />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                  Push for Diamond! 💎
                </h3>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  You're among the elite! Just <span className="text-blue-400 font-bold">2,500 points</span> away from Diamond tier. Keep betting smart and reach the ultimate championship level!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/account/leaderboard")} 
                    className="bg-gray-400 hover:bg-gray-500 text-background font-bold text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                  >
                    <Trophy className="h-5 w-5 mr-2" />
                    View Leaderboard
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate("/")} 
                    className="border-2 border-gray-400 text-foreground font-bold text-lg px-8 py-6 rounded-xl hover:bg-gray-400/10"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Start Betting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlatinumTier;
