import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Award, Lock, TrendingUp, Coins, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/currency";
import { useNFTBadges } from "@/hooks/useNFTBadges";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const Web3Hub = () => {
  const [activeTab, setActiveTab] = useState("wallet");
  const [walletConnected, setWalletConnected] = useState(true);
  const { badges, isLoading } = useNFTBadges();

  const transactions = [
    { type: "Mint", item: "First Win NFT", date: "2024-01-15", txHash: "0x7a8b...3c4d" },
    { type: "Transfer", item: "10-Win Streak", date: "2024-02-20", txHash: "0x9e1f...5g6h" },
  ];

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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Web3 Hub</h1>
                  <p className="text-muted-foreground">NFT badges, crypto wallet & blockchain features</p>
                </div>
              </div>
              {walletConnected && (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-4 py-2">
                  <Shield className="w-3 h-3 mr-2" />
                  Wallet Connected
                </Badge>
              )}
            </div>

            {walletConnected ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4 text-purple-500" />
                      <p className="text-xs text-muted-foreground">NFT Badges</p>
                    </div>
                    <p className="text-2xl font-bold">{badges.length}</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <p className="text-xs text-muted-foreground">Portfolio Value</p>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(2800000)}</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <p className="text-xs text-muted-foreground">Crypto Balance</p>
                    </div>
                    <p className="text-2xl font-bold">0.347 ETH</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-blue-500" />
                      <p className="text-xs text-muted-foreground">Locked Rewards</p>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(450000)}</p>
                  </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="wallet">Wallet</TabsTrigger>
                    <TabsTrigger value="badges">NFT Badges ({badges.length})</TabsTrigger>
                    <TabsTrigger value="transactions">Blockchain</TabsTrigger>
                  </TabsList>

                  <TabsContent value="wallet" className="space-y-6">
                    <Card className="p-6">
                      <h3 className="text-lg font-bold mb-4">Crypto Wallet</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                              <span className="text-white font-bold">Ξ</span>
                            </div>
                            <div>
                              <p className="font-semibold">Ethereum</p>
                              <p className="text-sm text-muted-foreground">0.347 ETH</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(1250000)}</p>
                            <p className="text-sm text-green-500">+12.5%</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                              <span className="text-white font-bold">₿</span>
                            </div>
                            <div>
                              <p className="font-semibold">Bitcoin</p>
                              <p className="text-sm text-muted-foreground">0.0089 BTC</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(850000)}</p>
                            <p className="text-sm text-green-500">+8.2%</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <Button className="flex-1">Deposit</Button>
                        <Button variant="outline" className="flex-1">Withdraw</Button>
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="badges" className="space-y-4">
                    {badges.length === 0 ? (
                      <Card className="p-12 text-center">
                        <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No NFT Badges Yet</h3>
                        <p className="text-muted-foreground mb-6">
                          Earn badges by completing achievements and winning bets
                        </p>
                        <Button>View Achievements</Button>
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
                                badge.rarity === "Epic" ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                                badge.rarity === "Rare" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                "bg-muted"
                              }`}>
                                {badge.rarity || "Common"}
                              </Badge>
                            </div>
                            <h3 className="font-bold text-lg mb-2">{badge.badge_name}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{badge.badge_type}</p>
                            <div className="flex items-center justify-between text-sm mb-3">
                              <span className="text-muted-foreground">Token: {badge.token_id || "Pending"}</span>
                              <span className="text-muted-foreground">
                                {format(new Date(badge.minted_at), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <div className="mt-4 flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                              <Button variant="outline" size="sm" className="flex-1">Transfer</Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="transactions" className="space-y-4">
                    <Card className="p-6">
                      <h3 className="text-lg font-bold mb-4">Recent Blockchain Transactions</h3>
                      {transactions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No transactions yet
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {transactions.map((tx, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Shield className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold">{tx.type}: {tx.item}</p>
                                  <p className="text-sm text-muted-foreground">{tx.date}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                View: {tx.txHash}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card className="p-12 text-center">
                <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-2xl font-bold mb-2">Connect Your Web3 Wallet</h3>
                <p className="text-muted-foreground mb-6">
                  Connect your wallet to access NFT badges, crypto betting, and blockchain features
                </p>
                <Button size="lg" onClick={() => setWalletConnected(true)}>
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Wallet
                </Button>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Web3Hub;
