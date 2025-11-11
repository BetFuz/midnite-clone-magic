import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ExternalLink, Save, TestTube, Shield, AlertCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const WebhookSettings = () => {
  const [webhookUrls, setWebhookUrls] = useState({
    bet_placed: "",
    bet_won: "",
    bet_lost: "",
    deposit: "",
    withdrawal: "",
    user_registered: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadWebhookSettings();
  }, []);

  const loadWebhookSettings = async () => {
    try {
      setFetching(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      const response = await supabase.functions.invoke('admin-webhook-settings', {
        method: 'GET',
      });

      if (response.error) {
        throw response.error;
      }

      if (response.data?.data) {
        setWebhookUrls({
          bet_placed: response.data.data.bet_placed || "",
          bet_won: response.data.data.bet_won || "",
          bet_lost: response.data.data.bet_lost || "",
          deposit: response.data.data.deposit || "",
          withdrawal: response.data.data.withdrawal || "",
          user_registered: response.data.data.user_registered || "",
        });
      }
    } catch (error: any) {
      console.error("Error loading webhook settings:", error);
      if (error?.message?.includes('Forbidden')) {
        toast.error("Access denied: Admin privileges required");
      } else {
        toast.error("Failed to load webhook settings");
      }
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      const response = await supabase.functions.invoke('admin-webhook-settings', {
        body: webhookUrls,
      });

      if (response.error) {
        throw response.error;
      }

      toast.success("Webhook settings saved securely and logged to audit trail");
    } catch (error: any) {
      console.error("Error saving webhook settings:", error);
      if (error?.message?.includes('Forbidden')) {
        toast.error("Access denied: Admin privileges required");
      } else {
        toast.error(error.message || "Failed to save webhook settings");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (url: string, eventType: string) => {
    if (!url) {
      toast.error("Please enter a webhook URL first");
      return;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: true,
          eventType,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success(`Test webhook sent successfully to ${eventType}`);
      } else {
        toast.error(`Failed to send test webhook: ${response.statusText}`);
      }
    } catch (error) {
      toast.error("Failed to send test webhook");
    }
  };

  const webhookConfigs = [
    {
      key: "bet_placed",
      label: "Bet Placed",
      description: "Triggered when a user places a bet",
      example: { userId: "uuid", betId: "uuid", stake: 5000, odds: 2.5 },
    },
    {
      key: "bet_won",
      label: "Bet Won",
      description: "Triggered when a bet wins",
      example: { userId: "uuid", betId: "uuid", winnings: 12500 },
    },
    {
      key: "bet_lost",
      label: "Bet Lost",
      description: "Triggered when a bet loses",
      example: { userId: "uuid", betId: "uuid", stake: 5000 },
    },
    {
      key: "deposit",
      label: "Deposit",
      description: "Triggered when a deposit is completed",
      example: { userId: "uuid", amount: 10000, method: "bank_transfer" },
    },
    {
      key: "withdrawal",
      label: "Withdrawal",
      description: "Triggered when a withdrawal is requested",
      example: { userId: "uuid", amount: 50000, method: "bank_transfer" },
    },
    {
      key: "user_registered",
      label: "User Registered",
      description: "Triggered when a new user signs up",
      example: { userId: "uuid", email: "user@example.com", timestamp: new Date().toISOString() },
    },
  ];

  return (
    <AdminGuard requireSuperAdmin={true}>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <MobileNav />
        
        <main className="flex-1 p-6 lg:ml-64 pb-20 md:pb-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Secure Admin Area - Webhook Settings</h1>
            </div>

            <Alert className="bg-primary/10 border-primary/20">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground">
                <strong>Security Notice:</strong> All webhook configuration changes are logged to an immutable audit trail. 
                Access is restricted to Super Admins only. Webhooks must use HTTPS.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-primary" />
                  n8n Webhook Configuration
                </CardTitle>
                <CardDescription>
                  Configure n8n webhook URLs for automated betting platform workflows. 
                  All changes are server-validated and audit-logged.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {fetching ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading secure webhook settings...
                  </div>
                ) : (
                  <>
                    {webhookConfigs.map((config) => (
                      <div key={config.key} className="space-y-3 p-4 border border-border rounded-lg">
                        <div>
                          <Label htmlFor={config.key} className="text-base font-semibold">
                            {config.label}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {config.description}
                          </p>
                        </div>
                        
                        <Input
                          id={config.key}
                          type="url"
                          value={webhookUrls[config.key as keyof typeof webhookUrls]}
                          onChange={(e) =>
                            setWebhookUrls({ ...webhookUrls, [config.key]: e.target.value })
                          }
                          placeholder="https://your-n8n-instance.com/webhook/..."
                          className="font-mono text-sm"
                        />

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleTest(
                                webhookUrls[config.key as keyof typeof webhookUrls],
                                config.key
                              )
                            }
                            disabled={!webhookUrls[config.key as keyof typeof webhookUrls]}
                          >
                            <TestTube className="w-4 h-4 mr-2" />
                            Test Webhook
                          </Button>
                        </div>

                        <div className="mt-2 p-3 bg-muted/50 rounded-md">
                          <p className="text-xs font-semibold mb-1">Example Payload:</p>
                          <pre className="text-xs text-muted-foreground overflow-x-auto">
                            {JSON.stringify(config.example, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}

                    <Button 
                      onClick={handleSave}
                      className="w-full"
                      disabled={loading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Saving & Logging to Audit Trail..." : "Save All Settings (Audit Logged)"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
};

export default WebhookSettings;
