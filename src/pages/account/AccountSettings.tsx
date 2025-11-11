import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const AccountSettings = () => {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFACode, setTwoFACode] = useState("");

  const handleChangePassword = () => {
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = () => {
    // Ready for n8n integration
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully",
    });
    setShowPasswordDialog(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleEnable2FA = () => {
    setShow2FADialog(true);
  };

  const handle2FASubmit = () => {
    // Ready for n8n integration
    toast({
      title: "2FA Enabled",
      description: "Two-factor authentication has been enabled for your account",
    });
    setShow2FADialog(false);
    setTwoFACode("");
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

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPasswordDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={handlePasswordSubmit}
              >
                Update Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>Scan the QR code with your authenticator app</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-muted p-8 rounded-lg flex items-center justify-center">
              <div className="w-48 h-48 bg-background rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">QR Code<br/>Ready for n8n</p>
              </div>
            </div>
            <div>
              <Label>Verification Code</Label>
              <Input
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShow2FADialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={handle2FASubmit}
              >
                Enable 2FA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountSettings;
