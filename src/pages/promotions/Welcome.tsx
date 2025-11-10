import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import { Gift, CheckCircle2, Clock, Sparkles, ArrowRight, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { SocialProofStats } from "@/components/promotions/SocialProofStats";
import { RecentWinners } from "@/components/promotions/RecentWinners";
import { PromotionFAQ } from "@/components/promotions/PromotionFAQ";
import { PromoCodeInput } from "@/components/promotions/PromoCodeInput";
import { ReferralGenerator } from "@/components/promotions/ReferralGenerator";

const Welcome = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });
  const [spotsLeft] = useState(Math.floor(Math.random() * 10) + 3);
  
  const handleClaimOffer = async () => {
    // Send to n8n webhook
    const webhookUrl = localStorage.getItem("webhook_promotion_claim");
    
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            event: "promotion_claim",
            promotion: "welcome_bonus",
            timestamp: new Date().toISOString(),
            amount: 15000,
          }),
        });
      } catch (error) {
        console.error("Webhook error:", error);
      }
    }

    toast({
      title: "Redirecting to Sign Up",
      description: "Complete your registration to claim your welcome bonus",
    });
    
    setTimeout(() => navigate("/auth"), 500);
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
            <div className="relative mb-8 overflow-hidden rounded-3xl shadow-2xl">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-[image:var(--gradient-elite)]" />
              
              {/* Subtle Pattern Overlay */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
              
              <div className="relative p-8 md:p-16">
                {/* Badge */}
                <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm px-4 py-1.5">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Exclusive New Customer Offer
                </Badge>
                
                {/* Main Heading */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight">
                  Welcome to Betfuz
                </h1>
                
                {/* Bonus Amount */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight">
                      {formatCurrency(15000)}
                    </span>
                  </div>
                  <span className="text-xl md:text-2xl text-white/80 font-medium">in Free Bets</span>
                </div>
                
                {/* Description */}
                <p className="text-base md:text-lg text-white/80 mb-10 max-w-2xl leading-relaxed">
                  Place your first bet of {formatCurrency(5000)} and receive {formatCurrency(15000)} in free bets. 
                  Start your winning journey with us today.
                </p>
                
                {/* Countdown Timer */}
                <div className="inline-flex items-center gap-6 mb-10 bg-black/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-white/70" />
                    <span className="text-white/70 text-sm font-medium">Offer expires in</span>
                  </div>
                  <div className="flex gap-3">
                    {[
                      { value: timeLeft.hours, label: 'hours' },
                      { value: timeLeft.minutes, label: 'minutes' },
                      { value: timeLeft.seconds, label: 'seconds' }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[70px] text-center border border-white/10">
                          <div className="text-3xl font-bold text-white tabular-nums">{String(item.value).padStart(2, '0')}</div>
                        </div>
                        <div className="text-xs text-white/50 mt-1.5 font-medium">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-foreground font-bold hover:bg-white/95 shadow-xl hover:shadow-2xl transition-all gap-2 text-base md:text-lg px-10 py-6 rounded-xl"
                    onClick={handleClaimOffer}
                  >
                    Claim Your Bonus
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <span className="text-white/60 text-sm">Limited availability • {spotsLeft} spots remaining</span>
                </div>
              </div>
            </div>

            {/* Social Proof Stats */}
            <SocialProofStats />

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-6 mt-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Features Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <Card className="p-8 bg-gradient-card border-border">
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

                {/* Promo Code Input */}
                <PromoCodeInput 
                  webhookUrl={localStorage.getItem("webhook_promo_code") || undefined}
                />

                {/* FAQ */}
                <PromotionFAQ />

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

              {/* Sidebar */}
              <div className="space-y-6">
                <RecentWinners />
                <ReferralGenerator />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Welcome;
