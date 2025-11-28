import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Zap, Gift, Bell } from "lucide-react";

const GrowthTools = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [boostForm, setBoostForm] = useState({
    eventName: "",
    startTime: "",
    endTime: "",
    multiplier: "2.0",
  });

  const handleCreateBoost = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("affiliate_boost_periods").insert({
        event_name: boostForm.eventName,
        start_time: boostForm.startTime,
        end_time: boostForm.endTime,
        commission_multiplier: parseFloat(boostForm.multiplier),
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Boost Period Created",
        description: `${boostForm.eventName} boost activated`,
      });

      setBoostForm({ eventName: "", startTime: "", endTime: "", multiplier: "2.0" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunRetentionFlow = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("retention-flow");

      if (error) throw error;

      toast({
        title: "Retention Flow Completed",
        description: `Credited ${data.usersProcessed} inactive users. Total spent: ₦${data.totalSpent.toLocaleString()}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyWaitlist = async (paymentMethod: "apple_pay" | "google_pay") => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("payment-waitlist-notify", {
        body: { paymentMethod },
      });

      if (error) throw error;

      toast({
        title: "Waitlist Notified",
        description: `${data.notifiedCount} users notified about ${paymentMethod.replace("_", " ")} launch`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Growth Tools</h1>
          <p className="text-muted-foreground">Post-launch growth and retention features</p>
        </div>
      </div>

      {/* Affiliate Boost Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Affiliate Commission Boost
          </CardTitle>
          <CardDescription>
            Create boost periods for major tournaments (AFCON, UCL final) with double commission for 48h
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Event Name</Label>
              <Input
                placeholder="AFCON Final 2025"
                value={boostForm.eventName}
                onChange={(e) => setBoostForm({ ...boostForm, eventName: e.target.value })}
              />
            </div>
            <div>
              <Label>Commission Multiplier</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="2.0"
                value={boostForm.multiplier}
                onChange={(e) => setBoostForm({ ...boostForm, multiplier: e.target.value })}
              />
            </div>
            <div>
              <Label>Start Time</Label>
              <Input
                type="datetime-local"
                value={boostForm.startTime}
                onChange={(e) => setBoostForm({ ...boostForm, startTime: e.target.value })}
              />
            </div>
            <div>
              <Label>End Time (48h later)</Label>
              <Input
                type="datetime-local"
                value={boostForm.endTime}
                onChange={(e) => setBoostForm({ ...boostForm, endTime: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleCreateBoost} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Boost Period
          </Button>
        </CardContent>
      </Card>

      {/* Retention Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Retention Flow
          </CardTitle>
          <CardDescription>
            Auto-send ₦200 free bet to users inactive for 7+ days (capped at ₦50k/day)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will identify users with no bets in the last 7 days and credit them ₦200 bonus.
            Daily spending is capped at ₦50,000.
          </p>
          <Button onClick={handleRunRetentionFlow} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Run Retention Flow Now
          </Button>
        </CardContent>
      </Card>

      {/* Payment Waitlist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Payment Method Waitlist
          </CardTitle>
          <CardDescription>
            Notify waitlist users when Apple Pay / Google Pay goes live (with 20% deposit boost announcement)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Button onClick={() => handleNotifyWaitlist("apple_pay")} disabled={loading} variant="outline">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Notify Apple Pay Waitlist
            </Button>
            <Button onClick={() => handleNotifyWaitlist("google_pay")} disabled={loading} variant="outline">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Notify Google Pay Waitlist
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Users will receive email notification announcing the launch with instant 20% deposit boost offer
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrowthTools;