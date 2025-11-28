import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Bell } from "lucide-react";
import { toast } from "sonner";

export default function Status() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Mock status data - in production, this would be fetched from UptimeRobot API
  const services = [
    { name: "Website", status: "operational", uptime: "99.99%", responseTime: "245ms" },
    { name: "API Gateway", status: "operational", uptime: "99.97%", responseTime: "125ms" },
    { name: "Database", status: "operational", uptime: "100.00%", responseTime: "15ms" },
    { name: "Payment Processing", status: "operational", uptime: "99.95%", responseTime: "520ms" },
    { name: "Live Betting", status: "operational", uptime: "99.98%", responseTime: "180ms" },
    { name: "Casino Games", status: "operational", uptime: "99.96%", responseTime: "210ms" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "down":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500">Operational</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500">Degraded</Badge>;
      case "down":
        return <Badge className="bg-red-500">Down</Badge>;
      default:
        return null;
    }
  };

  const handleEmailSubscribe = () => {
    if (!email.includes('@')) {
      toast.error("Please enter a valid email");
      return;
    }
    // TODO: Integrate with UptimeRobot webhook or notification service
    toast.success("Subscribed to email alerts!");
    setEmail("");
  };

  const handleSMSSubscribe = () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    // TODO: Integrate with UptimeRobot webhook or SMS service
    toast.success("Subscribed to SMS alerts!");
    setPhone("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Betfuz Status</h1>
            <p className="text-muted-foreground">Real-time service status and uptime monitoring</p>
          </div>

          {/* Overall Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    All Systems Operational
                  </CardTitle>
                  <CardDescription>All services are running smoothly</CardDescription>
                </div>
                <Badge className="bg-green-500 text-lg px-4 py-2">
                  99.98% Uptime
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Service Status */}
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Response time: {service.responseTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{service.uptime}</div>
                        <div className="text-xs text-muted-foreground">30-day uptime</div>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Subscribe to Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Subscribe to Status Updates
              </CardTitle>
              <CardDescription>
                Get notified immediately when service status changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Email Subscription */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Alerts</label>
                  <div className="flex gap-2">
                    <Input 
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button onClick={handleEmailSubscribe}>
                      Subscribe
                    </Button>
                  </div>
                </div>

                {/* SMS Subscription */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">SMS Alerts</label>
                  <div className="flex gap-2">
                    <Input 
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Button onClick={handleSMSSubscribe}>
                      Subscribe
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Info */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Powered by UptimeRobot</CardTitle>
              <CardDescription>
                This status page is monitored by UptimeRobot with 5-minute interval checks. 
                Subscribers receive instant notifications via email and SMS when service status changes.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
