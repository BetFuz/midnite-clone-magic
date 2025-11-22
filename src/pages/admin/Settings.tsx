import { useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    withdrawalsEnabled: true,
    depositsEnabled: true,
    liveBettingEnabled: true,
  });

  const handleSave = () => {
    // TODO: DEV – persist to admin_settings table, broadcast to all instances
    toast.success("Settings saved successfully");
  };

  return (
    <AdminGuard requireSuperAdmin>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">System Settings</h1>
              <p className="text-muted-foreground">Configure global platform settings</p>
            </div>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Controls</CardTitle>
                <CardDescription>Enable or disable core features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Disable all user access to the platform
                    </p>
                  </div>
                  <Switch
                    id="maintenance"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, maintenanceMode: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="registration">User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to create accounts
                    </p>
                  </div>
                  <Switch
                    id="registration"
                    checked={settings.registrationEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, registrationEnabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="withdrawals">Withdrawals</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable users to withdraw funds
                    </p>
                  </div>
                  <Switch
                    id="withdrawals"
                    checked={settings.withdrawalsEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, withdrawalsEnabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="deposits">Deposits</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable users to deposit funds
                    </p>
                  </div>
                  <Switch
                    id="deposits"
                    checked={settings.depositsEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, depositsEnabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="livebetting">Live Betting</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable in-play betting features
                    </p>
                  </div>
                  <Switch
                    id="livebetting"
                    checked={settings.liveBettingEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, liveBettingEnabled: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
