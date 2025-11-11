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
import { useAIPredictions } from "@/hooks/useAIPredictions";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const AIPredictions = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { predictions, isLoading } = useAIPredictions();

  const stats = {
    totalPredictions: predictions.length,
    winRate: 73.2,
    avgConfidence: predictions.length > 0 
      ? predictions.reduce((sum, p) => sum + (Number(p.confidence_score) || 0), 0) / predictions.length 
      : 0,
    profitROI: 18.7,
    currentStreak: 12
  };

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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24" />)}
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">AI Predictions Dashboard</h1>
                <p className="text-muted-foreground">Machine learning predictions powered by advanced AI</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Total Predictions</p>
                </div>
                <p className="text-2xl font-bold">{stats.totalPredictions}</p>
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
                <p className="text-2xl font-bold">{stats.avgConfidence.toFixed(1)}%</p>
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

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="all">All Predictions ({predictions.length})</TabsTrigger>
                <TabsTrigger value="high">High Confidence</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {predictions.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Predictions Available</h3>
                    <p className="text-muted-foreground">AI predictions will appear here</p>
                  </Card>
                ) : (
                  predictions.map(pred => (
                    <Card key={pred.id} className="p-6 hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{pred.sport}</Badge>
                            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                              <Brain className="w-3 h-3 mr-1" />
                              AI Prediction
                            </Badge>
                          </div>
                          <h3 className="text-xl font-bold mb-1">{pred.home_team} vs {pred.away_team}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(pred.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                          <div className="flex items-center gap-2">
                            <Progress value={Number(pred.confidence_score) || 0} className="w-24 h-2" />
                            <span className="text-xl font-bold text-primary">{Number(pred.confidence_score || 0).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-muted-foreground mb-2">PREDICTION</p>
                        <p className="text-lg font-bold mb-3">{pred.predicted_outcome}</p>
                        {pred.reasoning && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{pred.reasoning}</p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Button className="flex-1">Add to Bet Slip</Button>
                        <Button variant="outline">View Analysis</Button>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="high" className="space-y-4">
                {predictions.filter(p => Number(p.confidence_score) >= 80).map(pred => (
                  <Card key={pred.id} className="p-6 hover:border-primary/50 transition-colors border-purple-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                        <Brain className="w-3 h-3 mr-1" />
                        {Number(pred.confidence_score || 0).toFixed(0)}% Confidence
                      </Badge>
                      <Badge variant="outline">{pred.sport}</Badge>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{pred.home_team} vs {pred.away_team}</h3>
                    <p className="text-lg font-bold mb-3 text-primary">{pred.predicted_outcome}</p>
                    <Button className="w-full">Add to Bet Slip</Button>
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
