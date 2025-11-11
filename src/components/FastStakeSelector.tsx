import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';

interface FastStakeSelectorProps {
  currentStake: number;
  onStakeChange: (stake: number) => void;
  balance?: number;
}

const FastStakeSelector = ({ currentStake, onStakeChange, balance = 10000 }: FastStakeSelectorProps) => {
  const quickStakes = [100, 500, 1000, 2000, 5000];
  const percentageStakes = [
    { label: '10%', value: balance * 0.1 },
    { label: '25%', value: balance * 0.25 },
    { label: '50%', value: balance * 0.5 },
    { label: 'Max', value: balance },
  ];

  return (
    <Card className="p-4 space-y-3">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Quick Stake</h3>
        <div className="grid grid-cols-5 gap-2">
          {quickStakes.map((stake) => (
            <Button
              key={stake}
              variant={currentStake === stake ? "default" : "outline"}
              size="sm"
              onClick={() => onStakeChange(stake)}
              className="text-xs"
            >
              {formatCurrency(stake)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">% of Balance</h3>
        <div className="grid grid-cols-4 gap-2">
          {percentageStakes.map((stake) => (
            <Button
              key={stake.label}
              variant={Math.abs(currentStake - stake.value) < 1 ? "default" : "outline"}
              size="sm"
              onClick={() => onStakeChange(Math.floor(stake.value))}
              className="text-xs"
            >
              {stake.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Balance</span>
          <span className="font-semibold">{formatCurrency(balance)}</span>
        </div>
      </div>
    </Card>
  );
};

export default FastStakeSelector;
