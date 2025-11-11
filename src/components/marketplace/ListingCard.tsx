import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, Clock, DollarSign, Target, User } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { formatDistanceToNow } from "date-fns";
import type { BetListing } from "@/hooks/useBetMarketplace";

interface ListingCardProps {
  listing: BetListing;
  onBuy: () => void;
  onCancel?: () => void;
  isOwnListing?: boolean;
}

const ListingCard = ({ listing, onBuy, onCancel, isOwnListing }: ListingCardProps) => {
  const userName = listing.profiles?.full_name || listing.profiles?.email?.split('@')[0] || 'Anonymous';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
  
  const potentialProfit = listing.potential_win - listing.asking_price;
  const profitPercentage = ((potentialProfit / listing.asking_price) * 100).toFixed(1);
  const discount = ((1 - (listing.asking_price / listing.original_stake)) * 100).toFixed(1);

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      {/* Seller Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-foreground">{userName}</h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        <Badge variant={listing.bet_slips?.status === 'pending' ? 'default' : 'secondary'}>
          {listing.bet_slips?.status || 'active'}
        </Badge>
      </div>

      {/* Pricing Grid */}
      <div className="bg-muted rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Original Stake</p>
            <p className="text-sm font-medium line-through text-muted-foreground">
              {formatCurrency(listing.original_stake)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Asking Price</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(listing.asking_price)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Potential Win</p>
            <p className="text-lg font-bold text-green-500">
              {formatCurrency(listing.potential_win)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Odds</p>
            <p className="text-lg font-bold text-foreground">
              {listing.bet_slips?.total_odds.toFixed(2)}x
            </p>
          </div>
        </div>
      </div>

      {/* Value Indicators */}
      <div className="flex gap-2 mb-4">
        <Badge variant="outline" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          +{profitPercentage}% ROI
        </Badge>
        <Badge variant="outline" className="gap-1">
          <DollarSign className="h-3 w-3" />
          {discount}% Discount
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Target className="h-3 w-3" />
          {formatCurrency(potentialProfit)} Profit
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {isOwnListing ? (
          <>
            <Button variant="secondary" className="flex-1" disabled>
              Your Listing
            </Button>
            {onCancel && (
              <Button variant="destructive" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </>
        ) : (
          <Button className="flex-1" onClick={onBuy}>
            Buy Now - {formatCurrency(listing.asking_price)}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ListingCard;