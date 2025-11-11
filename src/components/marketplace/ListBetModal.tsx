import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/currency";
import { TrendingUp, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ListBetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  betSlip: {
    id: string;
    total_stake: number;
    potential_win: number;
    total_odds: number;
  };
  onConfirm: (askingPrice: number) => void;
  recommendedPrice: number;
}

const ListBetModal = ({
  open,
  onOpenChange,
  betSlip,
  onConfirm,
  recommendedPrice,
}: ListBetModalProps) => {
  const [askingPrice, setAskingPrice] = useState(recommendedPrice);
  const [pricePercentage, setPricePercentage] = useState(75);

  const minPrice = betSlip.total_stake * 0.5;
  const maxPrice = betSlip.total_stake * 1.5;
  
  const handleSliderChange = (value: number[]) => {
    setPricePercentage(value[0]);
    const calculatedPrice = minPrice + ((maxPrice - minPrice) * value[0]) / 100;
    setAskingPrice(Math.round(calculatedPrice * 100) / 100);
  };

  const handlePriceChange = (value: string) => {
    const price = parseFloat(value);
    if (!isNaN(price)) {
      setAskingPrice(price);
      const percentage = ((price - minPrice) / (maxPrice - minPrice)) * 100;
      setPricePercentage(Math.max(0, Math.min(100, percentage)));
    }
  };

  const potentialProfit = betSlip.potential_win - askingPrice;
  const buyerROI = ((potentialProfit / askingPrice) * 100).toFixed(1);
  const discount = ((1 - (askingPrice / betSlip.total_stake)) * 100).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>List Bet for Sale</DialogTitle>
          <DialogDescription>
            Set your asking price and list this bet on the marketplace
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bet Details */}
          <div className="bg-muted rounded-lg p-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Your Stake</p>
              <p className="text-lg font-bold">{formatCurrency(betSlip.total_stake)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Potential Win</p>
              <p className="text-lg font-bold text-green-500">
                {formatCurrency(betSlip.potential_win)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Odds</p>
              <p className="text-lg font-bold">{betSlip.total_odds.toFixed(2)}x</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Recommended</p>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(recommendedPrice)}
              </p>
            </div>
          </div>

          {/* Price Slider */}
          <div className="space-y-4">
            <Label>Set Your Asking Price</Label>
            <Slider
              value={[pricePercentage]}
              onValueChange={handleSliderChange}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(minPrice)}</span>
              <span>{formatCurrency(maxPrice)}</span>
            </div>
          </div>

          {/* Manual Price Input */}
          <div className="space-y-2">
            <Label htmlFor="price">Asking Price</Label>
            <Input
              id="price"
              type="number"
              value={askingPrice}
              onChange={(e) => handlePriceChange(e.target.value)}
              step="0.01"
              min={minPrice}
              max={maxPrice}
            />
          </div>

          {/* Buyer Value Preview */}
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-semibold">Buyer Gets:</p>
                <p className="text-sm">• {buyerROI}% Potential ROI</p>
                <p className="text-sm">• {discount}% Discount on original stake</p>
                <p className="text-sm">• {formatCurrency(potentialProfit)} potential profit</p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Info Box */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              The bet will be transferred to the buyer once purchased. You'll receive {formatCurrency(askingPrice)} immediately.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                onConfirm(askingPrice);
                onOpenChange(false);
              }}
              className="flex-1"
            >
              List for {formatCurrency(askingPrice)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListBetModal;