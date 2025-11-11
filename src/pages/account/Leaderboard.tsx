import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Leaderboard as LeaderboardComponent } from "@/components/Leaderboard";
import { WeeklyChallenges } from "@/components/WeeklyChallenges";
import { AchievementBadges } from "@/components/AchievementBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Target, Gift } from "lucide-react";

const Leaderboard = () => {
  const rewardTiers = [
    { tier: "Diamond", minPoints: 10000, reward: "₦50,000 + Premium Badge", color: "text-blue-400" },
    { tier: "Platinum", minPoints: 7500, reward: "₦30,000 + Elite Badge", color: "text-gray-300" },
    { tier: "Gold", minPoints: 5000, reward: "₦20,000 + Gold Badge", color: "text-yellow-400" },
    { tier: "Silver", minPoints: 2500, reward: "₦10,000 + Silver Badge", color: "text-gray-400" },
    { tier: "Bronze", minPoints: 1000, reward: "₦5,000 + Bronze Badge", color: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 md:ml-64 mb-20 md:mb-0">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
                <p className="text-muted-foreground">
                  Compete with other bettors and win amazing rewards
                </p>
              </div>
            </div>

            {/* Reward Tiers */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Weekly Reward Tiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {rewardTiers.map((tier, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all"
                    >
                      <div className="text-center">
                        <Award className={`h-8 w-8 mx-auto mb-2 ${tier.color}`} />
                        <h3 className={`font-bold ${tier.color}`}>{tier.tier}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {tier.minPoints.toLocaleString()}+ pts
                        </p>
                        <p className="text-xs text-foreground font-semibold mt-2">
                          {tier.reward}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Points are calculated based on wins, streaks, and bet accuracy. Rewards distributed every Monday.
                </p>
              </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LeaderboardComponent />
              </div>
              
              <div className="space-y-6">
                <WeeklyChallenges />
              </div>
            </div>

            {/* Achievements */}
            <AchievementBadges />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Leaderboard;
