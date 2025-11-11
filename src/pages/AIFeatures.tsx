import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AIBettingChat from "@/components/AIBettingChat";
import VoiceBetting from "@/components/VoiceBetting";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Mic, TrendingUp, Users, ShoppingCart } from "lucide-react";
import { useSocialBetting } from "@/hooks/useSocialBetting";
import SocialBetCard from "@/components/social/SocialBetCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAIPredictions } from "@/hooks/useAIPredictions";
import { useBetMarketplace } from "@/hooks/useBetMarketplace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/marketplace/ListingCard";

const AIFeatures = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const { socialBets, isLoading: socialLoading, followingIds, followUser, unfollowUser, likeBet, unlikeBet, copyBet } = useSocialBetting();
  const { predictions, isLoading: predictionsLoading } = useAIPredictions();
  const { listings, isLoading: marketplaceLoading, buyBet } = useBetMarketplace();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 md:ml-64 pb-20 md:pb-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">AI-Powered Features</h1>
              <p className="text-muted-foreground">
                Next-generation betting experience with artificial intelligence
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                <TabsTrigger value="chat" className="gap-2">
                  <Bot className="h-4 w-4" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="voice" className="gap-2">
                  <Mic className="h-4 w-4" />
                  Voice Betting
                </TabsTrigger>
                <TabsTrigger value="predictions" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  AI Predictions
                </TabsTrigger>
                <TabsTrigger value="social" className="gap-2">
                  <Users className="h-4 w-4" />
                  Social Betting
                </TabsTrigger>
                <TabsTrigger value="marketplace" className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Bet Trading
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat">
                <AIBettingChat />
              </TabsContent>

              <TabsContent value="voice">
                <VoiceBetting />
              </TabsContent>

              <TabsContent value="predictions">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">AI Match Predictions</h3>
                      <p className="text-sm text-muted-foreground">Powered by advanced machine learning algorithms</p>
                    </div>
                  </div>

                  {predictionsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-40 w-full" />
                      ))}
                    </div>
                  ) : predictions.length === 0 ? (
                    <div className="text-center py-12 border border-border rounded-lg">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No predictions available</h3>
                      <p className="text-sm text-muted-foreground">Check back soon for AI-powered predictions</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {predictions.slice(0, 10).map((prediction) => (
                        <Card key={prediction.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{prediction.home_team} vs {prediction.away_team}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">{prediction.sport}</p>
                              </div>
                              {prediction.confidence_score && (
                                <Badge variant={prediction.confidence_score > 75 ? "default" : "secondary"}>
                                  {prediction.confidence_score}% confidence
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <span className="text-sm font-medium">Prediction:</span>
                                <span className="text-sm font-semibold">{prediction.predicted_outcome}</span>
                              </div>
                              {prediction.reasoning && (
                                <p className="text-sm text-muted-foreground">{prediction.reasoning}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="social">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">Social Betting Community</h3>
                      <p className="text-sm text-muted-foreground">Follow, copy, and engage with top bettors</p>
                    </div>
                  </div>

                  {socialLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : socialBets.length === 0 ? (
                    <div className="text-center py-12 border border-border rounded-lg">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No social bets yet</h3>
                      <p className="text-sm text-muted-foreground">Be the first to share a bet with the community!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {socialBets.slice(0, 10).map((bet) => (
                        <SocialBetCard
                          key={bet.id}
                          bet={bet}
                          isFollowing={followingIds.includes(bet.user_id)}
                          onFollow={() => followUser(bet.user_id)}
                          onUnfollow={() => unfollowUser(bet.user_id)}
                          onLike={() => likeBet(bet.id)}
                          onCopy={() => copyBet(bet.id, bet.bet_slip_id)}
                          currentUserId={currentUserId}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="marketplace">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">Bet Trading Marketplace</h3>
                      <p className="text-sm text-muted-foreground">Buy and sell active bets with other users</p>
                    </div>
                  </div>

                  {marketplaceLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                      ))}
                    </div>
                  ) : listings.length === 0 ? (
                    <div className="text-center py-12 border border-border rounded-lg">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No listings available</h3>
                      <p className="text-sm text-muted-foreground">Be the first to list a bet for trading!</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {listings.slice(0, 10).map((listing) => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          onBuy={() => buyBet(listing.id, listing.asking_price)}
                          isOwnListing={currentUserId === listing.seller_id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIFeatures;