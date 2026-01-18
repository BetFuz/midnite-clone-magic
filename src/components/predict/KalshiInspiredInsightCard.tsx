import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KalshiInsight {
  market_summary: string;
  historical_resolution_rate?: number;
  ai_outlook: 'bullish' | 'bearish' | 'neutral';
  risk_level: 'low' | 'medium' | 'high';
  key_factors?: string[];
  similar_markets_accuracy?: number;
}

interface Props {
  insight: KalshiInsight;
  className?: string;
}

const outlookConfig = {
  bullish: {
    icon: TrendingUp,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    label: 'Bullish',
  },
  bearish: {
    icon: TrendingDown,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    label: 'Bearish',
  },
  neutral: {
    icon: Minus,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    label: 'Neutral',
  },
};

const riskConfig = {
  low: {
    color: 'text-green-500',
    bg: 'bg-green-500/10 border-green-500/20',
    icon: CheckCircle,
    label: 'Low Risk',
  },
  medium: {
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/20',
    icon: Info,
    label: 'Medium Risk',
  },
  high: {
    color: 'text-red-500',
    bg: 'bg-red-500/10 border-red-500/20',
    icon: AlertTriangle,
    label: 'High Risk',
  },
};

const KalshiInspiredInsightCard = ({ insight, className }: Props) => {
  const outlook = outlookConfig[insight.ai_outlook];
  const risk = riskConfig[insight.risk_level];
  const OutlookIcon = outlook.icon;
  const RiskIcon = risk.icon;

  return (
    <Card className={cn('p-4 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Market Intelligence</span>
        </div>
        <Badge variant="outline" className={cn('text-xs', risk.bg, risk.color)}>
          <RiskIcon className="h-3 w-3 mr-1" />
          {risk.label}
        </Badge>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {insight.market_summary}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* AI Outlook */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn('flex flex-col items-center p-3 rounded-lg cursor-help', outlook.bg)}>
                <OutlookIcon className={cn('h-5 w-5 mb-1', outlook.color)} />
                <span className={cn('text-sm font-semibold', outlook.color)}>{outlook.label}</span>
                <span className="text-xs text-muted-foreground">AI Outlook</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI model's directional prediction for this market</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Historical Resolution Rate */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 cursor-help">
                <span className="text-lg font-bold">
                  {insight.historical_resolution_rate !== undefined 
                    ? `${insight.historical_resolution_rate}%` 
                    : '--'}
                </span>
                <span className="text-xs text-muted-foreground text-center">Resolution Rate</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>How often similar markets resolve as expected</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Similar Markets Accuracy */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 cursor-help">
                <span className="text-lg font-bold">
                  {insight.similar_markets_accuracy !== undefined 
                    ? `${insight.similar_markets_accuracy}%` 
                    : '--'}
                </span>
                <span className="text-xs text-muted-foreground text-center">AI Accuracy</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI prediction accuracy on similar past markets</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Key Factors */}
      {insight.key_factors && insight.key_factors.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Key Factors</span>
          <ul className="space-y-1">
            {insight.key_factors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs">
                <span className="text-primary mt-0.5">•</span>
                <span className="text-muted-foreground">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground/70 pt-2 border-t">
        AI insights are for informational purposes only. Past performance does not guarantee future results.
      </p>
    </Card>
  );
};

export default KalshiInspiredInsightCard;
