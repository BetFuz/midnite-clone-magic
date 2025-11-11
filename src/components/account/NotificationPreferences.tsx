import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettings {
  email: {
    betUpdates: boolean;
    promotions: boolean;
    newsletters: boolean;
    accountActivity: boolean;
  };
  push: {
    betResults: boolean;
    oddsChanges: boolean;
    flashOdds: boolean;
    bonuses: boolean;
  };
  sms: {
    winnings: boolean;
    withdrawals: boolean;
    loginAlerts: boolean;
  };
  inApp: {
    betAlerts: boolean;
    socialUpdates: boolean;
    recommendations: boolean;
  };
}

const NotificationPreferences = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      betUpdates: true,
      promotions: true,
      newsletters: false,
      accountActivity: true,
    },
    push: {
      betResults: true,
      oddsChanges: false,
      flashOdds: true,
      bonuses: true,
    },
    sms: {
      winnings: true,
      withdrawals: true,
      loginAlerts: true,
    },
    inApp: {
      betAlerts: true,
      socialUpdates: false,
      recommendations: true,
    },
  });

  const handleSave = () => {
    toast.success('Preferences Saved', {
      description: 'Your notification settings have been updated',
    });
  };

  const toggleEmailSetting = (key: keyof NotificationSettings['email']) => {
    setSettings(prev => ({
      ...prev,
      email: { ...prev.email, [key]: !prev.email[key] },
    }));
  };

  const togglePushSetting = (key: keyof NotificationSettings['push']) => {
    setSettings(prev => ({
      ...prev,
      push: { ...prev.push, [key]: !prev.push[key] },
    }));
  };

  const toggleSmsSetting = (key: keyof NotificationSettings['sms']) => {
    setSettings(prev => ({
      ...prev,
      sms: { ...prev.sms, [key]: !prev.sms[key] },
    }));
  };

  const toggleInAppSetting = (key: keyof NotificationSettings['inApp']) => {
    setSettings(prev => ({
      ...prev,
      inApp: { ...prev.inApp, [key]: !prev.inApp[key] },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Email Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-bet-updates">Bet Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your active bets
              </p>
            </div>
            <Switch
              id="email-bet-updates"
              checked={settings.email.betUpdates}
              onCheckedChange={() => toggleEmailSetting('betUpdates')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-promotions">Promotions & Offers</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about exclusive promotions
              </p>
            </div>
            <Switch
              id="email-promotions"
              checked={settings.email.promotions}
              onCheckedChange={() => toggleEmailSetting('promotions')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-newsletters">Weekly Newsletter</Label>
              <p className="text-sm text-muted-foreground">
                Betting tips and platform updates
              </p>
            </div>
            <Switch
              id="email-newsletters"
              checked={settings.email.newsletters}
              onCheckedChange={() => toggleEmailSetting('newsletters')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-account">Account Activity</Label>
              <p className="text-sm text-muted-foreground">
                Important account security notifications
              </p>
            </div>
            <Switch
              id="email-account"
              checked={settings.email.accountActivity}
              onCheckedChange={() => toggleEmailSetting('accountActivity')}
            />
          </div>
        </div>
      </Card>

      {/* Push Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Push Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-results">Bet Results</Label>
              <p className="text-sm text-muted-foreground">
                Instant updates when your bets settle
              </p>
            </div>
            <Switch
              id="push-results"
              checked={settings.push.betResults}
              onCheckedChange={() => togglePushSetting('betResults')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-odds">Odds Changes</Label>
              <p className="text-sm text-muted-foreground">
                Alerts when odds on your selections change
              </p>
            </div>
            <Switch
              id="push-odds"
              checked={settings.push.oddsChanges}
              onCheckedChange={() => togglePushSetting('oddsChanges')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-flash">Flash Odds</Label>
              <p className="text-sm text-muted-foreground">
                Get notified of limited-time boosted odds
              </p>
            </div>
            <Switch
              id="push-flash"
              checked={settings.push.flashOdds}
              onCheckedChange={() => togglePushSetting('flashOdds')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-bonuses">Bonuses & Rewards</Label>
              <p className="text-sm text-muted-foreground">
                Notifications about earned bonuses
              </p>
            </div>
            <Switch
              id="push-bonuses"
              checked={settings.push.bonuses}
              onCheckedChange={() => togglePushSetting('bonuses')}
            />
          </div>
        </div>
      </Card>

      {/* SMS Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Smartphone className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">SMS Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-winnings">Large Winnings</Label>
              <p className="text-sm text-muted-foreground">
                SMS when you win over ₦10,000
              </p>
            </div>
            <Switch
              id="sms-winnings"
              checked={settings.sms.winnings}
              onCheckedChange={() => toggleSmsSetting('winnings')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-withdrawals">Withdrawal Confirmations</Label>
              <p className="text-sm text-muted-foreground">
                SMS verification for all withdrawals
              </p>
            </div>
            <Switch
              id="sms-withdrawals"
              checked={settings.sms.withdrawals}
              onCheckedChange={() => toggleSmsSetting('withdrawals')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-login">Login Alerts</Label>
              <p className="text-sm text-muted-foreground">
                SMS when your account is accessed
              </p>
            </div>
            <Switch
              id="sms-login"
              checked={settings.sms.loginAlerts}
              onCheckedChange={() => toggleSmsSetting('loginAlerts')}
            />
          </div>
        </div>
      </Card>

      {/* In-App Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">In-App Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="app-alerts">Custom Bet Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Notifications from bet alerts you created
              </p>
            </div>
            <Switch
              id="app-alerts"
              checked={settings.inApp.betAlerts}
              onCheckedChange={() => toggleInAppSetting('betAlerts')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="app-social">Social Updates</Label>
              <p className="text-sm text-muted-foreground">
                Updates from bettors you follow
              </p>
            </div>
            <Switch
              id="app-social"
              checked={settings.inApp.socialUpdates}
              onCheckedChange={() => toggleInAppSetting('socialUpdates')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="app-recommendations">AI Recommendations</Label>
              <p className="text-sm text-muted-foreground">
                Personalized betting suggestions
              </p>
            </div>
            <Switch
              id="app-recommendations"
              checked={settings.inApp.recommendations}
              onCheckedChange={() => toggleInAppSetting('recommendations')}
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave}>
          Save Notification Preferences
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
