import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Radio, Users, Eye, TrendingUp, Volume2, Maximize } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LiveStreaming = () => {
  const [activeTab, setActiveTab] = useState("live");

  const liveStreams = [
    {
      id: 1,
      sport: "Football",
      match: "Manchester United vs Liverpool",
      league: "Premier League",
      status: "LIVE",
      viewers: 45672,
      bets: 12458,
      thumbnail: "/placeholder.svg",
      quality: "HD"
    },
    {
      id: 2,
      sport: "Basketball",
      match: "Lakers vs Warriors",
      league: "NBA",
      status: "LIVE",
      viewers: 28934,
      bets: 8734,
      thumbnail: "/placeholder.svg",
      quality: "4K"
    },
    {
      id: 3,
      sport: "Tennis",
      match: "Djokovic vs Alcaraz",
      league: "Australian Open",
      status: "LIVE",
      viewers: 19283,
      bets: 5621,
      thumbnail: "/placeholder.svg",
      quality: "HD"
    }
  ];

  const upcomingStreams = [
    {
      id: 4,
      sport: "Football",
      match: "Real Madrid vs Barcelona",
      league: "La Liga",
      status: "Starts in 2h",
      subscribers: 67234,
      thumbnail: "/placeholder.svg"
    },
    {
      id: 5,
      sport: "Cricket",
      match: "India vs Australia",
      league: "Test Match",
      status: "Starts in 5h",
      subscribers: 92145,
      thumbnail: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 md:ml-64 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Live Streaming</h1>
                <p className="text-muted-foreground">Watch live matches and bet in real-time</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Radio className="w-4 h-4 text-red-500" />
                  <p className="text-xs text-muted-foreground">Live Now</p>
                </div>
                <p className="text-2xl font-bold">247</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Total Viewers</p>
                </div>
                <p className="text-2xl font-bold">1.2M+</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <p className="text-xs text-muted-foreground">Active Bets</p>
                </div>
                <p className="text-2xl font-bold">567K</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Play className="w-4 h-4 text-purple-500" />
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                </div>
                <p className="text-2xl font-bold">89</p>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="live">Live Now</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              </TabsList>

              <TabsContent value="live" className="space-y-4">
                {liveStreams.map(stream => (
                  <Card key={stream.id} className="p-6 hover:border-primary/50 transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Stream Preview */}
                      <div className="md:col-span-1">
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden group cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-purple-500/20 flex items-center justify-center">
                            <Play className="w-16 h-16 text-white opacity-80 group-hover:scale-110 transition-transform" />
                          </div>
                          <Badge className="absolute top-2 left-2 bg-red-500 text-white animate-pulse">
                            <Radio className="w-3 h-3 mr-1" />
                            {stream.status}
                          </Badge>
                          <Badge className="absolute top-2 right-2 bg-black/80 text-white">
                            {stream.quality}
                          </Badge>
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white text-sm bg-black/60 rounded px-2 py-1">
                              <Eye className="w-4 h-4" />
                              <span>{stream.viewers.toLocaleString()}</span>
                            </div>
                            <Button size="sm" variant="secondary" className="gap-1">
                              <Maximize className="w-3 h-3" />
                              Fullscreen
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Stream Info */}
                      <div className="md:col-span-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{stream.sport}</Badge>
                            <Badge variant="secondary">{stream.league}</Badge>
                          </div>
                          <h3 className="text-xl font-bold mb-3">{stream.match}</h3>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-muted/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Eye className="w-4 h-4 text-blue-500" />
                                <p className="text-xs text-muted-foreground">Live Viewers</p>
                              </div>
                              <p className="text-xl font-bold">{stream.viewers.toLocaleString()}</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <p className="text-xs text-muted-foreground">Active Bets</p>
                              </div>
                              <p className="text-xl font-bold text-green-500">{stream.bets.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button className="flex-1 gap-2">
                            <Play className="w-4 h-4" />
                            Watch & Bet Live
                          </Button>
                          <Button variant="outline" size="icon">
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingStreams.map(stream => (
                  <Card key={stream.id} className="p-6 hover:border-primary/50 transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1">
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                            <div className="text-center">
                              <Play className="w-12 h-12 text-white opacity-60 mx-auto mb-2" />
                              <p className="text-sm font-semibold text-white">{stream.status}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{stream.sport}</Badge>
                            <Badge variant="secondary">{stream.league}</Badge>
                          </div>
                          <h3 className="text-xl font-bold mb-3">{stream.match}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground mb-4">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">{stream.subscribers.toLocaleString()} waiting</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button className="flex-1">Set Reminder</Button>
                          <Button variant="outline">View Pre-Match Stats</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LiveStreaming;
