import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Users, TrendingUp, Film, Music, Award, Tv, Sparkles, Crown, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

const FuzFlix = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const subscriptionPlans = [
    {
      name: "Basic",
      price: 2500,
      features: ["HD Streaming", "Access to 50+ Shows", "Standard Predictions", "Mobile Only"],
      color: "from-blue-500 to-blue-600",
      icon: Play,
    },
    {
      name: "Premium",
      price: 5000,
      features: ["4K Streaming", "Access to All Content", "Enhanced Predictions", "All Devices", "Watch Parties"],
      color: "from-purple-500 to-purple-600",
      icon: Crown,
      recommended: true,
    },
    {
      name: "VIP",
      price: 10000,
      features: ["4K HDR Streaming", "Exclusive Originals", "Premium Predictions", "Priority Support", "No Ads", "Bonus Bets"],
      color: "from-amber-500 to-amber-600",
      icon: Sparkles,
    },
  ];

  const categories = [
    {
      name: "Nollywood",
      icon: Film,
      count: 35,
      trending: ["Blood Sisters S2", "King of Boys: The Return", "Gangs of Lagos"],
      markets: ["Best Actor", "Box Office Winner", "Plot Twist Predictions"],
    },
    {
      name: "Reality TV",
      icon: Tv,
      count: 12,
      trending: ["BBNaija All Stars", "The Real Housewives of Lagos", "Nigerian Idol"],
      markets: ["Winner", "Next Eviction", "Showmance Predictions"],
    },
    {
      name: "Live Concerts",
      icon: Music,
      count: 18,
      trending: ["Afrobeat Live", "Wizkid: More Love Tour", "Burna Boy Experience"],
      markets: ["Attendance Numbers", "Special Guests", "Viral Moments"],
    },
    {
      name: "Award Shows",
      icon: Award,
      count: 8,
      trending: ["AMVCA 2025", "Headies Awards", "Africa Movie Academy Awards"],
      markets: ["Best Film", "Best Actor", "Surprise Wins"],
    },
    {
      name: "Content Creator",
      icon: Users,
      count: 22,
      trending: ["Mr Macaroni Challenge", "Taaooma Comedy", "Mark Angel Comedy"],
      markets: ["Viral Reach", "Collaboration Predictions", "Challenge Winners"],
    },
    {
      name: "FuzOriginals",
      icon: Sparkles,
      count: 15,
      trending: ["Betting Chronicles", "The Odds Makers", "Naija Predictor"],
      markets: ["Episode Outcomes", "Character Decisions", "Plot Twists"],
    },
  ];

  const liveEvents = [
    {
      title: "BBNaija All Stars - Live Show",
      viewers: 145230,
      category: "Reality TV",
      thumbnail: "🏠",
      status: "LIVE",
      markets: [
        { outcome: "Mercy to be evicted", odds: 2.5, bets: 3420 },
        { outcome: "Ike wins HOH", odds: 3.2, bets: 2156 },
        { outcome: "No eviction twist", odds: 5.0, bets: 892 },
      ],
    },
    {
      title: "Wizkid: More Love Tour - Lagos",
      viewers: 89560,
      category: "Live Concert",
      thumbnail: "🎤",
      status: "LIVE",
      markets: [
        { outcome: "Burna Boy guest appearance", odds: 1.8, bets: 5234 },
        { outcome: "Over 50K attendance", odds: 1.5, bets: 4120 },
        { outcome: "New song premiere", odds: 3.5, bets: 1876 },
      ],
    },
    {
      title: "AMVCA 2025 - Red Carpet",
      viewers: 52340,
      category: "Award Show",
      thumbnail: "🏆",
      status: "STARTING SOON",
      markets: [
        { outcome: "Funke Akindele wins Best Actress", odds: 2.2, bets: 2567 },
        { outcome: "Toyin Abraham best dressed", odds: 4.0, bets: 1203 },
        { outcome: "A Tribe Called Judah wins Best Film", odds: 1.9, bets: 3421 },
      ],
    },
  ];

  const handleSubscribe = (plan: string, price: number) => {
    setSelectedPlan(plan);
    toast.success(`Subscribed to ${plan} Plan - ${formatCurrency(price)}/month!`);
  };

  const handlePlaceBet = (eventTitle: string, market: string) => {
    toast.success(`Bet placed on "${market}" for ${eventTitle}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 md:ml-64 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-8 md:p-12">
              <div className="relative z-10">
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  FuzFlix Live
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Stream. Predict. Win.
                </h1>
                <p className="text-lg text-white/90 mb-6 max-w-2xl">
                  Watch exclusive Nigerian entertainment and place real-time predictions on your favorite shows, concerts, and events.
                </p>
                <div className="flex gap-4">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                    Start Free Trial
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10">
                    Browse Content
                  </Button>
                </div>
              </div>
            </div>

            {/* Subscription Plans */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan) => (
                  <Card 
                    key={plan.name}
                    className={`relative overflow-hidden transition-all hover:shadow-2xl ${
                      plan.recommended ? "border-2 border-primary" : ""
                    }`}
                  >
                    {plan.recommended && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                        RECOMMENDED
                      </div>
                    )}
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                        <plan.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-green-500 text-xs">✓</span>
                            </div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        variant={plan.recommended ? "default" : "outline"}
                        onClick={() => handleSubscribe(plan.name, plan.price)}
                      >
                        Subscribe Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Live Events */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Live Now</h2>
                <Badge variant="destructive" className="gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  {liveEvents.length} Live Events
                </Badge>
              </div>

              <div className="space-y-4">
                {liveEvents.map((event, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <div className="grid md:grid-cols-[300px_1fr] gap-4">
                      <div className="relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-8 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-4">{event.thumbnail}</div>
                          <Badge variant={event.status === "LIVE" ? "destructive" : "secondary"}>
                            {event.status}
                          </Badge>
                          <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">{event.viewers.toLocaleString()} watching</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                            <Badge variant="outline">{event.category}</Badge>
                          </div>
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Watch
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-muted-foreground mb-3">Prediction Markets</h4>
                          {event.markets.map((market, mIdx) => (
                            <div 
                              key={mIdx}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm">{market.outcome}</p>
                                <p className="text-xs text-muted-foreground">{market.bets.toLocaleString()} bets placed</p>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="gap-2"
                                onClick={() => handlePlaceBet(event.title, market.outcome)}
                              >
                                <span className="font-bold">{market.odds.toFixed(2)}x</span>
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Content Categories */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
              <Tabs defaultValue="nollywood" className="space-y-6">
                <TabsList className="w-full grid grid-cols-3 md:grid-cols-6">
                  {categories.map((cat) => (
                    <TabsTrigger key={cat.name.toLowerCase()} value={cat.name.toLowerCase()}>
                      <cat.icon className="h-4 w-4 mr-2" />
                      {cat.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((cat) => (
                  <TabsContent key={cat.name.toLowerCase()} value={cat.name.toLowerCase()}>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <cat.icon className="h-5 w-5 text-primary" />
                            </div>
                            {cat.name}
                          </CardTitle>
                          <Badge>{cat.count} Shows</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h4 className="font-semibold mb-3">Trending Now</h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            {cat.trending.map((show, idx) => (
                              <Card key={idx} className="p-4 hover:shadow-lg transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm">{show}</p>
                                    <p className="text-xs text-muted-foreground">Watch & Predict</p>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Active Prediction Markets</h4>
                          <div className="grid gap-2">
                            {cat.markets.map((market, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <span className="text-sm font-medium">{market}</span>
                                <Button size="sm" variant="ghost">View Markets</Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FuzFlix;
