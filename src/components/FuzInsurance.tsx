import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Check } from 'lucide-react';

interface FuzInsuranceProps {
  selectionCount: number;
  stake: number;
}

const FuzInsurance = ({ selectionCount, stake }: FuzInsuranceProps) => {
  // Fuz insurance only available for 5+ selections
  if (selectionCount < 5) return null;

  const refundAmount = Math.min(stake, 5000); // Max refund ₦5,000

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 p-1.5">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold">Fuz Insurance</h3>
          <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-cyan-500">
            Active
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              If exactly 1 selection loses, get your stake back as a free bet up to ₦{refundAmount.toLocaleString()}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              {selectionCount >= 11 ? '100%' : selectionCount >= 8 ? '75%' : '50%'} refund on qualifying bets
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Refund credited within 24 hours as a free bet. Terms apply.
        </p>
      </div>
    </Card>
  );
};

export default FuzInsurance;
