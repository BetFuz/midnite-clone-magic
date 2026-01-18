import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketOutcome {
  outcome: string;
  odds: number;
  ai_confidence?: number;
  public_sentiment?: number;
  votes?: number;
}

export interface EventPrediction {
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

export interface KalshiInsight {
  market_summary: string;
  historical_resolution_rate?: number;
  ai_outlook: 'bullish' | 'bearish' | 'neutral';
  risk_level: 'low' | 'medium' | 'high';
  key_factors?: string[];
  similar_markets_accuracy?: number;
}

// Mock data for demonstration - in production this would come from the database
const mockEvents: EventPrediction[] = [
  {
    id: 'evt-1',
    title: 'Will Bitcoin exceed $100,000 by end of Q1 2026?',
    description: 'Market resolves YES if BTC/USD exceeds $100,000 at any point before March 31, 2026.',
    category: 'crypto',
    deadline: '2026-03-31T23:59:59Z',
    totalVotes: 12450,
    status: 'open',
    markets: [
      { outcome: 'YES', odds: 1.85, ai_confidence: 62, public_sentiment: 58, votes: 7221 },
      { outcome: 'NO', odds: 2.10, ai_confidence: 38, public_sentiment: 42, votes: 5229 },
    ],
    resolution_source: { type: 'api', provider: 'CoinGecko' },
  },
  {
    id: 'evt-2',
    title: 'Nigeria 2027 Presidential Election Winner',
    description: 'Which party will win the 2027 Nigerian Presidential Election?',
    category: 'politics',
    deadline: '2027-02-25T18:00:00Z',
    totalVotes: 8320,
    status: 'open',
    markets: [
      { outcome: 'APC', odds: 2.20, ai_confidence: 45, public_sentiment: 38, votes: 3162 },
      { outcome: 'PDP', odds: 2.50, ai_confidence: 35, public_sentiment: 32, votes: 2662 },
      { outcome: 'LP', odds: 3.00, ai_confidence: 20, public_sentiment: 30, votes: 2496 },
    ],
    resolution_source: { type: 'official_statement', provider: 'INEC' },
  },
  {
    id: 'evt-3',
    title: 'Will the Fed cut rates before July 2026?',
    description: 'Market resolves YES if the Federal Reserve announces a rate cut before July 1, 2026.',
    category: 'economy',
    deadline: '2026-07-01T00:00:00Z',
    totalVotes: 5680,
    status: 'open',
    markets: [
      { outcome: 'YES', odds: 1.55, ai_confidence: 72, public_sentiment: 78, votes: 4430 },
      { outcome: 'NO', odds: 2.80, ai_confidence: 28, public_sentiment: 22, votes: 1250 },
    ],
    resolution_source: { type: 'official_statement', provider: 'Federal Reserve' },
  },
  {
    id: 'evt-4',
    title: 'AFCON 2025 Winner',
    description: 'Which nation will win the 2025 Africa Cup of Nations?',
    category: 'sports',
    deadline: '2025-02-16T20:00:00Z',
    totalVotes: 24500,
    status: 'open',
    markets: [
      { outcome: 'Nigeria', odds: 4.50, ai_confidence: 22, public_sentiment: 35, votes: 8575 },
      { outcome: 'Ivory Coast', odds: 5.00, ai_confidence: 18, public_sentiment: 15, votes: 3675 },
      { outcome: 'Morocco', odds: 4.00, ai_confidence: 25, public_sentiment: 20, votes: 4900 },
      { outcome: 'Egypt', odds: 6.00, ai_confidence: 15, public_sentiment: 12, votes: 2940 },
      { outcome: 'Other', odds: 3.50, ai_confidence: 20, public_sentiment: 18, votes: 4410 },
    ],
    resolution_source: { type: 'official_statement', provider: 'CAF' },
  },
];

const mockInsights: Record<string, KalshiInsight> = {
  'evt-1': {
    market_summary: 'Bitcoin has shown strong momentum with institutional adoption increasing. Historical patterns suggest Q1 is typically bullish for crypto markets.',
    historical_resolution_rate: 68,
    ai_outlook: 'bullish',
    risk_level: 'high',
    key_factors: [
      'ETF inflows remain strong',
      'Halving cycle historically bullish',
      'Macro uncertainty could cause volatility',
    ],
    similar_markets_accuracy: 71,
  },
  'evt-2': {
    market_summary: 'Nigerian elections historically unpredictable. Current polling shows tight race between major parties with youth vote as key swing factor.',
    historical_resolution_rate: 45,
    ai_outlook: 'neutral',
    risk_level: 'high',
    key_factors: [
      'Incumbent party advantage',
      'Economic conditions favor opposition',
      'Youth voter registration up 40%',
    ],
    similar_markets_accuracy: 52,
  },
  'evt-3': {
    market_summary: 'Economic indicators suggest potential easing cycle. Fed rhetoric has shifted dovish in recent meetings.',
    historical_resolution_rate: 82,
    ai_outlook: 'bullish',
    risk_level: 'low',
    key_factors: [
      'Inflation trending toward target',
      'Labor market cooling gradually',
      'Fed dot plot shows rate cut path',
    ],
    similar_markets_accuracy: 78,
  },
  'evt-4': {
    market_summary: 'Tournament features strong contenders. Host nation advantage and squad depth will be key factors.',
    historical_resolution_rate: 65,
    ai_outlook: 'neutral',
    risk_level: 'medium',
    key_factors: [
      'Nigeria squad at full strength',
      'Morocco recent World Cup performance',
      'Home crowd advantage for host',
    ],
    similar_markets_accuracy: 58,
  },
};

export const useEventPredictions = (category?: string) => {
  return useQuery({
    queryKey: ['event-predictions', category],
    queryFn: async () => {
      // In production, this would fetch from Supabase
      // For now, return mock data with optional category filter
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      if (category && category !== 'all') {
        return mockEvents.filter(e => e.category === category);
      }
      return mockEvents;
    },
    staleTime: 60000,
  });
};

export const useEventInsight = (eventId: string) => {
  return useQuery({
    queryKey: ['event-insight', eventId],
    queryFn: async () => {
      // In production, this could call an AI edge function
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockInsights[eventId] || null;
    },
    staleTime: 300000, // 5 minutes
    enabled: !!eventId,
  });
};

export const useAIPrediction = (eventId: string) => {
  return useQuery({
    queryKey: ['ai-prediction', eventId],
    queryFn: async () => {
      // Check if we have an existing AI prediction
      const { data, error } = await supabase
        .from('ai_predictions')
        .select('*')
        .eq('match_id', eventId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching AI prediction:', error);
        return null;
      }

      return data;
    },
    staleTime: 300000,
    enabled: !!eventId,
  });
};

export const useBettingTrend = (matchId: string) => {
  return useQuery({
    queryKey: ['betting-trend', matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_trends')
        .select('*')
        .eq('match_id', matchId);

      if (error) {
        console.error('Error fetching betting trends:', error);
        return [];
      }

      return data || [];
    },
    staleTime: 30000, // 30 seconds for more real-time feel
    enabled: !!matchId,
  });
};
