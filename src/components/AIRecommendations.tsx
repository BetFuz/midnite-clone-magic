import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, TrendingUp, RefreshCw } from "lucide-react";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { useBetRecommendations } from "@/hooks/useBetRecommendations";
import { useEffect } from "react";

const AIRecommendations = () => {
  const { addSelection } = useBetSlip();
  const { recommendations, isLoading, fetchRecommendations } = useBetRecommendations();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleAddToSlip = (rec: any) => {
    const [homeTeam, awayTeam] = rec.matchup.split(" vs ");
    addSelection({
      id: `ai-rec-${Date.now()}`,
      matchId: `${homeTeam.toLowerCase().replace(/\s+/g, "-")}-vs-${awayTeam.toLowerCase().replace(/\s+/g, "-")}`,
      sport: rec.sport,
      league: rec.league,
      homeTeam,
      awayTeam,
      selectionType: "home",
      selectionValue: rec.suggestion,
      odds: rec.odds,
      matchTime: "Upcoming",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Brain className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">AI Bet Recommendations</h2>
            <p className="text-sm text-muted-foreground">Personalized suggestions based on your history</p>
          </div>
        </div>
        <Button
          onClick={fetchRecommendations}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading && recommendations.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin">
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-muted-foreground">Analyzing your betting patterns...</p>
          </div>
        </Card>
      ) : recommendations.length === 0 ? (
        <Card className="p-8 text-center">
          <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
          <p className="text-muted-foreground mb-4">
            Place a few bets to help our AI understand your preferences
          </p>
          <Button onClick={fetchRecommendations} variant="outline" className="gap-2">
            <Brain className="h-4 w-4" />
            Generate Recommendations
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recommendations.map((rec, index) => (
            <Card
              key={index}
              className="p-4 hover:shadow-lg transition-all border-l-4 border-l-purple-500"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <h3 className="font-bold text-foreground">{rec.title}</h3>
                    <Badge
                      variant="outline"
                      className="ml-auto border-green-500 text-green-600"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {rec.confidence}% confidence
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span className="font-semibold">{rec.sport}</span>
                    <span>•</span>
                    <span>{rec.league}</span>
                  </div>

                  <p className="text-sm font-medium text-foreground mb-2">
                    {rec.matchup}
                  </p>

                  <p className="text-sm text-muted-foreground mb-3">
                    <span className="font-semibold text-foreground">Suggestion:</span> {rec.suggestion}
                  </p>

                  <div className="rounded-lg bg-purple-500/10 p-3 text-sm">
                    <p className="text-purple-600 dark:text-purple-400">
                      <span className="font-semibold">Why this bet:</span> {rec.reasoning}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-3xl font-bold text-primary">
                    {rec.odds.toFixed(2)}
                  </div>
                  <Button
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600"
                    onClick={() => handleAddToSlip(rec)}
                  >
                    Add to Slip
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
