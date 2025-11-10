import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Webhook, CheckCircle2, Save, TestTube } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const WebhookSettings = () => {
  const [webhooks, setWebhooks] = useState({
    promotionClaim: localStorage.getItem("webhook_promotion_claim") || "",
    promoCodeApplied: localStorage.getItem("webhook_promo_code") || "",
    referralGenerated: localStorage.getItem("webhook_referral") || "",
    depositCompleted: localStorage.getItem("webhook_deposit") || "",
    withdrawalRequest: localStorage.getItem("webhook_withdrawal") || "",
  });

  const [isTesting, setIsTesting] = useState<string | null>(null);

  const handleSave = () => {
    Object.entries(webhooks).forEach(([key, value]) => {
      if (value) {
        localStorage.setItem(`webhook_${key.replace(/([A-Z])/g, "_$1").toLowerCase()}`, value);
      }
    });

    toast({
      title: "Settings Saved",
      description: "n8n webhook URLs have been saved successfully",
    });
  };

  const handleTest = async (key: string, url: string) => {
    if (!url) {
      toast({
        title: "No URL",
        description: "Please enter a webhook URL first",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(key);

    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          test: true,
          event: key,
          timestamp: new Date().toISOString(),
          source: "betfuz_test",
        }),
      });

      toast({
        title: "Test Sent",
        description: "Check your n8n workflow to confirm the webhook was triggered",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to send test webhook. Check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(null);
    }
  };

  const webhookConfigs = [
    { 
      key: "promotionClaim", 
      label: "Promotion Claim", 
      description: "Triggered when a user claims a promotion",
      example: "User clicks 'Claim Offer' button"
    },
    { 
      key: "promoCodeApplied", 
      label: "Promo Code Applied", 
      description: "Triggered when a promo code is successfully applied",
      example: "User enters valid promo code"
    },
    { 
      key: "referralGenerated", 
      label: "Referral Generated", 
      description: "Triggered when a referral link is created/shared",
      example: "User generates referral link"
    },
    { 
      key: "depositCompleted", 
      label: "Deposit Completed", 
      description: "Triggered when a deposit is successful",
      example: "User completes deposit transaction"
    },
    { 
      key: "withdrawalRequest", 
      label: "Withdrawal Request", 
      description: "Triggered when a withdrawal is requested",
      example: "User submits withdrawal request"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">n8n Webhook Settings</h1>
                  <p className="text-muted-foreground">Configure webhook URLs for automation</p>
                </div>
              </div>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save All
              </Button>
            </div>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 mb-6">
              <div className="flex items-start gap-3">
                <Webhook className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-2">How to Setup n8n Webhooks</h3>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Create a new workflow in n8n</li>
                    <li>Add a "Webhook" trigger node</li>
                    <li>Copy the webhook URL from the node</li>
                    <li>Paste it in the corresponding field below</li>
                    <li>Click "Test" to verify the connection</li>
                    <li>Save your settings</li>
                  </ol>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              {webhookConfigs.map((config) => (
                <Card key={config.key} className="p-6 bg-card border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-foreground">{config.label}</h3>
                        {webhooks[config.key as keyof typeof webhooks] && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Configured
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{config.description}</p>
                      <p className="text-xs text-muted-foreground italic">Example: {config.example}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={config.key}>Webhook URL</Label>
                      <Input
                        id={config.key}
                        type="url"
                        value={webhooks[config.key as keyof typeof webhooks]}
                        onChange={(e) => setWebhooks({ ...webhooks, [config.key]: e.target.value })}
                        placeholder="https://your-n8n-instance.com/webhook/..."
                        className="mt-2"
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(config.key, webhooks[config.key as keyof typeof webhooks])}
                      disabled={isTesting === config.key || !webhooks[config.key as keyof typeof webhooks]}
                      className="gap-2"
                    >
                      <TestTube className="h-4 w-4" />
                      {isTesting === config.key ? "Testing..." : "Test Webhook"}
                    </Button>
                  </div>

                  <Separator className="my-4" />

                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-foreground mb-2">Example Payload:</p>
                    <pre className="text-xs text-muted-foreground overflow-x-auto">
                      {JSON.stringify({
                        event: config.key,
                        timestamp: new Date().toISOString(),
                        data: { userId: "user123", amount: 10000 }
                      }, null, 2)}
                    </pre>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WebhookSettings;
