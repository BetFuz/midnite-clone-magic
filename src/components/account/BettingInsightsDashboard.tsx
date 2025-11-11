import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Calendar, Award, AlertCircle, CheckCircle } from 'lucide-react';

const BettingInsightsDashboard = () => {
  const insights = {
    favoriteLeague: 'Premier League',
    favoriteSport: 'Football',
    avgStake: 1500,
    bestTime: 'Weekend evenings',
    longestStreak: 8,
    currentStreak: 3,
    totalProfit: 45280,
    roi: 12.5,
    predictions: {
      nextBestOdds: 2.35,
      recommendedSport: 'Basketball',
      optimalStake: 2000,
    },
    weeklyGoal: {
      target: 10,
      current: 7,
      progress: 70,
    },
    strengths: [
      'Strong performance on weekend matches',
      'High success rate on under 2.5 goals',
      'Consistent with low-stake accumulators',
    ],
    improvements: [
      'Reduce stake on high-risk single bets',
      'Consider diversifying into tennis markets',
      'Avoid betting during weekday mornings',
    ],
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Profit</p>
              <p className="text-2xl font-bold text-green-600">₦{insights.totalProfit.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">ROI</p>
              <p className="text-2xl font-bold text-blue-600">{insights.roi}%</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Win Streak</p>
              <p className="text-2xl font-bold text-purple-600">{insights.currentStreak}</p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Stake</p>
              <p className="text-2xl font-bold text-orange-600">₦{insights.avgStake}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Weekly Goal */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Weekly Goal Progress</h2>
          <Badge className="ml-auto" variant="secondary">
            {insights.weeklyGoal.current}/{insights.weeklyGoal.target} Bets
          </Badge>
        </div>

        <Progress value={insights.weeklyGoal.progress} className="h-3 mb-2" />
        <p className="text-sm text-muted-foreground">
          {insights.weeklyGoal.target - insights.weeklyGoal.current} more bets to reach your weekly goal
        </p>
      </Card>

      {/* Betting Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Your Betting Profile</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm text-muted-foreground">Favorite Sport</span>
              <span className="font-semibold">{insights.favoriteSport}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm text-muted-foreground">Favorite League</span>
              <span className="font-semibold">{insights.favoriteLeague}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm text-muted-foreground">Best Betting Time</span>
              <span className="font-semibold">{insights.bestTime}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm text-muted-foreground">Longest Win Streak</span>
              <span className="font-semibold">{insights.longestStreak} wins</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">AI Predictions</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-semibold">Next Best Opportunity</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Odds around {insights.predictions.nextBestOdds} match your winning pattern
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">Recommended Sport</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Try {insights.predictions.recommendedSport} for better returns based on your profile
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-green-600" />
                <span className="font-semibold">Optimal Stake</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Consider stakes around ₦{insights.predictions.optimalStake} for best ROI
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-bold">Your Strengths</h2>
          </div>
          <div className="space-y-3">
            {insights.strengths.map((strength, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{strength}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-bold">Areas to Improve</h2>
          </div>
          <div className="space-y-3">
            {insights.improvements.map((improvement, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{improvement}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-primary">Personalized Tip</h3>
            <p className="text-sm">
              Based on your betting patterns, you perform 35% better on matches starting after 6 PM on Saturdays. 
              Consider focusing your high-stake bets during these optimal windows for maximum returns.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BettingInsightsDashboard;
