import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Target } from "lucide-react";
import { useBetSlip } from "@/contexts/BetSlipContext";

interface Suggestion {
  id: string;
  matchId: string;
  title: string;
  description: string;
  odds: number;
  confidence: number;
  reason: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
}

const PersonalizedSuggestions = () => {
  const { addSelection } = useBetSlip();

  const suggestions: Suggestion[] = [
    {
      id: "sugg-1",
      matchId: "live-1",
      title: "Man City to Score Next",
      description: "Based on your betting history & current momentum",
      odds: 1.75,
      confidence: 85,
      reason: "You've won 3/4 similar bets • City dominating possession",
      sport: "Football",
      league: "Premier League",
      homeTeam: "Manchester City",
      awayTeam: "Arsenal",
    },
    {
      id: "sugg-2",
      matchId: "live-2",
      title: "Lakers Over 105.5 Points",
      description: "High scoring game trend detected",
      odds: 1.90,
      confidence: 78,
      reason: "Last 5 games averaged 112 points • Strong offensive quarter",
      sport: "Basketball",
      league: "NBA",
      homeTeam: "LA Lakers",
      awayTeam: "Boston Celtics",
    },
    {
      id: "sugg-3",
      matchId: "live-3",
      title: "Both Teams to Score",
      description: "El Clásico intensity building",
      odds: 1.65,
      confidence: 72,
      reason: "Historical data shows 89% BTTS in last 10 meetings",
      sport: "Football",
      league: "La Liga",
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
    },
  ];

  const handleAddSuggestion = (suggestion: Suggestion) => {
    addSelection({
      id: suggestion.id,
      matchId: suggestion.matchId,
      sport: suggestion.sport,
      league: suggestion.league,
      homeTeam: suggestion.homeTeam,
      awayTeam: suggestion.awayTeam,
      selectionType: "home",
      selectionValue: suggestion.title,
      odds: suggestion.odds,
      matchTime: "LIVE",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <h2 className="text-xl font-bold text-foreground">For You</h2>
        <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20">
          AI Powered
        </Badge>
      </div>

      <div className="grid gap-3">
        {suggestions.map((suggestion) => (
          <Card
            key={suggestion.id}
            className="p-4 hover:shadow-md transition-all border-l-4 border-l-purple-500"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-foreground">{suggestion.title}</h3>
                  <Badge
                    variant="outline"
                    className="text-xs border-green-500 text-green-600"
                  >
                    <Target className="h-3 w-3 mr-1" />
                    {suggestion.confidence}% match
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-2">
                  {suggestion.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-purple-500" />
                  <span>{suggestion.reason}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-2xl font-bold text-primary">
                  {suggestion.odds.toFixed(2)}
                </div>
                <Button
                  size="sm"
                  className="bg-purple-500 hover:bg-purple-600"
                  onClick={() => handleAddSuggestion(suggestion)}
                >
                  Add to Slip
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedSuggestions;
