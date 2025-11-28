import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Copy, TrendingUp, DollarSign, Share2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function Affiliate() {
  const { profile } = useUserProfile();
  const [copied, setCopied] = useState(false);
  
  // Mock data - in production, fetch from backend
  const affiliateCode = `BF${profile?.id?.slice(0, 6).toUpperCase() || 'DEMO'}`;
  const referralLink = `https://betfuz.com/ref/${affiliateCode}`;
  const stats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalCommission: 125000,
    pendingCommission: 8500,
    tier: 'BRONZE',
    dailySalary: 0,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Your affiliate link has been copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Betfuz",
          text: `Join Betfuz using my referral code ${affiliateCode} and start winning!`,
          url: referralLink,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      handleCopy();
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'text-amber-600';
      case 'SILVER': return 'text-slate-400';
      case 'GOLD': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Affiliate Dashboard</h1>
            <p className="text-muted-foreground mt-1">Earn commissions by referring friends</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 bg-sidebar rounded-lg ${getTierColor(stats.tier)}`}>
            <TrendingUp className="h-5 w-5" />
            <span className="font-bold">{stats.tier} TIER</span>
          </div>
        </div>

        {/* Referral Link Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Your Referral Link</h2>
              <p className="text-sm text-muted-foreground">Share this link to earn commissions</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-background font-mono text-sm"
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

          <div className="flex gap-2">
            <Button onClick={handleShare} className="flex-1 gap-2">
              <Share2 className="h-4 w-4" />
              Share Link
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <DollarSign className="h-4 w-4" />
              View Commission History
            </Button>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Referrals</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.totalReferrals}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span className="text-sm text-muted-foreground">Active Referrals</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.activeReferrals}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Earned</span>
            </div>
            <p className="text-3xl font-bold text-foreground">₦{stats.totalCommission.toLocaleString()}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-warning" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-3xl font-bold text-foreground">₦{stats.pendingCommission.toLocaleString()}</p>
          </Card>
        </div>

        {/* Tier Information */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Affiliate Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-sidebar rounded-lg border-2 border-amber-600">
              <h4 className="text-lg font-bold text-amber-600 mb-2">BRONZE</h4>
              <p className="text-sm text-muted-foreground mb-3">Default tier for all affiliates</p>
              <ul className="space-y-2 text-sm">
                <li>• 20% commission on all bets</li>
                <li>• No minimum referrals</li>
                <li>• Basic tracking dashboard</li>
              </ul>
            </div>

            <div className="p-4 bg-sidebar rounded-lg border-2 border-slate-400">
              <h4 className="text-lg font-bold text-slate-400 mb-2">SILVER</h4>
              <p className="text-sm text-muted-foreground mb-3">Unlock at 50 active referrals</p>
              <ul className="space-y-2 text-sm">
                <li>• 25% commission on all bets</li>
                <li>• 5% sub-affiliate override</li>
                <li>• Advanced analytics</li>
              </ul>
            </div>

            <div className="p-4 bg-sidebar rounded-lg border-2 border-yellow-500">
              <h4 className="text-lg font-bold text-yellow-500 mb-2">GOLD</h4>
              <p className="text-sm text-muted-foreground mb-3">Unlock at 150 active referrals</p>
              <ul className="space-y-2 text-sm">
                <li>• 30% commission on all bets</li>
                <li>• 10% sub-affiliate override</li>
                <li>• ₦5,000 daily salary (200+ actives)</li>
                <li>• Premium support</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Daily Salary Info */}
        {stats.tier === 'GOLD' && (
          <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-6 w-6 text-yellow-500" />
              <h3 className="text-xl font-bold text-foreground">Daily Salary Status</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              {stats.activeReferrals >= 200 
                ? `You're receiving ₦5,000 daily salary! Paid at 08:00 WAT daily.`
                : `You need ${200 - stats.activeReferrals} more active referrals to unlock ₦5,000 daily salary.`
              }
            </p>
            <div className="w-full bg-sidebar rounded-full h-3">
              <div 
                className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((stats.activeReferrals / 200) * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {stats.activeReferrals}/200 active referrals
            </p>
          </Card>
        )}

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-sidebar rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium text-foreground">New Referral</p>
                  <p className="text-sm text-muted-foreground">User joined via your link</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">2 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-sidebar rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Commission Earned</p>
                  <p className="text-sm text-muted-foreground">₦2,500 from user bets</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">5 hours ago</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
