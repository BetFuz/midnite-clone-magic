import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Gift, TrendingUp, Target, Trophy, Calendar, Zap, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

const Promotions = () => {
  const navigate = useNavigate();

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
    },
    {
      id: "loyalty",
      icon: Zap,
      title: "Loyalty Rewards",
      description: "Earn points with every bet",
      tagline: "Unlock VIP Rewards",
      badge: "VIP",
      badgeColor: "bg-purple-500",
      gradient: "from-purple-500 via-purple-600 to-purple-500",
      path: "/promotions/loyalty-rewards",
    },
    {
      id: "referral",
      icon: Calendar,
      title: "Refer a Friend",
      description: "Earn ₦5,000 for each friend",
      tagline: "Share & Earn",
      badge: "Limited",
      badgeColor: "bg-pink-500",
      gradient: "from-pink-500 via-pink-600 to-pink-500",
      path: "/promotions/refer-friend",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-6xl mx-auto">
            {/* Hero Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">Promotions</h1>
                  <p className="text-muted-foreground">Boost your winnings with exclusive offers</p>
                </div>
              </div>
            </div>

            {/* Active Promotions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Zap className="h-6 w-6 text-success" />
                Active Now
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {promotions.slice(0, 2).map((promo) => (
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
                      {promo.path && (
                        <Button 
                          className="bg-white text-foreground hover:bg-white/90 font-semibold gap-2 group-hover:scale-105 transition-transform"
                        >
                          View Offer
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                      {!promo.path && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* More Promotions */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                More Offers
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {promotions.slice(2).map((promo) => (
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
