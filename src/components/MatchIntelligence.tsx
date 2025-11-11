import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertCircle, Target } from 'lucide-react';

interface IntelligenceInsight {
  type: 'momentum' | 'trend' | 'alert' | 'prediction';
  title: string;
  description: string;
  confidence: number;
}

const MatchIntelligence = () => {
  const match = {
    homeTeam: 'Man City',
    awayTeam: 'Arsenal',
    league: 'Premier League',
  };

  const insights: IntelligenceInsight[] = [
    {
      type: 'momentum',
      title: 'Strong Home Momentum',
      description: 'Man City won 8 of their last 10 home games with 3+ goals scored',
      confidence: 85,
    },
    {
      type: 'trend',
      title: 'High-Scoring Fixture',
      description: 'Last 5 meetings averaged 3.6 goals per game',
      confidence: 78,
    },
    {
      type: 'alert',
      title: 'Key Player Impact',
      description: 'Haaland scored in 6 consecutive home matches',
      confidence: 92,
    },
    {
      type: 'prediction',
      title: 'AI Prediction',
      description: 'Model suggests 68% probability of Over 2.5 Goals',
      confidence: 68,
    },
  ];

  const getIcon = (type: IntelligenceInsight['type']) => {
    switch (type) {
      case 'momentum': return <TrendingUp className="h-4 w-4" />;
      case 'trend': return <Target className="h-4 w-4" />;
      case 'alert': return <AlertCircle className="h-4 w-4" />;
      case 'prediction': return <Brain className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Match Intelligence</h2>
        <Badge variant="secondary" className="ml-auto">AI-Powered</Badge>
      </div>

      <Card className="p-4 bg-primary/5">
        <h3 className="font-semibold mb-1">
          {match.homeTeam} vs {match.awayTeam}
        </h3>
        <p className="text-sm text-muted-foreground">{match.league}</p>
      </Card>

      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-start gap-3">
              <div className={`rounded-full bg-primary/10 p-2 ${getConfidenceColor(insight.confidence)}`}>
                {getIcon(insight.type)}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm">{insight.title}</h3>
                  <Badge variant="outline" className={getConfidenceColor(insight.confidence)}>
                    {insight.confidence}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex items-start gap-3">
          <Brain className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-blue-600">AI Recommendation</h3>
            <p className="text-sm">
              Based on historical data and current form, we recommend considering <span className="font-semibold">Over 2.5 Goals</span> and <span className="font-semibold">Haaland To Score</span> markets for this fixture.
            </p>
          </div>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Insights powered by machine learning and statistical analysis
      </p>
    </div>
  );
};

export default MatchIntelligence;
