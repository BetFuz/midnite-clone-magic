import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const AccountSettings = () => {
  const handleChangePassword = () => {
    toast({
      title: "Change Password",
      description: "Password change feature coming soon!",
    });
  };

  const handleEnable2FA = () => {
    toast({
      title: "Two-Factor Authentication",
      description: "2FA setup coming soon!",
    });
  };

  const handleCloseAccount = () => {
    toast({
      title: "Close Account",
      description: "Please contact support to close your account.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Account Settings</h1>
          
          <Card className="p-6 bg-card border-border mb-4">
            <h2 className="text-xl font-bold text-foreground mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-promos">Email Promotions</Label>
                <Switch id="email-promos" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-alerts">SMS Alerts</Label>
                <Switch id="sms-alerts" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="bet-updates">Bet Updates</Label>
                <Switch id="bet-updates" defaultChecked />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border mb-4">
            <h2 className="text-xl font-bold text-foreground mb-4">Privacy</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="public-profile">Public Profile</Label>
                <Switch id="public-profile" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-stats">Show Statistics</Label>
                <Switch id="show-stats" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Security</h2>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleChangePassword}
              >
                Change Password
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleEnable2FA}
              >
                Enable Two-Factor Auth
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleCloseAccount}
              >
                Close Account
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AccountSettings;
