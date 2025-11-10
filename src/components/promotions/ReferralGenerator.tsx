import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export const ReferralGenerator = () => {
  const [copied, setCopied] = useState(false);
  
  // Mock referral link - in production this would be generated per user
  const referralLink = `https://betfuz.com/ref/USER${Math.random().toString(36).substring(7).toUpperCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Referral link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Betfuz",
          text: "Sign up with my referral link and get ₦5,000 bonus!",
          url: referralLink,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Share2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Refer a Friend</h3>
          <p className="text-sm text-muted-foreground">Earn ₦5,000 for each friend</p>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <Input
          type="text"
          value={referralLink}
          readOnly
          className="flex-1 bg-background"
        />
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleCopy}
          className="flex-shrink-0"
        >
          {copied ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Button 
        onClick={handleShare} 
        className="w-full gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share Link
      </Button>
    </Card>
  );
};
