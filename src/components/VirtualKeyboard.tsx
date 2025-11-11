import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Delete } from 'lucide-react';

interface VirtualKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
}

const VirtualKeyboard = ({ value, onChange, onClose }: VirtualKeyboardProps) => {
  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const handleNumberClick = (num: string) => {
    onChange(value + num);
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const handleQuickAmount = (amount: number) => {
    onChange(amount.toString());
  };

  return (
    <Card className="p-4 space-y-3">
      {/* Display */}
      <div className="bg-muted rounded-lg p-4 text-center">
        <div className="text-3xl font-bold">
          ₦{value || '0'}
        </div>
      </div>

      {/* Quick Amounts */}
      <div className="grid grid-cols-5 gap-2">
        {quickAmounts.map(amount => (
          <Button
            key={amount}
            variant="outline"
            size="sm"
            onClick={() => handleQuickAmount(amount)}
            className="text-xs"
          >
            {amount >= 1000 ? `${amount / 1000}k` : amount}
          </Button>
        ))}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <Button
            key={num}
            variant="outline"
            size="lg"
            onClick={() => handleNumberClick(num.toString())}
            className="text-xl font-semibold h-14"
          >
            {num}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="lg"
          onClick={handleClear}
          className="text-sm h-14"
        >
          Clear
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleNumberClick('0')}
          className="text-xl font-semibold h-14"
        >
          0
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={handleDelete}
          className="h-14"
        >
          <Delete className="h-5 w-5" />
        </Button>
      </div>

      {/* Action Buttons */}
      {onClose && (
        <Button
          variant="default"
          size="lg"
          onClick={onClose}
          className="w-full"
        >
          Done
        </Button>
      )}
    </Card>
  );
};

export default VirtualKeyboard;
