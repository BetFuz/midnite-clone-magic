import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, TrendingUp, Users, Brain, BarChart3, AlertTriangle } from 'lucide-react';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MarketOutcome {
  outcome: string;
  odds: number;
  ai_confidence?: number;
  public_sentiment?: number;
  votes?: number;
}

interface EventPrediction {
  id: string;
  title: string;
  description?: string;
  category: 'sports' | 'politics' | 'economy' | 'crypto' | 'entertainment' | 'social';
  deadline: string;
  totalVotes?: number;
  status?: 'open' | 'closed' | 'settled' | 'disputed';
  markets: MarketOutcome[];
  resolution_source?: {
    type: 'api' | 'official_statement' | 'admin_verification';
    provider: string;
  };
}

interface Props {
  event: EventPrediction;
  showInsights?: boolean;
}

const categoryColors: Record<string, string> = {
  sports: 'bg-green-500/10 text-green-500 border-green-500/20',
  politics: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  economy: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  crypto: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  entertainment: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  social: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
};

const EventPredictionCard = ({ event, showInsights = true }: Props) => {
  const { addSelection } = useBetSlip();

  const handleAddToBetSlip = (outcome: string, odds: number) => {
    addSelection({
      id: `${event.id}-${outcome}`,
      matchId: event.id,
      sport: 'Predict',
      league: event.category,
      homeTeam: event.title,
      awayTeam: '',
      matchTime: event.deadline,
      selectionType: 'other',
      selectionValue: outcome,
      odds: odds,
    });

    toast.success('Added to Bet Slip!', {
      description: `${outcome} @ ${odds.toFixed(2)}`,
    });
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const daysUntilDeadline = () => {
    const now = new Date();
    const deadline = new Date(event.deadline);
    const diff = deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const days = daysUntilDeadline();

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  // Calculate implied probability from odds
  const getImpliedProbability = (odds: number) => {
    return ((1 / odds) * 100).toFixed(1);
  };

  // Get confidence level color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-500';
    if (confidence >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  // Get sentiment bias warning
  const getSentimentWarning = (sentiment: number) => {
    if (sentiment >= 75) return { show: true, message: 'Crowd heavily biased on this outcome' };
    return { show: false, message: '' };
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: `hsl(var(--${event.category === 'sports' ? 'primary' : 'accent'}))` }}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className={cn('text-xs capitalize', categoryColors[event.category])}>
                {event.category}
              </Badge>
              {event.status && event.status !== 'open' && (
                <Badge variant="secondary" className="text-xs">
                  {event.status}
                </Badge>
              )}
              {days > 0 && days <= 7 && (
                <Badge variant="destructive" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Closing Soon
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
            {event.description && (
              <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {event.totalVotes && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{formatNumber(event.totalVotes)} bets</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Closes: {formatDeadline(event.deadline)}</span>
              </div>
              {days > 0 && (
                <span className="text-xs">({days} days)</span>
              )}
            </div>
          </div>
        </div>

        {/* Market Outcomes with AI Overlay */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-2">
            <span>Prediction Options</span>
            {showInsights && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs cursor-help">
                      <Brain className="h-3 w-3" />
                      AI Insights Active
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI confidence and public sentiment analysis enabled</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="grid gap-3">
            {event.markets.map((m, index) => {
              const impliedProb = getImpliedProbability(m.odds);
              const sentimentWarning = m.public_sentiment ? getSentimentWarning(m.public_sentiment) : { show: false, message: '' };
              const displayPercentage = m.public_sentiment ?? (m.votes && event.totalVotes ? (m.votes / event.totalVotes) * 100 : parseFloat(impliedProb));

              return (
                <div
                  key={index}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors space-y-3"
                >
                  {/* Main row: outcome name + odds button */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{m.outcome}</span>
                        {sentimentWarning.show && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-amber-500">{sentimentWarning.message}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddToBetSlip(m.outcome, m.odds)}
                      className="min-w-[70px]"
                    >
                      {m.odds.toFixed(2)}
                    </Button>
                  </div>

                  {/* AI Probability Overlay */}
                  {showInsights && (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {/* Implied Probability */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex flex-col items-center p-2 rounded bg-muted/50 cursor-help">
                              <BarChart3 className="h-3 w-3 mb-1 text-muted-foreground" />
                              <span className="font-semibold">{impliedProb}%</span>
                              <span className="text-muted-foreground text-[10px]">Implied</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Implied probability from odds (1/odds)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* AI Confidence */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex flex-col items-center p-2 rounded bg-muted/50 cursor-help">
                              <Brain className="h-3 w-3 mb-1 text-muted-foreground" />
                              <span className={cn('font-semibold', m.ai_confidence ? getConfidenceColor(m.ai_confidence) : '')}>
                                {m.ai_confidence ? `${m.ai_confidence}%` : '--'}
                              </span>
                              <span className="text-muted-foreground text-[10px]">AI Conf.</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>AI model confidence score</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Public Sentiment */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex flex-col items-center p-2 rounded bg-muted/50 cursor-help">
                              <Users className="h-3 w-3 mb-1 text-muted-foreground" />
                              <span className="font-semibold">
                                {m.public_sentiment ? `${m.public_sentiment.toFixed(0)}%` : '--'}
                              </span>
                              <span className="text-muted-foreground text-[10px]">Sentiment</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Percentage of total stake on this outcome</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{displayPercentage.toFixed(1)}% backing</span>
                      {m.votes && <span>{formatNumber(m.votes)} bets</span>}
                    </div>
                    <Progress value={displayPercentage} className="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolution Source */}
        {event.resolution_source && (
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <span>Resolution: {event.resolution_source.type.replace('_', ' ')} via {event.resolution_source.provider}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EventPredictionCard;
