import { useState } from 'react';
import { useBets } from '@/hooks/useBets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export const BetPlacement = () => {
  const { createBet, isCreating } = useBets();
  const [stake, setStake] = useState<number>(1000);

  const handlePlaceBet = async () => {
    // Example bet selection
    const selections = [
      {
        match_id: 'match_123',
        home_team: 'Arsenal',
        away_team: 'Chelsea',
        sport: 'Football',
        league: 'Premier League',
        selection_type: 'match_winner',
        selection_value: 'Home Win',
        odds: 2.5,
        match_time: new Date().toISOString()
      }
    ];

    await createBet({ stake, selections });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Place Bet</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Stake Amount</label>
          <Input
            type="number"
            value={stake}
            onChange={(e) => setStake(Number(e.target.value))}
            min={100}
            step={100}
          />
        </div>

        <Button 
          onClick={handlePlaceBet} 
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? 'Placing Bet...' : `Place Bet (₦${stake.toLocaleString()})`}
        </Button>
      </div>
    </Card>
  );
};
