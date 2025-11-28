import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, AlertTriangle, Clock, TrendingDown, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const PlayerProtection = () => {
  const navigate = useNavigate();
  const [limits, setLimits] = useState({
    daily_stake_limit: 100000,
    daily_loss_limit: 50000,
    session_time_limit: 180,
    self_excluded_until: null as string | null,
    cooling_off_until: null as string | null,
  });
  const [loading, setLoading] = useState(false);
  const [dailyUsage, setDailyUsage] = useState({ stake: 0, loss: 0 });

  useEffect(() => {
    loadLimits();
    loadDailyUsage();
  }, []);

  const loadLimits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('responsible_gaming_limits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setLimits({
          daily_stake_limit: Number(data.daily_stake_limit),
          daily_loss_limit: Number(data.daily_loss_limit),
          session_time_limit: data.session_time_limit,
          self_excluded_until: data.self_excluded_until,
          cooling_off_until: data.cooling_off_until,
        });
      }
    } catch (error) {
      console.error('Failed to load limits:', error);
      toast.error('Failed to load player protection settings');
    }
  };

  const loadDailyUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_daily_usage', {
        p_user_id: user.id,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setDailyUsage({
          stake: Number(data[0].total_stake),
          loss: Number(data[0].total_loss),
        });
      }
    } catch (error) {
      console.error('Failed to load daily usage:', error);
    }
  };

  const updateLimits = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('responsible_gaming_limits')
        .upsert({
          user_id: user.id,
          daily_stake_limit: limits.daily_stake_limit,
          daily_loss_limit: limits.daily_loss_limit,
          session_time_limit: limits.session_time_limit,
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      toast.success('Player protection limits updated successfully');
      loadLimits();
    } catch (error) {
      console.error('Failed to update limits:', error);
      toast.error('Failed to update limits');
    } finally {
      setLoading(false);
    }
  };

  const setCoolingOff = async () => {
    if (!confirm('Are you sure you want to activate a 24-hour cooling-off period? You will not be able to place bets during this time.')) {
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const coolingOffUntil = new Date();
      coolingOffUntil.setHours(coolingOffUntil.getHours() + 24);

      const { error } = await supabase
        .from('responsible_gaming_limits')
        .upsert({
          user_id: user.id,
          cooling_off_until: coolingOffUntil.toISOString(),
          daily_stake_limit: limits.daily_stake_limit,
          daily_loss_limit: limits.daily_loss_limit,
          session_time_limit: limits.session_time_limit,
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      toast.success('24-hour cooling-off period activated');
      loadLimits();
    } catch (error) {
      console.error('Failed to set cooling-off:', error);
      toast.error('Failed to activate cooling-off period');
    } finally {
      setLoading(false);
    }
  };

  const setSelfExclusion = async (days: number) => {
    if (!confirm(`Are you sure you want to self-exclude for ${days} days? This action cannot be undone until the period expires.`)) {
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const exclusionUntil = new Date();
      exclusionUntil.setDate(exclusionUntil.getDate() + days);

      const { error } = await supabase
        .from('responsible_gaming_limits')
        .upsert({
          user_id: user.id,
          self_excluded_until: exclusionUntil.toISOString(),
          daily_stake_limit: limits.daily_stake_limit,
          daily_loss_limit: limits.daily_loss_limit,
          session_time_limit: limits.session_time_limit,
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      toast.success(`Self-exclusion activated for ${days} days`);
      loadLimits();
    } catch (error) {
      console.error('Failed to set self-exclusion:', error);
      toast.error('Failed to activate self-exclusion');
    } finally {
      setLoading(false);
    }
  };

  const isExcluded = limits.self_excluded_until && new Date(limits.self_excluded_until) > new Date();
  const isCoolingOff = limits.cooling_off_until && new Date(limits.cooling_off_until) > new Date();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Player Protection
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your responsible gaming limits and self-exclusion settings
          </p>
        </div>
      </div>

      {(isExcluded || isCoolingOff) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {isExcluded && `You are currently self-excluded until ${new Date(limits.self_excluded_until!).toLocaleString()}.`}
            {isCoolingOff && `You are in a 24-hour cooling-off period until ${new Date(limits.cooling_off_until!).toLocaleString()}.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Daily Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Usage</CardTitle>
          <CardDescription>Your betting activity for today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Daily Stake Used</Label>
              <div className="text-2xl font-bold">
                ₦{dailyUsage.stake.toFixed(2)} / ₦{limits.daily_stake_limit.toFixed(2)}
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((dailyUsage.stake / limits.daily_stake_limit) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Daily Loss</Label>
              <div className="text-2xl font-bold">
                ₦{dailyUsage.loss.toFixed(2)} / ₦{limits.daily_loss_limit.toFixed(2)}
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-destructive h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((dailyUsage.loss / limits.daily_loss_limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposit & Loss Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Deposit & Loss Limits
          </CardTitle>
          <CardDescription>
            Set daily limits to control your spending
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="daily_stake_limit">Daily Stake Limit (NGN)</Label>
            <Input
              id="daily_stake_limit"
              type="number"
              value={limits.daily_stake_limit}
              onChange={(e) => setLimits({ ...limits, daily_stake_limit: Number(e.target.value) })}
              min={1000}
              step={1000}
              disabled={isExcluded || isCoolingOff}
            />
            <p className="text-sm text-muted-foreground">
              Maximum amount you can stake per day
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="daily_loss_limit">Daily Loss Limit (NGN)</Label>
            <Input
              id="daily_loss_limit"
              type="number"
              value={limits.daily_loss_limit}
              onChange={(e) => setLimits({ ...limits, daily_loss_limit: Number(e.target.value) })}
              min={500}
              step={500}
              disabled={isExcluded || isCoolingOff}
            />
            <p className="text-sm text-muted-foreground">
              Maximum amount you can lose per day
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session_time_limit">Session Time Limit (minutes)</Label>
            <Input
              id="session_time_limit"
              type="number"
              value={limits.session_time_limit}
              onChange={(e) => setLimits({ ...limits, session_time_limit: Number(e.target.value) })}
              min={30}
              step={30}
              disabled={isExcluded || isCoolingOff}
            />
            <p className="text-sm text-muted-foreground">
              Maximum continuous session duration
            </p>
          </div>

          <Button onClick={updateLimits} disabled={loading || isExcluded || isCoolingOff} className="w-full">
            Update Limits
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Cooling-Off Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            24-Hour Cooling-Off Period
          </CardTitle>
          <CardDescription>
            Take a break from betting for 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            If you feel you need a short break, activate a 24-hour cooling-off period. 
            You will not be able to place any bets during this time.
          </p>
          <Button
            variant="outline"
            onClick={setCoolingOff}
            disabled={loading || isExcluded || isCoolingOff}
            className="w-full"
          >
            <Clock className="mr-2 h-4 w-4" />
            Activate 24-Hour Cooling-Off
          </Button>
        </CardContent>
      </Card>

      {/* Self-Exclusion */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Self-Exclusion
          </CardTitle>
          <CardDescription>
            Exclude yourself from betting for a specified period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Self-exclusion is a serious step. Once activated, you will not be able to access 
              your account or place bets until the exclusion period ends. This action cannot be reversed.
            </AlertDescription>
          </Alert>

          <div className="grid gap-3">
            <Button
              variant="destructive"
              onClick={() => setSelfExclusion(7)}
              disabled={loading || isExcluded || isCoolingOff}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Self-Exclude for 7 Days
            </Button>
            <Button
              variant="destructive"
              onClick={() => setSelfExclusion(30)}
              disabled={loading || isExcluded || isCoolingOff}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Self-Exclude for 30 Days
            </Button>
            <Button
              variant="destructive"
              onClick={() => setSelfExclusion(90)}
              disabled={loading || isExcluded || isCoolingOff}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Self-Exclude for 90 Days
            </Button>
            <Button
              variant="destructive"
              onClick={() => setSelfExclusion(180)}
              disabled={loading || isExcluded || isCoolingOff}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Self-Exclude for 6 Months
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            For help with gambling addiction, contact the National Gambling Helpline or visit responsible gambling resources.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerProtection;
