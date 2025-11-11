import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, TrendingUp, Gift, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Tier {
  name: string;
  icon: string;
  minPoints: number;
  color: string;
  benefits: string[];
}

const tiers: Tier[] = [
  {
    name: 'Rookie',
    icon: '🎯',
    minPoints: 0,
    color: 'from-gray-500 to-gray-600',
    benefits: ['Welcome bonus', 'Basic support', 'Standard odds'],
  },
  {
    name: 'Bronze',
    icon: '🥉',
    minPoints: 1000,
    color: 'from-orange-700 to-orange-800',
    benefits: ['5% cashback', '24/7 support', 'Early access to promos'],
  },
  {
    name: 'Silver',
    icon: '🥈',
    minPoints: 5000,
    color: 'from-gray-400 to-gray-500',
    benefits: ['10% cashback', 'Priority support', 'Birthday bonus', 'Enhanced odds'],
  },
  {
    name: 'Gold',
    icon: '🥇',
    minPoints: 15000,
    color: 'from-yellow-500 to-yellow-600',
    benefits: ['15% cashback', 'VIP support', 'Monthly rewards', 'Exclusive events', 'Insurance boost'],
  },
  {
    name: 'Platinum',
    icon: '💎',
    minPoints: 50000,
    color: 'from-cyan-500 to-cyan-600',
    benefits: ['20% cashback', 'Personal account manager', 'No withdrawal limits', 'Premium odds', 'Luxury gifts'],
  },
  {
    name: 'Diamond',
    icon: '💠',
    minPoints: 150000,
    color: 'from-purple-500 to-purple-600',
    benefits: ['25% cashback', 'Concierge service', 'Invitations to elite events', 'Maximum insurance', 'Ultimate rewards'],
  },
];

const VIPTierProgression = () => {
  const currentPoints = 18500; // Mock user points
  const currentTier = tiers.find(t => currentPoints >= t.minPoints && 
    (tiers[tiers.indexOf(t) + 1] ? currentPoints < tiers[tiers.indexOf(t) + 1].minPoints : true)) || tiers[0];
  
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progressToNext = nextTier 
    ? ((currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;
  
  const pointsNeeded = nextTier ? nextTier.minPoints - currentPoints : 0;

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className={`p-6 bg-gradient-to-br ${currentTier.color} text-white`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{currentTier.icon}</div>
            <div>
              <h2 className="text-3xl font-bold">{currentTier.name} Tier</h2>
              <p className="text-white/80 mt-1">
                {currentPoints.toLocaleString()} Points
              </p>
            </div>
          </div>

          <Link to={`/account/tiers/${currentTier.name.toLowerCase()}`}>
            <Button variant="secondary" size="lg">
              <Trophy className="h-4 w-4 mr-2" />
              View Benefits
            </Button>
          </Link>
        </div>

        {nextTier && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">Progress to {nextTier.name}</span>
              <span className="font-semibold">{pointsNeeded.toLocaleString()} points needed</span>
            </div>
            <Progress value={progressToNext} className="h-3 bg-white/20" />
            <p className="text-xs text-white/60">
              Keep betting to unlock exclusive {nextTier.name} benefits
            </p>
          </div>
        )}
      </Card>

      {/* Benefits Overview */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Your Current Benefits</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentTier.benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-muted">
              <Gift className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* All Tiers */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">VIP Tier Ladder</h2>
        </div>

        <div className="space-y-4">
          {tiers.map((tier, idx) => {
            const isCurrentTier = tier.name === currentTier.name;
            const isUnlocked = currentPoints >= tier.minPoints;
            const isNext = tier.name === nextTier?.name;

            return (
              <div
                key={tier.name}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  isCurrentTier
                    ? 'border-primary bg-primary/5'
                    : isUnlocked
                    ? 'border-border'
                    : 'border-muted opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl">{tier.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold">{tier.name}</h3>
                        {isCurrentTier && (
                          <Badge className="bg-primary">Current</Badge>
                        )}
                        {isNext && (
                          <Badge variant="outline">Next Tier</Badge>
                        )}
                        {!isUnlocked && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {tier.minPoints === 0 
                          ? 'Starting tier for all members'
                          : `${tier.minPoints.toLocaleString()} points required`}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tier.benefits.slice(0, 3).map((benefit, bidx) => (
                          <span key={bidx} className="text-xs bg-muted px-2 py-1 rounded">
                            {benefit}
                          </span>
                        ))}
                        {tier.benefits.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{tier.benefits.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link to={`/account/tiers/${tier.name.toLowerCase()}`}>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>

                {isNext && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Your Progress</span>
                      <span className="font-semibold">{Math.round(progressToNext)}%</span>
                    </div>
                    <Progress value={progressToNext} className="h-2" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* How to Earn Points */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
        <h2 className="text-lg font-bold mb-4">How to Earn VIP Points</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="font-semibold text-primary">Place Bets</div>
            <p className="text-sm text-muted-foreground">
              Earn 1 point for every ₦100 staked
            </p>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-primary">Win Bets</div>
            <p className="text-sm text-muted-foreground">
              Bonus points for successful accumulators
            </p>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-primary">Refer Friends</div>
            <p className="text-sm text-muted-foreground">
              500 points per successful referral
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VIPTierProgression;
