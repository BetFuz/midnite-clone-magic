import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Plus } from 'lucide-react';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { toast } from 'sonner';

interface BetBuilderMarket {
  id: string;
  category: string;
  options: Array<{
    id: string;
    label: string;
    odds: number;
  }>;
}

const BetBuilder = () => {
  const [selectedMatch] = useState({
    homeTeam: 'Man City',
    awayTeam: 'Arsenal',
    league: 'Premier League',
    time: 'Today 15:00',
  });

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const { addSelection } = useBetSlip();

  const markets: BetBuilderMarket[] = [
    {
      id: 'result',
      category: 'Match Result',
      options: [
        { id: 'home_win', label: 'Man City Win', odds: 1.45 },
        { id: 'draw', label: 'Draw', odds: 4.20 },
        { id: 'away_win', label: 'Arsenal Win', odds: 6.50 },
      ],
    },
    {
      id: 'goals',
      category: 'Total Goals',
      options: [
        { id: 'over_1.5', label: 'Over 1.5 Goals', odds: 1.22 },
        { id: 'over_2.5', label: 'Over 2.5 Goals', odds: 1.75 },
        { id: 'over_3.5', label: 'Over 3.5 Goals', odds: 2.80 },
        { id: 'btts', label: 'Both Teams To Score', odds: 1.85 },
      ],
    },
    {
      id: 'players',
      category: 'Player Markets',
      options: [
        { id: 'haaland_score', label: 'Haaland To Score', odds: 1.65 },
        { id: 'saka_score', label: 'Saka To Score', odds: 3.20 },
        { id: 'debruyne_assist', label: 'De Bruyne Assist', odds: 2.10 },
        { id: 'jesus_score', label: 'Jesus To Score', odds: 2.80 },
      ],
    },
    {
      id: 'cards',
      category: 'Cards & Corners',
      options: [
        { id: 'over_3_cards', label: 'Over 3.5 Cards', odds: 1.90 },
        { id: 'over_9_corners', label: 'Over 9.5 Corners', odds: 1.85 },
        { id: 'red_card', label: 'Red Card Shown', odds: 3.50 },
      ],
    },
  ];

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const getSelectedOptionsWithOdds = () => {
    const allOptions = markets.flatMap(m => m.options);
    return selectedOptions.map(id => allOptions.find(o => o.id === id)!).filter(Boolean);
  };

  const calculateCombinedOdds = () => {
    const options = getSelectedOptionsWithOdds();
    return options.reduce((acc, opt) => acc * opt.odds, 1);
  };

  const handleAddToSlip = () => {
    if (selectedOptions.length === 0) {
      toast.error('No Selections', {
        description: 'Please select at least one option to build your bet',
      });
      return;
    }

    const options = getSelectedOptionsWithOdds();
    const combinedOdds = calculateCombinedOdds();
    const selectionLabel = options.map(o => o.label).join(' + ');

    addSelection({
      id: `${Date.now()}-${Math.random()}`,
      matchId: 'bet-builder-1',
      homeTeam: selectedMatch.homeTeam,
      awayTeam: selectedMatch.awayTeam,
      sport: 'Football',
      league: selectedMatch.league,
      selectionType: 'home',
      selectionValue: `Bet Builder: ${selectionLabel}`,
      odds: parseFloat(combinedOdds.toFixed(2)),
      matchTime: new Date(Date.now() + Math.random() * 86400000).toISOString(),
    });

    toast.success('Bet Builder Added!', {
      description: `${selectedOptions.length} selections combined @${combinedOdds.toFixed(2)}`,
    });

    setSelectedOptions([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Bet Builder</h2>
        <Badge variant="secondary" className="ml-auto">Custom</Badge>
      </div>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="space-y-1">
          <h3 className="font-semibold">
            {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{selectedMatch.league}</span>
            <span>•</span>
            <span>{selectedMatch.time}</span>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {markets.map((market) => (
          <Card key={market.id} className="p-4">
            <h3 className="font-semibold mb-3">{market.category}</h3>
            <div className="space-y-2">
              {market.options.map((option) => {
                const isSelected = selectedOptions.includes(option.id);
                return (
                  <div
                    key={option.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleOption(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isSelected} />
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{option.odds}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {selectedOptions.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                {selectedOptions.length} Selection{selectedOptions.length > 1 ? 's' : ''}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOptions([])}>
                Clear All
              </Button>
            </div>

            <div className="space-y-1">
              {getSelectedOptionsWithOdds().map((option) => (
                <div key={option.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{option.label}</span>
                  <span className="font-semibold">{option.odds}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Combined Odds</span>
                <span className="text-2xl font-bold text-primary">
                  {calculateCombinedOdds().toFixed(2)}
                </span>
              </div>

              <Button className="w-full" size="lg" onClick={handleAddToSlip}>
                <Plus className="h-4 w-4 mr-2" />
                Add To Bet Slip
              </Button>
            </div>
          </div>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Build your perfect bet by combining multiple markets from the same match
      </p>
    </div>
  );
};

export default BetBuilder;
