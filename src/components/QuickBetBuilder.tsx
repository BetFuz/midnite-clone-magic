import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Star } from 'lucide-react';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { toast } from 'sonner';

interface QuickBetOption {
  id: string;
  title: string;
  description: string;
  matches: Array<{
    homeTeam: string;
    awayTeam: string;
    selection: string;
    odds: number;
  }>;
  totalOdds: number;
  type: 'popular' | 'trending' | 'expert';
}

const quickBetOptions: QuickBetOption[] = [
  {
    id: 'qb1',
    title: 'Weekend Accumulator',
    description: 'Top 5 weekend picks',
    matches: [
      { homeTeam: 'Man City', awayTeam: 'Arsenal', selection: 'Home Win', odds: 2.10 },
      { homeTeam: 'Liverpool', awayTeam: 'Chelsea', selection: 'Over 2.5', odds: 1.85 },
      { homeTeam: 'Barcelona', awayTeam: 'Real Madrid', selection: 'BTTS', odds: 1.70 },
      { homeTeam: 'Bayern', awayTeam: 'Dortmund', selection: 'Home Win', odds: 1.65 },
      { homeTeam: 'PSG', awayTeam: 'Lyon', selection: 'Over 2.5', odds: 1.55 },
    ],
    totalOdds: 15.24,
    type: 'popular',
  },
  {
    id: 'qb2',
    title: 'Safe Banker',
    description: '3 high probability picks',
    matches: [
      { homeTeam: 'Man City', awayTeam: 'Burnley', selection: 'Home Win', odds: 1.25 },
      { homeTeam: 'Real Madrid', awayTeam: 'Granada', selection: 'Home Win', odds: 1.18 },
      { homeTeam: 'Bayern', awayTeam: 'Augsburg', selection: 'Home Win', odds: 1.22 },
    ],
    totalOdds: 1.80,
    type: 'expert',
  },
  {
    id: 'qb3',
    title: 'High Risk High Reward',
    description: '4 underdog specials',
    matches: [
      { homeTeam: 'Watford', awayTeam: 'Man City', selection: 'Away Win', odds: 8.50 },
      { homeTeam: 'Burnley', awayTeam: 'Liverpool', selection: 'Home Win', odds: 9.00 },
      { homeTeam: 'Granada', awayTeam: 'Real Madrid', selection: 'Draw', odds: 6.50 },
      { homeTeam: 'Cadiz', awayTeam: 'Barcelona', selection: 'Home Win', odds: 7.20 },
    ],
    totalOdds: 3564.60,
    type: 'trending',
  },
];

const QuickBetBuilder = () => {
  const [selectedBuilder, setSelectedBuilder] = useState<string | null>(null);
  const { addSelection, clearSelections } = useBetSlip();

  const getTypeIcon = (type: QuickBetOption['type']) => {
    switch (type) {
      case 'popular':
        return <Star className="h-4 w-4" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4" />;
      case 'expert':
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: QuickBetOption['type']) => {
    switch (type) {
      case 'popular':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'trending':
        return 'bg-green-500/20 text-green-500';
      case 'expert':
        return 'bg-blue-500/20 text-blue-500';
    }
  };

  const handleAddBuilder = (builder: QuickBetOption) => {
    clearSelections();
    
    builder.matches.forEach((match) => {
      const selectionType = match.selection.includes('Home') ? 'home' : 
                           match.selection.includes('Draw') ? 'draw' : 'home';
      
      addSelection({
        id: `${Date.now()}-${Math.random()}`,
        matchId: `${match.homeTeam}-${match.awayTeam}`,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        sport: 'Football',
        league: 'Premier League',
        selectionType: selectionType,
        selectionValue: match.selection,
        odds: match.odds,
        matchTime: new Date(Date.now() + Math.random() * 86400000).toISOString(),
      });
    });

    setSelectedBuilder(builder.id);
    
    toast.success('Quick Bet Added!', {
      description: `${builder.matches.length} selections added to your bet slip`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Quick Bet Builder</h2>
        <Badge variant="secondary" className="ml-auto">AI-Powered</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickBetOptions.map((builder) => (
          <Card 
            key={builder.id} 
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
              selectedBuilder === builder.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleAddBuilder(builder)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">{builder.title}</h3>
                  <p className="text-sm text-muted-foreground">{builder.description}</p>
                </div>
                <Badge className={getTypeColor(builder.type)}>
                  {getTypeIcon(builder.type)}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{builder.matches.length} selections</span>
                  <span className="font-bold text-primary">@{builder.totalOdds.toFixed(2)}</span>
                </div>

                <div className="space-y-1.5">
                  {builder.matches.slice(0, 3).map((match, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground">
                      {match.homeTeam} vs {match.awayTeam} • {match.selection}
                    </div>
                  ))}
                  {builder.matches.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{builder.matches.length - 3} more...
                    </div>
                  )}
                </div>
              </div>

              <Button 
                size="sm" 
                className="w-full"
                variant={selectedBuilder === builder.id ? "default" : "outline"}
              >
                {selectedBuilder === builder.id ? 'Added to Slip' : 'Add to Slip'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Quick bets are AI-generated based on current form, statistics, and betting trends
      </p>
    </div>
  );
};

export default QuickBetBuilder;
