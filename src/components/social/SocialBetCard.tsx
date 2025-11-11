import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Copy, Share2, User } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { formatDistanceToNow } from "date-fns";
import type { SocialBet } from "@/hooks/useSocialBetting";

interface SocialBetCardProps {
  bet: SocialBet;
  isFollowing: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  onLike: () => void;
  onCopy: () => void;
  currentUserId?: string;
}

const SocialBetCard = ({
  bet,
  isFollowing,
  onFollow,
  onUnfollow,
  onLike,
  onCopy,
  currentUserId,
}: SocialBetCardProps) => {
  const isOwnBet = currentUserId === bet.user_id;
  const userName = bet.profiles?.full_name || bet.profiles?.email?.split('@')[0] || 'Anonymous';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      {/* User Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-foreground">{userName}</h4>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(bet.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        {!isOwnBet && (
          <Button
            variant={isFollowing ? "secondary" : "default"}
            size="sm"
            onClick={isFollowing ? onUnfollow : onFollow}
          >
            <User className="h-4 w-4 mr-1" />
            {isFollowing ? "Following" : "Follow"}
          </Button>
        )}
      </div>

      {/* Caption */}
      {bet.caption && (
        <p className="text-sm text-foreground mb-3">{bet.caption}</p>
      )}

      {/* Bet Details */}
      <div className="bg-muted rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Odds</p>
            <p className="text-lg font-bold text-primary">
              {bet.bet_slips?.total_odds.toFixed(2)}x
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Stake</p>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(bet.bet_slips?.total_stake || 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Potential Win</p>
            <p className="text-lg font-bold text-green-500">
              {formatCurrency(bet.bet_slips?.potential_win || 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <Badge variant={
              bet.bet_slips?.status === 'won' ? 'default' :
              bet.bet_slips?.status === 'lost' ? 'destructive' :
              'secondary'
            }>
              {bet.bet_slips?.status || 'pending'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-2"
          onClick={onLike}
        >
          <Heart className="h-4 w-4" />
          <span>{bet.likes_count}</span>
        </Button>
        
        {!isOwnBet && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-2"
            onClick={onCopy}
          >
            <Copy className="h-4 w-4" />
            Copy ({bet.copies_count})
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            navigator.clipboard.writeText(window.location.origin + '/social');
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default SocialBetCard;