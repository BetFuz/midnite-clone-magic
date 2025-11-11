import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Lock, Unlock, Plus, Award, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency";
import { usePoolBetting } from "@/hooks/usePoolBetting";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const PoolBetting = () => {
  const [activeTab, setActiveTab] = useState("public");
  const { pools, myPools, isLoading, joinPool } = usePoolBetting();

  const publicPools = pools.filter(p => p.type === "public");
  const privatePools = pools.filter(p => p.type === "private");

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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Pool Betting</h1>
                  <p className="text-muted-foreground">Join or create collaborative betting pools</p>
                </div>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Pool
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Active Pools</p>
                <p className="text-2xl font-bold">{pools.length}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Stake</p>
                <p className="text-2xl font-bold">{formatCurrency(pools.reduce((sum, p) => sum + Number(p.total_stake), 0))}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">My Pools</p>
                <p className="text-2xl font-bold text-primary">{myPools.length}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Potential Win</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(myPools.reduce((sum, p) => sum + Number(p.potential_win) / (p.member_count || 1), 0))}</p>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="public">Public Pools ({publicPools.length})</TabsTrigger>
                <TabsTrigger value="private">Private Pools ({privatePools.length})</TabsTrigger>
                <TabsTrigger value="mine">My Pools ({myPools.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="public" className="space-y-4">
                {publicPools.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Active Pools</h3>
                    <p className="text-muted-foreground mb-6">Be the first to create a pool!</p>
                    <Button>Create Pool</Button>
                  </Card>
                ) : (
                  publicPools.map(pool => (
                    <Card key={pool.id} className="p-6 hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{pool.sport}</Badge>
                            <Badge variant="secondary" className="gap-1">
                              <Users className="w-3 h-3" />
                              {pool.member_count}/{pool.max_members}
                            </Badge>
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                              <Unlock className="w-3 h-3 mr-1" />
                              Open
                            </Badge>
                          </div>
                          <h3 className="text-xl font-bold mb-2">{pool.name}</h3>
                          {pool.description && (
                            <p className="text-sm text-muted-foreground mb-3">{pool.description}</p>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Total Pool</p>
                              <p className="font-bold">{formatCurrency(pool.total_stake)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Min Entry</p>
                              <p className="font-bold">{formatCurrency(pool.min_entry)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Selections</p>
                              <p className="font-bold">{pool.selections_count} bets</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Total Odds</p>
                              <p className="font-bold text-primary">{Number(pool.total_odds).toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Pool Capacity</span>
                              <span className="font-medium">{Math.round(((pool.member_count || 0) / pool.max_members) * 100)}%</span>
                            </div>
                            <Progress value={((pool.member_count || 0) / pool.max_members) * 100} className="h-2" />
                          </div>

                          <div className="bg-muted/50 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Potential Win Per Person</p>
                                <p className="text-2xl font-bold text-green-500">
                                  {formatCurrency(Number(pool.potential_win) / (pool.member_count || 1))}
                                </p>
                              </div>
                              <Award className="w-12 h-12 text-yellow-500" />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            Closes {formatDistanceToNow(new Date(pool.closes_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          className="flex-1" 
                          disabled={pool.is_member}
                          onClick={() => joinPool(pool.id, pool.min_entry)}
                        >
                          {pool.is_member ? "Already Joined" : `Join Pool (${formatCurrency(pool.min_entry)})`}
                        </Button>
                        <Button variant="outline">View Details</Button>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="private" className="space-y-4">
                {privatePools.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Private Pools</h3>
                    <p className="text-muted-foreground">Private pools require invitation</p>
                  </Card>
                ) : (
                  privatePools.map(pool => (
                    <Card key={pool.id} className="p-6 border-purple-500/30 bg-purple-500/5">
                      <div className="flex items-center gap-2 mb-4">
                        <Lock className="w-5 h-5 text-purple-500" />
                        <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                          Private Pool
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{pool.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">Invitation required to join</p>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Members</p>
                          <p className="font-bold">{pool.member_count}/{pool.max_members}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Min Entry</p>
                          <p className="font-bold">{formatCurrency(pool.min_entry)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pool Value</p>
                          <p className="font-bold">{formatCurrency(pool.total_stake)}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">Request Invitation</Button>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="mine" className="space-y-4">
                {myPools.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Active Pools</h3>
                    <p className="text-muted-foreground mb-6">Join a pool or create your own to get started</p>
                    <Button>Browse Public Pools</Button>
                  </Card>
                ) : (
                  myPools.map(pool => (
                    <Card key={pool.id} className="p-6 border-primary/50">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          Active Member
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{pool.name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Your Stake</p>
                          <p className="font-bold">{formatCurrency(pool.min_entry)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Your Share</p>
                          <p className="font-bold text-green-500">{formatCurrency(Number(pool.potential_win) / (pool.member_count || 1))}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Odds</p>
                          <p className="font-bold text-primary">{Number(pool.total_odds).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Closes In</p>
                          <p className="font-bold">{formatDistanceToNow(new Date(pool.closes_at))}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button className="flex-1">View Pool</Button>
                        <Button variant="outline">Share Pool</Button>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PoolBetting;
