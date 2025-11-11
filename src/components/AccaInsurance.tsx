import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Check } from 'lucide-react';

interface AccaInsuranceProps {
  selectionCount: number;
  stake: number;
}

const AccaInsurance = ({ selectionCount, stake }: AccaInsuranceProps) => {
  // Acca insurance only available for 5+ selections
  if (selectionCount < 5) return null;

  const refundAmount = Math.min(stake, 5000); // Max refund ₦5,000

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 p-1.5">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold">Acca Insurance</h3>
          <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-cyan-500">
            Active
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              If exactly <span className="font-semibold">1 selection</span> loses, we'll refund your stake
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Applies to <span className="font-semibold">5+ fold</span> accumulators
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Maximum refund: <span className="font-semibold">₦5,000</span>
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-blue-500/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your Protection</span>
            <span className="text-lg font-bold text-blue-600">₦{refundAmount.toLocaleString()}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Bet with confidence - if just one lets you down, we've got you covered
        </p>
      </div>
    </Card>
  );
};

export default AccaInsurance;
