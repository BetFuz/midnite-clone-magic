import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Target, Zap, Clock, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const AIPredictions = () => {
  const [activeTab, setActiveTab] = useState("today");

  const predictions = [
    {
      id: 1,
      sport: "Football",
      match: "Manchester United vs Liverpool",
      league: "Premier League",
      prediction: "Liverpool to Win",
      confidence: 87,
      odds: 2.15,
      reasoning: "Liverpool's recent form is exceptional with 5 consecutive wins. Man United struggling with injuries to key defenders. Historical H2H favors Liverpool at Old Trafford in recent seasons.",
      aiModel: "GPT-5 Enhanced",
      timestamp: "2 hours ago",
      status: "pending"
    },
    {
      id: 2,
      sport: "Basketball",
      match: "Lakers vs Warriors",
      league: "NBA",
      prediction: "Over 225.5 Points",
      confidence: 92,
      odds: 1.90,
      reasoning: "Both teams ranked top 3 in offensive efficiency. Warriors averaging 118 PPG at home, Lakers 112 PPG on road. Last 3 meetings all exceeded 230 points. Fast-paced matchup expected.",
      aiModel: "Claude Neural",
      timestamp: "4 hours ago",
      status: "pending"
    },
    {
      id: 3,
      sport: "Tennis",
      match: "Djokovic vs Alcaraz",
      league: "Australian Open - Final",
      prediction: "Alcaraz to Win in 4 Sets",
      confidence: 78,
      odds: 2.45,
      reasoning: "Alcaraz's youth and speed advantage on hard court. Djokovic showing fatigue in semi-final. Weather conditions favor aggressive baseline play. Alcaraz won last 2 meetings.",
      aiModel: "GPT-5 Enhanced",
      timestamp: "6 hours ago",
      status: "won"
    },
    {
      id: 4,
      sport: "Football",
      match: "Real Madrid vs Barcelona",
      league: "La Liga",
      prediction: "Both Teams to Score",
      confidence: 94,
      odds: 1.72,
      reasoning: "El Clasico historically high-scoring. Both teams' attacking prowess undeniable. Real Madrid scored in last 12 home games, Barcelona in last 10 away games. Defensive vulnerabilities on both sides.",
      aiModel: "Claude Neural",
      timestamp: "1 day ago",
      status: "won"
    },
    {
      id: 5,
      sport: "Cricket",
      match: "India vs Australia",
      league: "Test Series",
      prediction: "India to Win by Innings",
      confidence: 81,
      odds: 3.20,
      reasoning: "India's spin attack devastating on home pitches. Australia's batting lineup struggling against spin. Weather forecast shows no rain interruptions. India unbeaten in last 15 home Tests.",
      aiModel: "GPT-5 Enhanced",
      timestamp: "1 day ago",
      status: "pending"
    }
  ];

  const stats = {
    totalPredictions: 2847,
    winRate: 73.2,
    avgConfidence: 84.5,
    profitROI: 18.7,
    currentStreak: 12
  };

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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">AI Predictions Dashboard</h1>
                <p className="text-muted-foreground">Advanced machine learning predictions powered by GPT-5 & Claude</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Total Predictions</p>
                </div>
                <p className="text-2xl font-bold">{stats.totalPredictions.toLocaleString()}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                </div>
                <p className="text-2xl font-bold text-green-500">{stats.winRate}%</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <p className="text-xs text-muted-foreground">Avg Confidence</p>
                </div>
                <p className="text-2xl font-bold">{stats.avgConfidence}%</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <p className="text-xs text-muted-foreground">ROI</p>
                </div>
                <p className="text-2xl font-bold text-yellow-500">+{stats.profitROI}%</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Win Streak</p>
                </div>
                <p className="text-2xl font-bold text-blue-500">{stats.currentStreak}</p>
              </Card>
            </div>

            {/* Predictions Feed */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="today">Today's Picks</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="won">Past Winners</TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-4">
                {predictions.filter(p => p.status === "pending").map(pred => (
                  <Card key={pred.id} className="p-6 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{pred.sport}</Badge>
                          <Badge variant="secondary">{pred.league}</Badge>
                          <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                            <Brain className="w-3 h-3 mr-1" />
                            {pred.aiModel}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{pred.match}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {pred.timestamp}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                        <div className="flex items-center gap-2">
                          <Progress value={pred.confidence} className="w-24 h-2" />
                          <span className="text-xl font-bold text-primary">{pred.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-muted-foreground">AI PREDICTION</p>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-lg px-3 py-1">
                          {pred.odds.toFixed(2)}
                        </Badge>
                      </div>
                      <p className="text-lg font-bold mb-3">{pred.prediction}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{pred.reasoning}</p>
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1">Add to Bet Slip</Button>
                      <Button variant="outline">View Analysis</Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="trending" className="space-y-4">
                {predictions.slice(0, 3).map(pred => (
                  <Card key={pred.id} className="p-6 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{pred.sport}</Badge>
                          <Badge variant="secondary">{pred.league}</Badge>
                          <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{pred.match}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                        <span className="text-xl font-bold text-primary">{pred.confidence}%</span>
                      </div>
                    </div>
                    <p className="text-lg font-bold mb-2">{pred.prediction}</p>
                    <Button className="w-full">Add to Bet Slip @ {pred.odds.toFixed(2)}</Button>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="won" className="space-y-4">
                {predictions.filter(p => p.status === "won").map(pred => (
                  <Card key={pred.id} className="p-6 border-green-500/50 bg-green-500/5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{pred.sport}</Badge>
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Won
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{pred.match}</h3>
                        <p className="text-sm text-muted-foreground">{pred.timestamp}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                        <span className="text-xl font-bold text-green-500">{pred.confidence}%</span>
                      </div>
                    </div>
                    <p className="text-lg font-bold mb-2">{pred.prediction} @ {pred.odds.toFixed(2)}</p>
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

export default AIPredictions;
