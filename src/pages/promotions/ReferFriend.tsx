import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Copy, Share2, Gift, Mail } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const ReferFriend = () => {
  const [referralCode] = useState("BETFUZ2024XYZ");
  const referralLink = `https://betfuz.com/join/${referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const handleShare = () => {
    const shareText = `Join me on Betfuz and get ${formatCurrency(5000)} bonus! Use code: ${referralCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join Betfuz',
        text: shareText,
        url: referralLink,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied!",
        description: "Share message copied to clipboard",
      });
    }
  };

  const referrals = [
    { name: "John D.", status: "Active", earned: 5000, date: "10/11/2024" },
    { name: "Sarah M.", status: "Active", earned: 5000, date: "08/11/2024" },
    { name: "Mike O.", status: "Pending", earned: 0, date: "07/11/2024" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">Refer a Friend</h1>
                  <p className="text-muted-foreground">Earn {formatCurrency(5000)} for each friend who joins</p>
                </div>
              </div>
            </div>

            <Card className="p-8 bg-gradient-to-br from-pink-500/10 via-pink-600/10 to-background border-2 border-pink-500/30 mb-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Earn <span className="text-pink-500">{formatCurrency(5000)}</span> Per Friend
                </h2>
                <p className="text-lg text-muted-foreground">
                  Your friend gets {formatCurrency(5000)} bonus • You get {formatCurrency(5000)} bonus
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-background p-4 rounded-lg border border-border text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Referrals</p>
                  <p className="text-3xl font-bold text-pink-500">3</p>
                </div>
                <div className="bg-background p-4 rounded-lg border border-border text-center">
                  <p className="text-sm text-muted-foreground mb-1">Active Friends</p>
                  <p className="text-3xl font-bold text-success">2</p>
                </div>
                <div className="bg-background p-4 rounded-lg border border-border text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
                  <p className="text-3xl font-bold text-foreground">{formatCurrency(10000)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border mb-6">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Share2 className="h-5 w-5 text-pink-500" />
                Share Your Referral Code
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Your Referral Code</label>
                  <div className="flex gap-2">
                    <Input
                      value={referralCode}
                      readOnly
                      className="font-mono font-bold text-lg"
                    />
                    <Button
                      onClick={handleCopyCode}
                      className="bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Your Referral Link</label>
                  <div className="flex gap-2">
                    <Input
                      value={referralLink}
                      readOnly
                      className="text-sm"
                    />
                    <Button
                      onClick={handleCopyLink}
                      className="bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleShare}
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share via Social
                  </Button>
                  <Button
                    onClick={() => {
                      window.location.href = `mailto:?subject=Join Betfuz&body=Use my code ${referralCode} to get ${formatCurrency(5000)} bonus: ${referralLink}`;
                    }}
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Share via Email
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border mb-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Your Referrals</h3>
              <div className="space-y-3">
                {referrals.map((referral, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                    <div>
                      <p className="font-semibold text-foreground">{referral.name}</p>
                      <p className="text-sm text-muted-foreground">{referral.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={referral.status === "Active" ? "bg-success text-white" : "bg-muted text-muted-foreground"}>
                        {referral.status}
                      </Badge>
                      {referral.earned > 0 && (
                        <p className="font-bold text-success">{formatCurrency(referral.earned)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-muted/50 border-border">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <Gift className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">How It Works</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>1. Share your unique referral code or link with friends</li>
                    <li>2. Your friend signs up and makes their first deposit of at least {formatCurrency(5000)}</li>
                    <li>3. They get {formatCurrency(5000)} bonus and you get {formatCurrency(5000)} bonus</li>
                    <li>4. No limit on referrals - the more friends, the more you earn!</li>
                    <li>• 18+ BeGambleAware.org. Terms apply.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReferFriend;
