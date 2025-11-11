import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Leaderboard as LeaderboardComponent } from "@/components/Leaderboard";
import { WeeklyChallenges } from "@/components/WeeklyChallenges";
import { AchievementBadges } from "@/components/AchievementBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Gift, Sparkles, Crown, Star } from "lucide-react";

const Leaderboard = () => {
  const rewardTiers = [
    { 
      tier: "Diamond", 
      minPoints: 10000, 
      reward: "₦50,000", 
      badge: "Premium",
      icon: Crown,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    { 
      tier: "Platinum", 
      minPoints: 7500, 
      reward: "₦30,000",
      badge: "Elite", 
      icon: Sparkles,
      color: "text-gray-300",
      bgColor: "bg-gray-400/10",
      borderColor: "border-gray-400/20"
    },
    { 
      tier: "Gold", 
      minPoints: 5000, 
      reward: "₦20,000",
      badge: "Gold", 
      icon: Trophy,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20"
    },
    { 
      tier: "Silver", 
      minPoints: 2500, 
      reward: "₦10,000",
      badge: "Silver", 
      icon: Award,
      color: "text-gray-400",
      bgColor: "bg-gray-500/10",
      borderColor: "border-gray-500/20"
    },
    { 
      tier: "Bronze", 
      minPoints: 1000, 
      reward: "₦5,000",
      badge: "Bronze", 
      icon: Star,
      color: "text-amber-600",
      bgColor: "bg-amber-600/10",
      borderColor: "border-amber-600/20"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 md:ml-64 mb-20 md:mb-0">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header with Gradient Background */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 md:p-8 border border-primary/20">
              <div className="relative z-10 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/20 backdrop-blur-sm">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                    Weekly Leaderboard
                  </h1>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Compete, climb the ranks, and win amazing cash rewards every week
                  </p>
                </div>
                <Badge variant="secondary" className="hidden md:flex items-center gap-1 px-4 py-2 text-sm">
                  <Gift className="h-4 w-4" />
                  <span>Rewards Active</span>
                </Badge>
              </div>
            </div>

            {/* Compact Reward Tiers */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {rewardTiers.map((tier, index) => {
                const IconComponent = tier.icon;
                return (
                  <Card
                    key={index}
                    className={`${tier.bgColor} ${tier.borderColor} border-2 hover:scale-105 transition-transform cursor-pointer`}
                  >
                    <CardContent className="p-4 text-center">
                      <IconComponent className={`h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 ${tier.color}`} />
                      <h3 className={`font-bold text-sm md:text-base ${tier.color} mb-1`}>
                        {tier.tier}
                      </h3>
                      <Badge variant="outline" className="mb-2 text-xs">
                        {tier.minPoints.toLocaleString()}+ pts
                      </Badge>
                      <p className="text-xs md:text-sm font-bold text-foreground">
                        {tier.reward}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        + {tier.badge} Badge
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Info Banner */}
            <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-start gap-3">
              <Gift className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-foreground font-medium mb-1">
                  How to earn points and win rewards
                </p>
                <p className="text-muted-foreground">
                  Points are awarded for wins, win streaks, and bet accuracy. The leaderboard resets every Monday with rewards distributed to top performers. Keep betting and climbing to unlock bigger prizes!
                </p>
              </div>
            </div>

            {/* Main Content Grid - Optimized Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <LeaderboardComponent />
              </div>
              
              <div className="space-y-6">
                <WeeklyChallenges />
              </div>
            </div>

            {/* Achievements Section */}
            <AchievementBadges />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Leaderboard;
