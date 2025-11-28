import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGamingLimits } from '@/hooks/useGamingLimits';
import { Shield, Clock, Ban, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const ResponsibleGaming = () => {
  const { limits, usage, loading, updateLimits } = useGamingLimits();
  const [dailyStakeLimit, setDailyStakeLimit] = useState('');
  const [dailyLossLimit, setDailyLossLimit] = useState('');
  const [sessionTimeLimit, setSessionTimeLimit] = useState('');
  const [coolingOffDays, setCoolingOffDays] = useState('');
  const [selfExclusionDays, setSelfExclusionDays] = useState('');

  const handleUpdateLimits = async () => {
    const result = await updateLimits({
      daily_stake_limit: dailyStakeLimit ? parseFloat(dailyStakeLimit) : undefined,
      daily_loss_limit: dailyLossLimit ? parseFloat(dailyLossLimit) : undefined,
      session_time_limit: sessionTimeLimit ? parseInt(sessionTimeLimit) : undefined,
    });

    if (result.success) {
      setDailyStakeLimit('');
      setDailyLossLimit('');
      setSessionTimeLimit('');
    }
  };

  const handleCoolingOff = async () => {
    if (!coolingOffDays) {
      toast.error('Please enter cooling-off period');
      return;
    }

    const result = await updateLimits({
      cooling_off_days: parseInt(coolingOffDays)
    });

    if (result.success) {
      toast.success(`Cooling-off period activated for ${coolingOffDays} days`);
      setCoolingOffDays('');
    }
  };

  const handleSelfExclusion = async () => {
    if (!selfExclusionDays) {
      toast.error('Please enter self-exclusion period');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to self-exclude for ${selfExclusionDays} days? This cannot be reversed.`
    );

    if (!confirmed) return;

    const result = await updateLimits({
      self_exclusion_days: parseInt(selfExclusionDays)
    });

    if (result.success) {
      toast.success(`Self-exclusion activated for ${selfExclusionDays} days`);
      setSelfExclusionDays('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="animate-pulse">Loading...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Responsible Gaming</h1>
            </div>

            {/* Current Usage */}
            {usage && (
              <Card>
                <CardHeader>
                  <CardTitle>Today's Activity</CardTitle>
                  <CardDescription>Your betting activity for today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Staked:</span>
                    <span className="font-bold text-lg">₦{usage.total_stake?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Losses:</span>
                    <span className="font-bold text-lg text-destructive">₦{usage.total_loss?.toLocaleString() || 0}</span>
                  </div>
                  {limits && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span>Daily Stake Limit:</span>
                        <span>₦{limits.daily_stake_limit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Daily Loss Limit:</span>
                        <span>₦{limits.daily_loss_limit.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Set Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Set Your Limits
                </CardTitle>
                <CardDescription>
                  Control your betting activity by setting personal limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyStake">Daily Stake Limit (₦)</Label>
                  <Input
                    id="dailyStake"
                    type="number"
                    placeholder="e.g., 100000"
                    value={dailyStakeLimit}
                    onChange={(e) => setDailyStakeLimit(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyLoss">Daily Loss Limit (₦)</Label>
                  <Input
                    id="dailyLoss"
                    type="number"
                    placeholder="e.g., 50000"
                    value={dailyLossLimit}
                    onChange={(e) => setDailyLossLimit(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTime">Session Time Limit (minutes)</Label>
                  <Input
                    id="sessionTime"
                    type="number"
                    placeholder="e.g., 180"
                    value={sessionTimeLimit}
                    onChange={(e) => setSessionTimeLimit(e.target.value)}
                  />
                </div>
                <Button onClick={handleUpdateLimits} className="w-full">
                  Update Limits
                </Button>
              </CardContent>
            </Card>

            {/* Cooling Off */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  24-Hour Cooling Off
                </CardTitle>
                <CardDescription>
                  Take a break for 24 hours to reconsider your betting decisions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coolingOff">Cooling-Off Period (days)</Label>
                  <Input
                    id="coolingOff"
                    type="number"
                    placeholder="Enter 1 for 24 hours"
                    value={coolingOffDays}
                    onChange={(e) => setCoolingOffDays(e.target.value)}
                  />
                </div>
                <Button onClick={handleCoolingOff} variant="outline" className="w-full">
                  Activate Cooling-Off Period
                </Button>
              </CardContent>
            </Card>

            {/* Self-Exclusion */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Ban className="w-5 h-5" />
                  Self-Exclusion
                </CardTitle>
                <CardDescription>
                  Permanently block your account for a specified period. This action cannot be reversed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="selfExclusion">Self-Exclusion Period (days)</Label>
                  <Input
                    id="selfExclusion"
                    type="number"
                    placeholder="e.g., 30, 90, 180"
                    value={selfExclusionDays}
                    onChange={(e) => setSelfExclusionDays(e.target.value)}
                  />
                </div>
                <Button onClick={handleSelfExclusion} variant="destructive" className="w-full">
                  Self-Exclude Now
                </Button>
              </CardContent>
            </Card>

            {/* Help Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Get Help</CardTitle>
                <CardDescription>Support organizations for gambling concerns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <strong>BeGambleAware:</strong>
                  <p className="text-sm text-muted-foreground">0808 8020 133</p>
                </div>
                <div>
                  <strong>GamCare:</strong>
                  <p className="text-sm text-muted-foreground">www.gamcare.org.uk</p>
                </div>
                <div>
                  <strong>Gambling Therapy:</strong>
                  <p className="text-sm text-muted-foreground">www.gamblingtherapy.org</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResponsibleGaming;
