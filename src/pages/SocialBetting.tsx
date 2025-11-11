import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, Heart, Clock } from "lucide-react";
import { useSocialBetting } from "@/hooks/useSocialBetting";
import SocialBetCard from "@/components/social/SocialBetCard";
import TopBettors from "@/components/social/TopBettors";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const SocialBetting = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [currentUserId, setCurrentUserId] = useState<string>();
  const {
    socialBets,
    isLoading,
    followingIds,
    followUser,
    unfollowUser,
    likeBet,
    copyBet,
  } = useSocialBetting();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    loadUser();
  }, []);

  const filteredBets = activeTab === "following"
    ? socialBets.filter(bet => followingIds.includes(bet.user_id))
    : activeTab === "trending"
    ? [...socialBets].sort((a, b) => (b.likes_count + b.copies_count) - (a.likes_count + a.copies_count))
    : socialBets;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 md:ml-64 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">Social Betting</h1>
              <p className="text-muted-foreground">
                Follow top bettors, copy winning strategies, and share your own
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-2">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="all" className="gap-2">
                      <Users className="h-4 w-4" />
                      All Bets
                    </TabsTrigger>
                    <TabsTrigger value="following" className="gap-2">
                      <Heart className="h-4 w-4" />
                      Following
                    </TabsTrigger>
                    <TabsTrigger value="trending" className="gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Trending
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab}>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="bg-card rounded-lg p-6 animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-10 w-10 bg-muted rounded-full"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-muted rounded w-1/4"></div>
                                <div className="h-3 bg-muted rounded w-1/6"></div>
                              </div>
                            </div>
                            <div className="h-32 bg-muted rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : filteredBets.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No bets yet</h3>
                        <p className="text-muted-foreground">
                          {activeTab === "following"
                            ? "Follow users to see their bets here"
                            : "Be the first to share a bet!"}
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[calc(100vh-300px)]">
                        <div className="space-y-4 pr-4">
                          {filteredBets.map(bet => (
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
                      </ScrollArea>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar - Top Bettors */}
              <div className="lg:col-span-1">
                <TopBettors />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SocialBetting;