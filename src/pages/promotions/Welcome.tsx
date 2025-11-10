import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import { Gift, CheckCircle2, Clock, Sparkles, ArrowRight, Trophy } from "lucide-react";
import { useState, useEffect } from "react";

const Welcome = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });
  
  const handleClaimOffer = () => {
    navigate("/auth");
  };

  // Mock countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: Gift, title: "3x Free Bets", description: "Get 3 separate free bet tokens" },
    { icon: Clock, title: "7 Days Valid", description: "Use your free bets within a week" },
    { icon: Trophy, title: "All Sports", description: "Valid on any sport or league" },
    { icon: Sparkles, title: "Instant Credit", description: "Free bets credited immediately" },
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
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary opacity-90" />
              <div className="relative p-8 md:p-12">
                <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  New Customer Offer
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
                  Welcome to Betfuz
                </h1>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-5xl md:text-7xl font-bold text-white">
                    {formatCurrency(15000)}
                  </span>
                  <span className="text-2xl text-white/90">in Free Bets</span>
                </div>
                <p className="text-xl text-white/90 mb-8 max-w-2xl">
                  Place your first bet of {formatCurrency(5000)} and receive {formatCurrency(15000)} in free bets. 
                  Start your winning journey with us today!
                </p>
                
                {/* Countdown Timer */}
                <div className="flex items-center gap-4 mb-8">
                  <Clock className="h-5 w-5 text-white" />
                  <span className="text-white/90 text-sm">Offer ends in:</span>
                  <div className="flex gap-2">
                    {[
                      { value: timeLeft.hours, label: 'hrs' },
                      { value: timeLeft.minutes, label: 'min' },
                      { value: timeLeft.seconds, label: 'sec' }
                    ].map((item, i) => (
                      <div key={i} className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px] text-center">
                        <div className="text-2xl font-bold text-white">{String(item.value).padStart(2, '0')}</div>
                        <div className="text-xs text-white/70">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="bg-white text-primary font-bold hover:bg-white/90 hover:scale-105 transition-transform gap-2 text-lg px-8"
                  onClick={handleClaimOffer}
                >
                  Claim Your Bonus
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {features.map((feature, i) => (
                <Card key={i} className="p-6 bg-card border-border hover:border-primary/50 transition-all hover:shadow-lg">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-primary/10 rounded-full mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* How It Works */}
            <Card className="p-8 bg-gradient-card border-border mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Trophy className="h-8 w-8 text-primary" />
                How It Works
              </h2>
              <div className="grid gap-6">
                {[
                  { step: "01", title: "Sign Up", description: "Create your Betfuz account in under 2 minutes" },
                  { step: "02", title: "Make a Deposit", description: `Deposit at least ${formatCurrency(5000)} using any payment method` },
                  { step: "03", title: "Place Your Bet", description: `Bet ${formatCurrency(5000)} or more at minimum odds of 2.0` },
                  { step: "04", title: "Get Free Bets", description: `Receive 3x ${formatCurrency(5000)} free bet tokens instantly` },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-lg group-hover:bg-primary group-hover:text-white transition-colors">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Terms & Conditions */}
            <Card className="p-8 bg-card border-border">
              <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-success" />
                Terms & Conditions
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>New customers only. Minimum deposit {formatCurrency(5000)}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>Place a qualifying bet of {formatCurrency(5000)} or more at odds of 2.0 or greater</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>Receive 3x {formatCurrency(5000)} free bet tokens credited within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>Free bets are valid for 7 days from the date of issue</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>Free bet stake not returned with winnings. Only winnings are credited</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>One promotion per household. Full T&Cs apply. 18+ BeGambleAware.org</span>
                </li>
              </ul>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Welcome;
