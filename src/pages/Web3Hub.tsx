import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNFTBadges } from "@/hooks/useNFTBadges";
import { Skeleton } from "@/components/ui/skeleton";

const Web3Hub = () => {
  const { badges, isLoading } = useNFTBadges();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MobileNav />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto p-4 md:p-6">
              <Skeleton className="h-12 w-64 mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />

      <div className="flex pt-16">
        <Sidebar />

        <main className="flex-1 md:ml-64 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Achievement Badges</h1>
                <p className="text-muted-foreground">Earn NFT badges by completing achievements and winning bets</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-purple-500" />
                  <p className="text-xs text-muted-foreground">Total Badges</p>
                </div>
                <p className="text-2xl font-bold">{badges.length}</p>
              </Card>
            </div>

            {badges.length === 0 ? (
              <Card className="p-12 text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Badges Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Earn badges by completing achievements and winning bets
                </p>
                <Button onClick={() => window.location.href = '/'}>Start Betting</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {badges.map(badge => (
                  <Card key={badge.id} className="p-6 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <Badge className={`${
                        badge.rarity === "Legendary" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                        badge.rarity === "Epic"      ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                        badge.rarity === "Rare"      ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                        "bg-muted"
                      }`}>
                        {badge.rarity || "Common"}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{badge.badge_name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{badge.badge_type}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Token: {badge.token_id || "Pending"}</span>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(badge.minted_at), { addSuffix: true })}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Web3Hub;
