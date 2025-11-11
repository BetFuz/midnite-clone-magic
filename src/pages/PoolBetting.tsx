import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Lock, Unlock, Plus, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency";

const PoolBetting = () => {
  const [activeTab, setActiveTab] = useState("public");

  const pools = [
    {
      id: 1,
      name: "Premier League Weekend Warriors",
      creator: "John Doe",
      type: "public",
      sport: "Football",
      members: 247,
      maxMembers: 500,
      totalStake: 1847500,
      minEntry: 5000,
      potentialWin: 4561250,
      status: "active",
      selections: 8,
      odds: 2.47,
      endsIn: "2 hours"
    },
    {
      id: 2,
      name: "NBA Champions Club",
      creator: "Sarah Johnson",
      type: "private",
      sport: "Basketball",
      members: 45,
      maxMembers: 50,
      totalStake: 562500,
      minEntry: 10000,
      potentialWin: 1743750,
      status: "active",
      selections: 5,
      odds: 3.10,
      endsIn: "5 hours"
    },
    {
      id: 3,
      name: "Weekend Football Accumulator",
      creator: "Mike Chen",
      type: "public",
      sport: "Football",
      members: 892,
      maxMembers: 1000,
      totalStake: 3568000,
      minEntry: 4000,
      potentialWin: 12132800,
      status: "active",
      selections: 12,
      odds: 3.40,
      endsIn: "1 day"
    },
    {
      id: 4,
      name: "Tennis Grand Slam Specials",
      creator: "Emma Wilson",
      type: "public",
      sport: "Tennis",
      members: 156,
      maxMembers: 200,
      totalStake: 936000,
      minEntry: 6000,
      potentialWin: 2621600,
      status: "active",
      selections: 6,
      odds: 2.80,
      endsIn: "3 days"
    },
    {
      id: 5,
      name: "Elite Bettors Only - VIP",
      creator: "David Martinez",
      type: "private",
      sport: "Mixed",
      members: 12,
      maxMembers: 20,
      totalStake: 960000,
      minEntry: 50000,
      potentialWin: 5280000,
      status: "locked",
      selections: 15,
      odds: 5.50,
      endsIn: "12 hours"
    }
  ];

  const myPools = pools.filter(p => [1, 2].includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 md:ml-64 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            {/* Header */}
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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Active Pools</p>
                <p className="text-2xl font-bold">1,284</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Participants</p>
                <p className="text-2xl font-bold">45,673</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">My Pools</p>
                <p className="text-2xl font-bold text-primary">2</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Potential Win</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(6305000)}</p>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="public">Public Pools</TabsTrigger>
                <TabsTrigger value="private">Private Pools</TabsTrigger>
                <TabsTrigger value="mine">My Pools</TabsTrigger>
              </TabsList>

              <TabsContent value="public" className="space-y-4">
                {pools.filter(p => p.type === "public").map(pool => (
                  <Card key={pool.id} className="p-6 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{pool.sport}</Badge>
                          <Badge variant="secondary" className="gap-1">
                            <Users className="w-3 h-3" />
                            {pool.members}/{pool.maxMembers}
                          </Badge>
                          {pool.status === "active" ? (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                              <Unlock className="w-3 h-3 mr-1" />
                              Open
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{pool.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">Created by {pool.creator}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Total Pool</p>
                            <p className="font-bold">{formatCurrency(pool.totalStake)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Min Entry</p>
                            <p className="font-bold">{formatCurrency(pool.minEntry)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Selections</p>
                            <p className="font-bold">{pool.selections} bets</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total Odds</p>
                            <p className="font-bold text-primary">{pool.odds.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Pool Capacity</span>
                            <span className="font-medium">{Math.round((pool.members / pool.maxMembers) * 100)}%</span>
                          </div>
                          <Progress value={(pool.members / pool.maxMembers) * 100} className="h-2" />
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Potential Win Per Person</p>
                              <p className="text-2xl font-bold text-green-500">
                                {formatCurrency(pool.potentialWin / pool.members)}
                              </p>
                            </div>
                            <Award className="w-12 h-12 text-yellow-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1" disabled={pool.status === "locked"}>
                        Join Pool ({formatCurrency(pool.minEntry)})
                      </Button>
                      <Button variant="outline">View Details</Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="private" className="space-y-4">
                {pools.filter(p => p.type === "private").map(pool => (
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
                        <p className="font-bold">{pool.members}/{pool.maxMembers}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Min Entry</p>
                        <p className="font-bold">{formatCurrency(pool.minEntry)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pool Value</p>
                        <p className="font-bold">{formatCurrency(pool.totalStake)}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">Request Invitation</Button>
                  </Card>
                ))}
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
                          <p className="font-bold">{formatCurrency(pool.minEntry)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Your Share</p>
                          <p className="font-bold text-green-500">{formatCurrency(pool.potentialWin / pool.members)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Odds</p>
                          <p className="font-bold text-primary">{pool.odds.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Closes In</p>
                          <p className="font-bold">{pool.endsIn}</p>
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
