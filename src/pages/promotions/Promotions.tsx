import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Gift, TrendingUp, Target, Trophy, Calendar, Zap, ArrowRight } from "lucide-react";

const CATEGORY_TABS = ["All", "Sports", "Casino", "VIP"];

const Promotions = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");

  const promotions = [
    {
      id: "welcome",
      icon: Gift,
      title: "Welcome Bonus",
      description: "Get up to ₦15,000 in free bets",
      tagline: "Bet ₦5,000 Get ₦15,000",
      badge: "New Customers",
      badgeColor: "bg-primary",
      gradient: "from-primary via-accent to-primary",
      path: "/promotions/welcome",
      category: "Sports",
    },
    {
      id: "acca-boost",
      icon: TrendingUp,
      title: "Acca Boost",
      description: "Up to 50% extra on winning accumulators",
      tagline: "Boost Your Accas",
      badge: "Daily",
      badgeColor: "bg-success",
      gradient: "from-success via-green-600 to-success",
      path: "/promotions/acca-boost",
      category: "Sports",
    },
    {
      id: "weekend",
      icon: Trophy,
      title: "Weekend Specials",
      description: "Enhanced odds every weekend",
      tagline: "Boost Your Weekend",
      badge: "Weekly",
      badgeColor: "bg-orange-500",
      gradient: "from-orange-500 via-orange-600 to-orange-500",
      path: "/promotions/weekend-specials",
      category: "Sports",
    },
    {
      id: "cashback",
      icon: Target,
      title: "Cashback Offers",
      description: "Get 10% back on losing bets",
      tagline: "10% Monthly Cashback",
      badge: "Monthly",
      badgeColor: "bg-blue-500",
      gradient: "from-blue-500 via-blue-600 to-blue-500",
      path: "/promotions/cashback",
      category: "Casino",
    },
    {
      id: "loyalty",
      icon: Zap,
      title: "VIP Club",
      description: "Earn points with every bet, unlock exclusive rewards",
      tagline: "Unlock VIP Rewards",
      badge: "VIP",
      badgeColor: "bg-purple-500",
      gradient: "from-purple-500 via-purple-600 to-purple-500",
      path: "/account/vip",
      category: "VIP",
    },
    {
      id: "bonuses",
      icon: Gift,
      title: "Claim Bonuses",
      description: "View and claim all available bonuses",
      tagline: "Free Bonuses Waiting",
      badge: "Live",
      badgeColor: "bg-green-500",
      gradient: "from-green-500 via-green-600 to-green-500",
      path: "/account/bonuses",
      category: "Sports",
    },
    {
      id: "referral",
      icon: Calendar,
      title: "Refer a Friend",
      description: "5% commission on every bet your friends place",
      tagline: "Share & Earn",
      badge: "Ongoing",
      badgeColor: "bg-pink-500",
      gradient: "from-pink-500 via-pink-600 to-pink-500",
      path: "/account/referral",
      category: "Sports",
    },
  ];

  const filtered = activeCategory === "All" ? promotions : promotions.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-6xl mx-auto">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Promotions & Offers</h1>
                <p className="text-white/80 text-sm">Exclusive bonuses, boosts & rewards</p>
              </div>
              <Gift className="h-10 w-10 text-white/60" />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
              {CATEGORY_TABS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Active Promotions */}
            <div className="mb-8">
              <div className="grid md:grid-cols-2 gap-6">
                {filtered.slice(0, 2).map((promo) => (
                  <Card 
                    key={promo.id} 
                    className="overflow-hidden border-2 border-border hover:border-primary/50 transition-all hover:shadow-xl group cursor-pointer"
                    onClick={() => promo.path && navigate(promo.path)}
                  >
                    <div className={`relative bg-gradient-to-br ${promo.gradient} p-8 opacity-90`}>
                      <Badge className={`${promo.badgeColor} text-white border-0 mb-4`}>
                        {promo.badge}
                      </Badge>
                      <div className="flex items-center gap-3 mb-3">
                        <promo.icon className="h-10 w-10 text-white" />
                        <h3 className="text-3xl font-bold text-white">{promo.title}</h3>
                      </div>
                      <p className="text-2xl font-bold text-white mb-2">{promo.tagline}</p>
                      <p className="text-white/90 mb-6">{promo.description}</p>
                      <Button 
                        className="bg-white text-foreground hover:bg-white/90 font-semibold gap-2 group-hover:scale-105 transition-transform"
                      >
                        View Offer
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* More Promotions */}
            <div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filtered.slice(2).map((promo) => (
                  <Card 
                    key={promo.id} 
                    className="p-6 bg-card border-border hover:border-primary/30 transition-all hover:shadow-lg group cursor-pointer"
                    onClick={() => promo.path && navigate(promo.path)}
                  >
                    <div className={`p-3 bg-gradient-to-br ${promo.gradient} rounded-lg inline-flex mb-4`}>
                      <promo.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge className={`${promo.badgeColor} text-white border-0 mb-3`}>
                      {promo.badge}
                    </Badge>
                    <h3 className="text-lg font-bold text-foreground mb-2">{promo.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{promo.description}</p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        promo.path && navigate(promo.path);
                      }}
                    >
                      Learn More
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>

            {/* Info Card */}
            <Card className="mt-8 p-6 bg-muted/50 border-border">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Stay Updated</h3>
                  <p className="text-sm text-muted-foreground">
                    Check back regularly for new promotions and special offers. All promotions are subject to terms and conditions. 
                    18+ BeGambleAware.org
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Promotions;
