import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Clock, Ban, AlertTriangle } from "lucide-react";
import { useGamingLimits } from "@/hooks/useGamingLimits";
import { formatCurrency } from "@/lib/currency";
import { Progress } from "@/components/ui/progress";

const ResponsibleGaming = () => {
  const { limits, usage, loading, updating, updateLimits, isLimitExceeded, isSelfExcluded, isCoolingOff } = useGamingLimits();

  const [dailyStakeLimit, setDailyStakeLimit] = useState(limits?.daily_stake_limit || 100000);
  const [dailyLossLimit, setDailyLossLimit] = useState(limits?.daily_loss_limit || 50000);
  const [sessionTimeLimit, setSessionTimeLimit] = useState(limits?.session_time_limit || 180);
  const [coolingOffDays, setCoolingOffDays] = useState<number | undefined>();
  const [selfExclusionDays, setSelfExclusionDays] = useState<number | undefined>();

  const handleSaveLimits = async () => {
    await updateLimits({
      daily_stake_limit: dailyStakeLimit,
      daily_loss_limit: dailyLossLimit,
      session_time_limit: sessionTimeLimit,
      cooling_off_days: coolingOffDays,
      self_exclusion_days: selfExclusionDays,
    });
  };

  const stakePercentage = usage && limits 
    ? Math.min((usage.total_stake / limits.daily_stake_limit) * 100, 100)
    : 0;

  const lossPercentage = usage && limits
    ? Math.min((usage.total_loss / limits.daily_loss_limit) * 100, 100)
    : 0;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Responsible Gaming</h1>
          <p className="text-muted-foreground">Manage your betting limits and stay in control</p>
        </div>
      </div>

      {/* Alert Messages */}
      {isSelfExcluded() && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Ban className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Self-Exclusion Active</p>
                <p className="text-sm">Your account is self-excluded until {new Date(limits?.self_excluded_until!).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isCoolingOff() && (
        <Card className="border-yellow-500 bg-yellow-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-semibold text-yellow-500">Cooling-Off Period Active</p>
                <p className="text-sm">Your account is in cooling-off until {new Date(limits?.cooling_off_until!).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLimitExceeded() && (
        <Card className="border-orange-500 bg-orange-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-semibold text-orange-500">Daily Limit Reached</p>
                <p className="text-sm">You have reached your daily betting limit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Usage */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Stake Usage</CardTitle>
            <CardDescription>
              {formatCurrency(usage?.total_stake || 0)} of {formatCurrency(limits?.daily_stake_limit || 100000)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={stakePercentage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Loss Usage</CardTitle>
            <CardDescription>
              {formatCurrency(usage?.total_loss || 0)} of {formatCurrency(limits?.daily_loss_limit || 50000)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={lossPercentage} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Set Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Set Your Limits</CardTitle>
          <CardDescription>
            Set daily limits to help you stay in control of your betting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="daily-stake">Daily Stake Limit (₦)</Label>
              <Input
                id="daily-stake"
                type="number"
                value={dailyStakeLimit}
                onChange={(e) => setDailyStakeLimit(Number(e.target.value))}
                min={1000}
                step={1000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily-loss">Daily Loss Limit (₦)</Label>
              <Input
                id="daily-loss"
                type="number"
                value={dailyLossLimit}
                onChange={(e) => setDailyLossLimit(Number(e.target.value))}
                min={1000}
                step={1000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-time">Session Time Limit (minutes)</Label>
              <Input
                id="session-time"
                type="number"
                value={sessionTimeLimit}
                onChange={(e) => setSessionTimeLimit(Number(e.target.value))}
                min={30}
                step={30}
              />
            </div>
          </div>

          <Button 
            onClick={handleSaveLimits} 
            disabled={updating}
            className="w-full"
          >
            {updating ? 'Saving...' : 'Save Limits'}
          </Button>
        </CardContent>
      </Card>

      {/* Take a Break */}
      <Card>
        <CardHeader>
          <CardTitle>Take a Break</CardTitle>
          <CardDescription>
            Temporarily restrict your account from placing bets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cooling-off">Cooling-Off Period (days)</Label>
              <Input
                id="cooling-off"
                type="number"
                value={coolingOffDays || ''}
                onChange={(e) => setCoolingOffDays(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g., 7, 14, 30"
                min={1}
              />
              <p className="text-xs text-muted-foreground">
                Temporarily pause betting for a specified number of days
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="self-exclusion">Self-Exclusion Period (days)</Label>
              <Input
                id="self-exclusion"
                type="number"
                value={selfExclusionDays || ''}
                onChange={(e) => setSelfExclusionDays(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g., 30, 90, 180"
                min={30}
              />
              <p className="text-xs text-muted-foreground">
                Completely exclude your account for a minimum of 30 days
              </p>
            </div>
          </div>

          <Button 
            onClick={handleSaveLimits}
            disabled={updating || (!coolingOffDays && !selfExclusionDays)}
            variant="destructive"
            className="w-full"
          >
            {updating ? 'Applying...' : 'Apply Break Period'}
          </Button>
        </CardContent>
      </Card>

      {/* Information */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            NLRC Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• All limits are enforced immediately and cannot be bypassed</p>
          <p>• Cooling-off and self-exclusion periods cannot be reversed once activated</p>
          <p>• These controls are required by the National Lottery Regulatory Commission (NLRC)</p>
          <p>• For help with problem gambling, contact the National Problem Gambling Helpline</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponsibleGaming;
